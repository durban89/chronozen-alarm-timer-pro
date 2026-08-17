import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const sourceImagePath = '/home/daniel/.gemini/antigravity-cli/brain/400f12a4-258a-461c-818b-aa515844f2ea/chronozen_logo_icon_1786939865272.jpg';
const outputDir = path.resolve('./public/icon');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [16, 32, 48, 96, 128, 512];

async function generateIcons() {
  console.log('Generating ChronoZen icons from source logo...');

  for (const size of sizes) {
    const targetFile = path.join(outputDir, `${size}.png`);
    await sharp(sourceImagePath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 15, g: 23, b: 42, alpha: 1 }, // slate-950
      })
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(targetFile);
    console.log(`✓ Generated: ${size}x${size} -> ${targetFile}`);
  }

  // Also copy main logo for store / popup
  const mainLogoPath = path.resolve('./public/logo.png');
  await sharp(sourceImagePath)
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(mainLogoPath);
  console.log(`✓ Generated: Main logo -> ${mainLogoPath}`);

  console.log('All icons successfully generated!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
