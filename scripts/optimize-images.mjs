import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const profilesDir = path.resolve("src/content/profiles");
const supportedInputs = new Set([".png", ".jpg", ".jpeg"]);

const files = await readdir(profilesDir, { withFileTypes: true });

const imageFiles = files
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) => supportedInputs.has(path.extname(name).toLowerCase()));

if (imageFiles.length === 0) {
  console.log("No source images found in src/content/profiles.");
  process.exit(0);
}

for (const fileName of imageFiles) {
  const inputPath = path.join(profilesDir, fileName);
  const outputPath = path.join(profilesDir, `${path.parse(fileName).name}.webp`);

  await sharp(inputPath)
    .rotate()
    .resize({
      width: 1400,
      height: 1400,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: 82,
      effort: 5,
    })
    .toFile(outputPath);

  console.log(`Optimized ${fileName} -> ${path.basename(outputPath)}`);
}
