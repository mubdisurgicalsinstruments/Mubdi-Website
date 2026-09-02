import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const IMAGES_ROOT = path.join(ROOT, "public", "images");
const LFS_POINTER = "version https://git-lfs.github.com/spec/v1";

function listImageFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listImageFiles(abs, files);
      continue;
    }

    if (/\.(png|jpe?g|webp)$/i.test(entry.name)) {
      files.push(abs);
    }
  }

  return files;
}

function readHead(absPath, length = 64) {
  const fd = fs.openSync(absPath, "r");
  const buf = Buffer.alloc(length);
  const bytes = fs.readSync(fd, buf, 0, length, 0);
  fs.closeSync(fd);
  return buf.subarray(0, bytes);
}

function isLfsPointer(absPath) {
  const head = readHead(absPath).toString("utf8");
  return head.startsWith(LFS_POINTER);
}

function isPng(absPath) {
  const head = readHead(absPath, 8);
  return head.length >= 8 && head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
}

const logoPath = path.join(ROOT, "public", "logo.png");
const heroPath = path.join(ROOT, "public", "images", "mubdi-surgical-instruments-hero.png");
const productImages = listImageFiles(IMAGES_ROOT);

const required = [logoPath, heroPath, ...productImages];
const problems = [];

for (const absPath of required) {
  if (!fs.existsSync(absPath)) {
    problems.push(`missing: ${path.relative(ROOT, absPath)}`);
    continue;
  }

  if (isLfsPointer(absPath)) {
    problems.push(`lfs-pointer (not binary): ${path.relative(ROOT, absPath)}`);
    continue;
  }

  if (absPath.toLowerCase().endsWith(".png") && !isPng(absPath)) {
    problems.push(`invalid-png-header: ${path.relative(ROOT, absPath)}`);
  }
}

if (productImages.length < 500) {
  problems.push(`expected at least 500 product/site images, found ${productImages.length}`);
}

if (problems.length > 0) {
  console.error("Public image verification failed:");
  for (const problem of problems.slice(0, 20)) {
    console.error(`  - ${problem}`);
  }
  if (problems.length > 20) {
    console.error(`  - ...and ${problems.length - 20} more`);
  }
  console.error("Run: git lfs install && git lfs pull");
  process.exit(1);
}

console.log(`Verified ${productImages.length} public images (binary files, not Git LFS pointers).`);
