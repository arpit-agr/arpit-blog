// scripts/update-book-colors.mjs
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust this if your books.json is somewhere else
// We assume this script is in /scripts/, so we go up one level (..) to root
const BOOKS_FILE = path.join(__dirname, "../src/data/books.json");

console.log("Script started..."); // 1. Proof of life

async function getDominantColor(imagePath) {
	try {
		// Clean the path: remove leading slash if present
		const cleanPath = imagePath.replace(/^\//, "");

		// Resolve absolute path from project root (process.cwd())
		const absolutePath = path.resolve(process.cwd(), cleanPath);

		// Check if file exists before asking Sharp
		try {
			await fs.access(absolutePath);
		} catch {
			console.warn(`⚠️  Image not found on disk: ${absolutePath}`);
			return null;
		}

		const { dominant } = await sharp(absolutePath).stats();

		const r = dominant.r.toString(16).padStart(2, "0");
		const g = dominant.g.toString(16).padStart(2, "0");
		const b = dominant.b.toString(16).padStart(2, "0");

		return `#${r}${g}${b}`;
	} catch (error) {
		console.error(`❌ Error processing ${imagePath}:`, error.message);
		return null;
	}
}

async function main() {
	console.log(`📂 Reading books from: ${BOOKS_FILE}`);

	try {
		const rawData = await fs.readFile(BOOKS_FILE, "utf-8");
		const books = JSON.parse(rawData);
		let updatedCount = 0;

		console.log(
			`🔍 Found ${books.length} books. Checking for missing colors...`,
		);

		for (const book of books) {
			// Only run if cover exists AND color is missing
			if (book.cover && !book.dominantColor) {
				process.stdout.write(`Processing ${book.title}... `); // Print without newline
				const color = await getDominantColor(book.cover);

				if (color) {
					book.dominantColor = color;
					updatedCount++;
					console.log(`✅ ${color}`);
				} else {
					console.log(`skipped (failed to extract)`);
				}
			}
		}

		if (updatedCount > 0) {
			await fs.writeFile(BOOKS_FILE, JSON.stringify(books, null, 2));
			console.log(`✨ Successfully updated ${updatedCount} books.`);
		} else {
			console.log("✨ All books already have colors.");
		}
	} catch (e) {
		console.error("🔥 FATAL ERROR:", e);
		process.exit(1);
	}
}

// Execute main logic
main();
