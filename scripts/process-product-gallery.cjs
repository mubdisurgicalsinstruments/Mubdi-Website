/**
 * Reusable product gallery image processor.
 *
 * Usage:
 *   node scripts/process-product-gallery.mjs <category> <subcategory> <product-slug>
 *
 * Finds ONE source image in:
 *   public/images/products/{category}/{subcategory}/{product-slug}/
 * (any random filename; png/jpg/jpeg/webp — not image-{1-4}.webp)
 *
 * Writes:
 *   image-1.webp  — full instrument (complete source composition → WebP)
 *   image-2.webp  — finger/handle close-up
 *   image-3.webp  — center/pivot/engraving close-up
 *   image-4.webp  — working-end / tip close-up
 *
 * Does not modify website gallery components. Relies on existing
 * getProductImages() preferring exact image-N.webp filenames.
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SOURCE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".PNG", ".JPG", ".JPEG", ".WEBP"]);
const OUTPUT_NAMES = ["image-1.webp", "image-2.webp", "image-3.webp", "image-4.webp"];
const MIN_CROP_PX = 220;
const WEBP_QUALITY = 86;

function productsRoot() {
  return path.join(process.cwd(), "public", "images", "products");
}

function listFiles(dir) {
  return fs.readdirSync(dir).filter((name) => {
    const full = path.join(dir, name);
    return fs.statSync(full).isFile();
  });
}

function isGeneratedOutput(name) {
  return (
    OUTPUT_NAMES.includes(name) ||
    name.startsWith("_debug-") ||
    name.startsWith("_preview-")
  );
}

function findSourceImage(dir) {
  const candidates = listFiles(dir).filter((name) => {
    if (isGeneratedOutput(name)) return false;
    const ext = path.extname(name);
    return SOURCE_EXTS.has(ext);
  });

  if (candidates.length === 0) {
    throw new Error(`No source image found in ${dir}`);
  }
  if (candidates.length > 1) {
    // Prefer largest file as the edited master.
    candidates.sort(
      (a, b) => fs.statSync(path.join(dir, b)).size - fs.statSync(path.join(dir, a)).size,
    );
  }
  return candidates[0];
}

async function findInstrumentBounds(sourcePath) {
  const { data, info } = await sharp(sourcePath)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let count = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = (r + g + b) / 3;
      const isNavy = b > r + 15 && b > g + 10 && lum < 80;
      const isContent = lum > 70 && !isNavy;
      if (!isContent) continue;
      count += 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (count < 500) {
    throw new Error("Could not locate instrument content in source image (too little signal).");
  }

  return { minX, minY, maxX, maxY, width, height, count };
}

function clampCrop(crop, frameW, frameH) {
  let { left, top, width, height } = crop;
  left = Math.max(0, Math.floor(left));
  top = Math.max(0, Math.floor(top));
  width = Math.floor(width);
  height = Math.floor(height);
  if (left + width > frameW) width = frameW - left;
  if (top + height > frameH) height = frameH - top;
  return { left, top, width, height };
}

/**
 * Build three detail crops from instrument bbox.
 * Scissors product photos are typically horizontal: tips ← → handles.
 * Engraving sits between pivot and handles (right-of-center).
 */
function buildDetailCrops(bounds) {
  const { minX, minY, maxX, maxY, width: frameW, height: frameH } = bounds;
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;

  // Square-ish windows sized to instrument height (with slight expansion).
  const side = Math.max(MIN_CROP_PX, Math.round(bh * 1.15));

  function windowAt(centerX, centerY) {
    const half = side / 2;
    return clampCrop(
      {
        left: centerX - half,
        top: centerY - half,
        width: side,
        height: side,
      },
      frameW,
      frameH,
    );
  }

  const cy = minY + bh / 2;

  // Handles / finger rings — right end of instrument.
  const handle = windowAt(minX + bw * 0.86, cy);
  // Pivot / engraving — true center (pivot screw + model markings).
  const pivot = windowAt(minX + bw * 0.5, cy);
  // Curved tips / working end — left end of instrument.
  const tip = windowAt(minX + bw * 0.14, cy);

  return { handle, pivot, tip };
}

function assertCropUsable(label, crop) {
  if (crop.width < MIN_CROP_PX || crop.height < MIN_CROP_PX) {
    throw new Error(
      `${label} crop too small (${crop.width}x${crop.height}). Source resolution insufficient for a clean detail crop.`,
    );
  }
}

async function writeWebp(pipeline, outPath) {
  await pipeline.webp({ quality: WEBP_QUALITY, effort: 4 }).toFile(outPath);
  const meta = await sharp(outPath).metadata();
  return { path: outPath, width: meta.width, height: meta.height, bytes: fs.statSync(outPath).size };
}

async function processProduct(category, subcategory, slug) {
  const dir = path.join(productsRoot(), category, subcategory, slug);
  if (!fs.existsSync(dir)) {
    throw new Error(`Product folder not found: ${dir}`);
  }

  const sourceName = findSourceImage(dir);
  const sourcePath = path.join(dir, sourceName);
  const sourceMeta = await sharp(sourcePath).metadata();

  const bounds = await findInstrumentBounds(sourcePath);
  const crops = buildDetailCrops(bounds);
  assertCropUsable("image-2 (handles)", crops.handle);
  assertCropUsable("image-3 (pivot)", crops.pivot);
  assertCropUsable("image-4 (tips)", crops.tip);

  const out1 = path.join(dir, "image-1.webp");
  const out2 = path.join(dir, "image-2.webp");
  const out3 = path.join(dir, "image-3.webp");
  const out4 = path.join(dir, "image-4.webp");

  // Hero: full source composition → WebP (no crop; preserves Mubdi edit).
  const hero = await writeWebp(sharp(sourcePath).rotate(), out1);

  const t2 = await writeWebp(sharp(sourcePath).extract(crops.handle), out2);
  const t3 = await writeWebp(sharp(sourcePath).extract(crops.pivot), out3);
  const t4 = await writeWebp(sharp(sourcePath).extract(crops.tip), out4);

  return {
    folder: dir,
    source: {
      filename: sourceName,
      format: sourceMeta.format,
      width: sourceMeta.width,
      height: sourceMeta.height,
      bytes: fs.statSync(sourcePath).size,
    },
    bounds,
    crops,
    outputs: {
      "image-1.webp": hero,
      "image-2.webp": t2,
      "image-3.webp": t3,
      "image-4.webp": t4,
    },
  };
}

async function main() {
  const [category, subcategory, slug] = process.argv.slice(2);
  if (!category || !subcategory || !slug) {
    console.error("Usage: node scripts/process-product-gallery.mjs <category> <subcategory> <product-slug>");
    process.exit(1);
  }

  const report = await processProduct(category, subcategory, slug);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
