#!/usr/bin/env node

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const yamlPath = path.join(projectRoot, "src", "data", "books.yaml");
const coversDir = path.join(projectRoot, "public", "covers");

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getSourceImage(book) {
  if (typeof book.sourceImage === "string" && book.sourceImage.trim()) {
    return book.sourceImage.trim();
  }

  if (
    typeof book.image === "string" &&
    book.image.trim() &&
    /^https?:\/\//i.test(book.image)
  ) {
    return book.image.trim();
  }

  return null;
}

function getExtFromUrl(url) {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    if (pathname.endsWith(".png")) {
      return ".png";
    }
    if (pathname.endsWith(".webp")) {
      return ".webp";
    }
    return ".jpg";
  } catch {
    return ".jpg";
  }
}

async function downloadToFile(url, destinationPath) {
  try {
    await access(destinationPath);
    return "skipped";
  } catch {
    // Continue when file does not exist yet.
  }

  const response = await fetch(url, {
    headers: {
      "user-agent": "book-tier-list-cover-fetcher/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(destinationPath, bytes);
  return "downloaded";
}

async function main() {
  await mkdir(coversDir, { recursive: true });

  const yamlText = await readFile(yamlPath, "utf8");
  const data = parse(yamlText);

  const rankBooks = Object.values(data?.ranks ?? {}).flatMap((entry) =>
    Array.isArray(entry) ? entry : [],
  );
  const queueBooks = Array.isArray(data?.want_to_read) ? data.want_to_read : [];
  const books = [...rankBooks, ...queueBooks];

  let downloaded = 0;
  let skipped = 0;
  let updated = 0;

  for (let index = 0; index < books.length; index += 1) {
    const book = books[index];
    const sourceImage = getSourceImage(book);

    if (!sourceImage) {
      continue;
    }

    const title = typeof book.title === "string" ? book.title : `book-${index + 1}`;
    const author = typeof book.author === "string" ? book.author : "unknown";
    const base = slugify(`${title}-${author}`);
    const ext = getExtFromUrl(sourceImage);
    const filename = `${base}${ext}`;
    const localPath = `/covers/${filename}`;
    const outFile = path.join(coversDir, filename);

    if (book.image !== localPath || book.sourceImage !== sourceImage) {
      book.image = localPath;
      book.sourceImage = sourceImage;
      updated += 1;
    }

    try {
      const result = await downloadToFile(sourceImage, outFile);
      if (result === "downloaded") {
        downloaded += 1;
        console.log(`Downloaded ${filename}`);
      } else {
        skipped += 1;
        console.log(`Skipped ${filename} (already exists)`);
      }
    } catch (error) {
      console.error(`Failed to download ${sourceImage}: ${error.message}`);
    }
  }

  await writeFile(yamlPath, stringify(data, { lineWidth: 0 }), "utf8");

  console.log(`\nUpdated ${updated} book records.`);
  console.log(`Downloaded ${downloaded} cover files.`);
  console.log(`Skipped ${skipped} existing cover files.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
