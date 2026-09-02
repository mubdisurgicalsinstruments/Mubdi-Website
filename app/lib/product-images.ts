/**
 * Product gallery images are ALWAYS derived from:
 *   category slug + subcategory slug + product slug
 *
 * Preferred folder convention:
 *   /images/products/{category}/{subcategory}/{product-slug}/image-{1-4}.webp
 *
 * Flat-file exception (e.g. orthognathic/genioplasty-instruments):
 *   /images/products/{category}/{subcategory}/{product-slug}.webp
 *
 * Resolution (global, not per-product):
 * 1. Prefer exact `image-N.webp` when present on disk.
 * 2. Otherwise use the first file whose name starts with `image-N.`
 *    (handles OS double-extension saves without renaming files).
 * 3. For the hero (slot 1), if no `image-1.*` exists, use the newest
 *    primary product image in the folder (original generated filename).
 * 4. Missing thumbnail slots fall back to the resolved hero so listing,
 *    detail, and gallery all share the same active product image.
 * 5. If nothing is available, return the shared placeholder — never a 404 URL.
 *
 * Never hardcode per-product image paths.
 */

import fs from "node:fs";
import path from "node:path";
import { PRODUCT_IMAGE_PLACEHOLDER } from "./product-image-constants";

export { PRODUCT_IMAGE_PLACEHOLDER } from "./product-image-constants";

export type ProductGalleryImages = {
  hero: string;
  thumbnails: readonly [string, string, string];
};

const PRODUCTS_ROOT = path.join(process.cwd(), "public", "images", "products");
const SLOT_FILE_RE = /^image-[1-4]\./i;
const IMAGE_FILE_RE = /\.(png|jpe?g|webp)$/i;

/** Subcategories whose product images are flat files in the subcategory folder (not per-product dirs). */
const FLAT_PRODUCT_IMAGE_SUBCATEGORIES = new Set(["orthognathic/genioplasty-instruments"]);

/**
 * Catalog product slugs that map to a different on-disk filename/folder stem
 * (assets are matched by filename, not renamed).
 */
const FLAT_PRODUCT_SLUG_ALIASES: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  "orthognathic/genioplasty-instruments": {
    "genioplasty-cutting-guide": "chin-osteotomy-periosteal-elevator",
  },
};

const FLAT_PRODUCT_IMAGE_EXTENSIONS = [".webp", ".png", ".jpg", ".jpeg"] as const;

type Slot = 1 | 2 | 3 | 4;

function listFolderFiles(folderAbs: string): string[] {
  try {
    if (!fs.existsSync(folderAbs) || !fs.statSync(folderAbs).isDirectory()) {
      return [];
    }
    return fs.readdirSync(folderAbs).filter((name) => {
      try {
        return fs.statSync(path.join(folderAbs, name)).isFile();
      } catch {
        return false;
      }
    });
  } catch {
    return [];
  }
}

function resolveSlotFilename(files: string[], slot: Slot): string | null {
  const preferred = `image-${slot}.webp`;
  if (files.includes(preferred)) {
    return preferred;
  }

  const prefix = `image-${slot}.`;
  const matches = files.filter((name) => name.startsWith(prefix));
  if (matches.length === 0) {
    return null;
  }

  matches.sort((a, b) => a.length - b.length || a.localeCompare(b));
  return matches[0] ?? null;
}

/** Newest finalized product image kept under its original generated filename. */
function resolvePrimaryFilename(folderAbs: string, files: string[]): string | null {
  const candidates = files.filter(
    (name) => !SLOT_FILE_RE.test(name) && IMAGE_FILE_RE.test(name),
  );
  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((a, b) => {
    const aTime = fs.statSync(path.join(folderAbs, a)).mtimeMs;
    const bTime = fs.statSync(path.join(folderAbs, b)).mtimeMs;
    if (bTime !== aTime) return bTime - aTime;
    const aPng = a.toLowerCase().endsWith(".png") ? 0 : 1;
    const bPng = b.toLowerCase().endsWith(".png") ? 0 : 1;
    return aPng - bPng || a.localeCompare(b);
  });

  return candidates[0] ?? null;
}

/** Normalize a folder name the same way catalog slugs are formed. */
function normalizeFolderSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function editDistanceOne(a: string, b: string): boolean {
  if (a === b) return true;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;

  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (la > lb) i += 1;
    else if (lb > la) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }
  edits += la - i + (lb - j);
  return edits <= 1;
}

function listChildDirectories(absPath: string): string[] {
  try {
    if (!fs.existsSync(absPath) || !fs.statSync(absPath).isDirectory()) {
      return [];
    }
    return fs.readdirSync(absPath).filter((name) => {
      try {
        return fs.statSync(path.join(absPath, name)).isDirectory();
      } catch {
        return false;
      }
    });
  } catch {
    return [];
  }
}

/**
 * Resolve the on-disk category folder name for a catalog slug.
 * Exact match first; if missing, accept a unique 1-character typo
 * (e.g. `laparoscopic` → `laparscopic`). Never picks among multiple candidates.
 */
function resolveCategoryDirName(categorySlug: string): string {
  const preferredAbs = path.join(PRODUCTS_ROOT, categorySlug);
  if (fs.existsSync(preferredAbs) && fs.statSync(preferredAbs).isDirectory()) {
    return categorySlug;
  }

  const dirs = listChildDirectories(PRODUCTS_ROOT);
  const exact = dirs.find((name) => normalizeFolderSlug(name) === categorySlug);
  if (exact) return exact;

  const near = dirs.filter((name) =>
    editDistanceOne(normalizeFolderSlug(name), categorySlug),
  );
  if (near.length === 1) {
    return near[0]!;
  }

  return categorySlug;
}

/**
 * Resolve the on-disk subcategory folder name for a catalog slug.
 * Example: slug `scalpels-accessories` → folder `scalpels-&-accessories`.
 */
function resolveSubcategoryDirName(
  categorySlug: string,
  subcategorySlug: string,
): string {
  const categoryDir = resolveCategoryDirName(categorySlug);
  const preferredAbs = path.join(PRODUCTS_ROOT, categoryDir, subcategorySlug);
  if (fs.existsSync(preferredAbs) && fs.statSync(preferredAbs).isDirectory()) {
    return subcategorySlug;
  }

  const categoryAbs = path.join(PRODUCTS_ROOT, categoryDir);
  try {
    if (!fs.existsSync(categoryAbs) || !fs.statSync(categoryAbs).isDirectory()) {
      return subcategorySlug;
    }

    const match = fs
      .readdirSync(categoryAbs)
      .filter((name) => {
        try {
          return fs.statSync(path.join(categoryAbs, name)).isDirectory();
        } catch {
          return false;
        }
      })
      .find((name) => normalizeFolderSlug(name) === subcategorySlug);

    return match ?? subcategorySlug;
  } catch {
    return subcategorySlug;
  }
}

function encodePathSegment(segment: string): string {
  return encodeURIComponent(segment).replace(/%2F/gi, "/");
}

function isFlatProductImageSubcategory(categorySlug: string, subcategorySlug: string): boolean {
  return FLAT_PRODUCT_IMAGE_SUBCATEGORIES.has(`${categorySlug}/${subcategorySlug}`);
}

function resolveFlatProductFilename(files: string[], productSlug: string): string | null {
  for (const extension of FLAT_PRODUCT_IMAGE_EXTENSIONS) {
    const preferred = `${productSlug}${extension}`;
    if (files.includes(preferred)) {
      return preferred;
    }
  }

  const matches = files.filter((name) => {
    if (!IMAGE_FILE_RE.test(name)) {
      return false;
    }

    const stem = name.replace(/\.(png|jpe?g|webp)$/i, "");
    return stem === productSlug;
  });

  if (matches.length === 0) {
    return null;
  }

  matches.sort((a, b) => {
    const aWebp = a.toLowerCase().endsWith(".webp") ? 0 : 1;
    const bWebp = b.toLowerCase().endsWith(".webp") ? 0 : 1;
    return aWebp - bWebp || a.localeCompare(b);
  });

  return matches[0] ?? null;
}

function listSubcategoryEntries(subcategoryAbs: string): string[] {
  try {
    if (!fs.existsSync(subcategoryAbs) || !fs.statSync(subcategoryAbs).isDirectory()) {
      return [];
    }
    return fs.readdirSync(subcategoryAbs);
  } catch {
    return [];
  }
}

function flatDirectoryStem(entry: string): string {
  return entry.replace(/\.(png|jpe?g|webp)$/i, "");
}

function matchesFlatProductStem(entry: string, stem: string): boolean {
  return normalizeFolderSlug(flatDirectoryStem(entry)) === normalizeFolderSlug(stem);
}

function resolveFlatProductRelativePath(
  subcategoryAbs: string,
  categorySlug: string,
  subcategorySlug: string,
  productSlug: string,
): string | null {
  const aliasKey = `${categorySlug}/${subcategorySlug}`;
  const aliasStem = FLAT_PRODUCT_SLUG_ALIASES[aliasKey]?.[productSlug];
  const stems = aliasStem ? [productSlug, aliasStem] : [productSlug];
  const files = listFolderFiles(subcategoryAbs);

  for (const stem of stems) {
    const directFile = resolveFlatProductFilename(files, stem);
    if (directFile) {
      return directFile;
    }
  }

  for (const stem of stems) {
    for (const entry of listSubcategoryEntries(subcategoryAbs)) {
      const entryAbs = path.join(subcategoryAbs, entry);
      try {
        if (!fs.statSync(entryAbs).isDirectory() || !matchesFlatProductStem(entry, stem)) {
          continue;
        }
      } catch {
        continue;
      }

      const innerFiles = listFolderFiles(entryAbs);
      const innerImage = resolvePrimaryFilename(entryAbs, innerFiles);
      if (innerImage) {
        return `${entry}/${innerImage}`;
      }
    }
  }

  return null;
}

function toFlatProductPublicUrl(
  categorySlug: string,
  subcategorySlug: string,
  relativePath: string,
): string {
  const categoryDir = resolveCategoryDirName(categorySlug);
  const subcategoryDir = resolveSubcategoryDirName(categorySlug, subcategorySlug);
  const encodedRelative = relativePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `/images/products/${encodePathSegment(categoryDir)}/${encodePathSegment(subcategoryDir)}/${encodedRelative}`;
}

function getFlatProductImages(
  categorySlug: string,
  subcategorySlug: string,
  productSlug: string,
): ProductGalleryImages {
  const categoryDir = resolveCategoryDirName(categorySlug);
  const subcategoryDir = resolveSubcategoryDirName(categorySlug, subcategorySlug);
  const subcategoryAbs = path.join(PRODUCTS_ROOT, categoryDir, subcategoryDir);
  const relativePath = resolveFlatProductRelativePath(
    subcategoryAbs,
    categorySlug,
    subcategorySlug,
    productSlug,
  );

  if (!relativePath) {
    return {
      hero: PRODUCT_IMAGE_PLACEHOLDER,
      thumbnails: [PRODUCT_IMAGE_PLACEHOLDER, PRODUCT_IMAGE_PLACEHOLDER, PRODUCT_IMAGE_PLACEHOLDER],
    };
  }

  const hero = toFlatProductPublicUrl(categorySlug, subcategorySlug, relativePath);
  return {
    hero,
    thumbnails: [hero, hero, hero],
  };
}

/** On-disk product folder names that differ from catalog slugs (assets left unchanged). */
const PRODUCT_DIR_ALIASES: Readonly<
  Record<string, Readonly<Record<string, Readonly<Record<string, string>>>>>
> = {
  gynecology: {
    "curettes-dilators": {
      "bumm-uterine-curette": "bumm-uterine-suction",
      "simon-uterine-curette": "simon-uterine-currete",
    },
    scissors: {
      "littauer-suture-scissors": "braun-episiotomy-scissors",
    },
  },
  laparoscopic: {
    dissectors: {
      "maryland-dissector": "01 - Maryland Dissector",
      "right-angle-dissector": "02 - Right Angle Dissector",
      "dolphin-nose-dissector": "03 - Dolphin Nose Dissector",
      "tapered-dissector": "04 - Tapered Dissector",
      "blunt-tip-dissector": "05 - Blunt Tip Dissector",
      "curved-dissector": "06 - Curved Dissector",
      "mixter-dissector": "07 - Mixter Dissector",
      "kelly-dissector": "08 - Kelly Dissector",
      "needle-nose-dissector": "09 - Needle Nose Dissector",
      "micro-dissecting-forceps": "10- Micro Dissecting Forceps",
    },
  },
  orthognathic: {
    "le-fort-i-maxillary-osteotomy-instruments": {
      "le-fort-i-osteotome": "blade-osteotome",
      "maxillary-le-fort-i-retractor": "le-fort-i-posterior-retractor",
    },
    "bsso-mandibular-osteotomy-instruments": {
      "bsso-splitting-osteotome": "01-bsso-splitting-osteotome",
      "obwegeser-split-osteotome": "02-obwegeser-split-osteotome",
      "bsso-chisel": "03-bsso-chisel",
      "curved-steinhauser-osteotome": "04-curved-steinhauser-osteotome",
      "obwegeser-ramus-retractor": "05-obwegeser-ramus-retractor",
      "hargis-anterior-border-stripper": "06-hargis-anterior-border-stripper",
      "mandibular-ramus-retractor": "07-mandibular-ramus-retractor",
      "smith-ramus-separator": "08-smith-ramus-separator",
      "obwegeser-channel-retractor": "09-obwegeser-channel-retractor",
      "obwegeser-j-stripper": "10-obwegeser-j-stripper",
    },
  },
  orthopedic: {
    "bone-holding-instruments": {
      "weber-bone-clamp": "weber-bone-holding-forceps",
    },
    "bone-elevators-osteotomes": {
      "ferguson-bone-lever": "fergusson-bone-holding-forceps",
    },
    "bone-drills-measuring-instruments": {
      "jacob-s-chuck": "bone-hand-drill-with-jacobs-chuck",
      "t-handle-chuck": "T-handle-bone-drill",
      "hand-drill": "bone-awl",
      "bone-awl": "bone-tap",
      "bone-tap": "depth-gauge",
      "depth-gauge": "bone-reamer",
      "screwdriver-handle": "trephine",
      "ao-screwdriver": "kirschner-wire-drill",
      "wire-tightener": "wire-tightener",
      "plate-bending-iron": "plate-bending-iron",
    },
  },
};

/**
 * Resolve the on-disk product folder name for a catalog slug.
 * Exact match first, then scoped aliases, normalized slug match, then a unique 1-char typo.
 */
function resolveProductDirName(
  categorySlug: string,
  subcategorySlug: string,
  productSlug: string,
): string {
  const categoryDir = resolveCategoryDirName(categorySlug);
  const subcategoryDir = resolveSubcategoryDirName(categorySlug, subcategorySlug);
  const subcategoryAbs = path.join(PRODUCTS_ROOT, categoryDir, subcategoryDir);

  const alias = PRODUCT_DIR_ALIASES[categorySlug]?.[subcategorySlug]?.[productSlug];
  if (alias) {
    const aliasAbs = path.join(subcategoryAbs, alias);
    if (fs.existsSync(aliasAbs) && fs.statSync(aliasAbs).isDirectory()) {
      return alias;
    }
  }

  const preferredAbs = path.join(subcategoryAbs, productSlug);
  if (fs.existsSync(preferredAbs) && fs.statSync(preferredAbs).isDirectory()) {
    return productSlug;
  }

  try {
    if (!fs.existsSync(subcategoryAbs) || !fs.statSync(subcategoryAbs).isDirectory()) {
      return productSlug;
    }

    const dirs = fs.readdirSync(subcategoryAbs).filter((name) => {
      try {
        return fs.statSync(path.join(subcategoryAbs, name)).isDirectory();
      } catch {
        return false;
      }
    });

    const exact = dirs.find((name) => normalizeFolderSlug(name) === productSlug);
    if (exact) return exact;

    const near = dirs.filter((name) =>
      editDistanceOne(normalizeFolderSlug(name), productSlug),
    );
    if (near.length === 1) return near[0]!;

    return productSlug;
  } catch {
    return productSlug;
  }
}

function getFolderAbs(
  categorySlug: string,
  subcategorySlug: string,
  productSlug: string,
): string {
  const categoryDir = resolveCategoryDirName(categorySlug);
  const subcategoryDir = resolveSubcategoryDirName(categorySlug, subcategorySlug);
  const productDir = resolveProductDirName(categorySlug, subcategorySlug, productSlug);
  return path.join(PRODUCTS_ROOT, categoryDir, subcategoryDir, productDir);
}

function toPublicUrl(
  categorySlug: string,
  subcategorySlug: string,
  productSlug: string,
  filename: string,
): string {
  const categoryDir = resolveCategoryDirName(categorySlug);
  const subcategoryDir = resolveSubcategoryDirName(categorySlug, subcategorySlug);
  const productDir = resolveProductDirName(categorySlug, subcategorySlug, productSlug);
  return `/images/products/${encodePathSegment(categoryDir)}/${encodePathSegment(subcategoryDir)}/${encodePathSegment(productDir)}/${encodeURIComponent(filename)}`;
}

function resolveSlotUrl(
  categorySlug: string,
  subcategorySlug: string,
  productSlug: string,
  slot: Slot,
  heroFallbackUrl?: string,
): string {
  const folderAbs = getFolderAbs(categorySlug, subcategorySlug, productSlug);
  const files = listFolderFiles(folderAbs);
  const filename =
    slot === 1
      ? resolveSlotFilename(files, 1) ?? resolvePrimaryFilename(folderAbs, files)
      : resolveSlotFilename(files, slot);

  if (!filename) {
    if (slot !== 1 && heroFallbackUrl && heroFallbackUrl !== PRODUCT_IMAGE_PLACEHOLDER) {
      return heroFallbackUrl;
    }
    return PRODUCT_IMAGE_PLACEHOLDER;
  }

  return toPublicUrl(categorySlug, subcategorySlug, productSlug, filename);
}

export function getProductImages(
  categorySlug: string,
  subcategorySlug: string,
  productSlug: string,
): ProductGalleryImages {
  if (isFlatProductImageSubcategory(categorySlug, subcategorySlug)) {
    return getFlatProductImages(categorySlug, subcategorySlug, productSlug);
  }

  const hero = resolveSlotUrl(categorySlug, subcategorySlug, productSlug, 1);

  return {
    hero,
    thumbnails: [
      resolveSlotUrl(categorySlug, subcategorySlug, productSlug, 2, hero),
      resolveSlotUrl(categorySlug, subcategorySlug, productSlug, 3, hero),
      resolveSlotUrl(categorySlug, subcategorySlug, productSlug, 4, hero),
    ],
  };
}

export function getProductHeroImage(
  categorySlug: string,
  subcategorySlug: string,
  productSlug: string,
): string {
  return getProductImages(categorySlug, subcategorySlug, productSlug).hero;
}

/**
 * Prefer the conventional hero folder, then any sibling folder whose name
 * includes "hero-image" (covers typos / alternate naming on disk).
 */
function resolveSubcategoryHeroFolder(
  categorySlug: string,
  subcategorySlug: string,
): {
  categoryDir: string;
  subcategoryDir: string;
  folderAbs: string;
  folderName: string;
} | null {
  const categoryDir = resolveCategoryDirName(categorySlug);
  const subcategoryDir = resolveSubcategoryDirName(categorySlug, subcategorySlug);
  const subcategoryAbs = path.join(PRODUCTS_ROOT, categoryDir, subcategoryDir);
  const preferredName = `${subcategoryDir}-hero-image`;
  const preferredAbs = path.join(subcategoryAbs, preferredName);

  if (fs.existsSync(preferredAbs) && fs.statSync(preferredAbs).isDirectory()) {
    return { categoryDir, subcategoryDir, folderAbs: preferredAbs, folderName: preferredName };
  }

  // Also try the catalog slug form (e.g. scalpels-accessories-hero-image).
  if (subcategoryDir !== subcategorySlug) {
    const slugPreferred = `${subcategorySlug}-hero-image`;
    const slugPreferredAbs = path.join(subcategoryAbs, slugPreferred);
    if (fs.existsSync(slugPreferredAbs) && fs.statSync(slugPreferredAbs).isDirectory()) {
      return {
        categoryDir,
        subcategoryDir,
        folderAbs: slugPreferredAbs,
        folderName: slugPreferred,
      };
    }
  }

  try {
    if (!fs.existsSync(subcategoryAbs) || !fs.statSync(subcategoryAbs).isDirectory()) {
      return null;
    }

    const candidates = fs
      .readdirSync(subcategoryAbs)
      .filter((name) => {
        if (!/hero-image/i.test(name)) return false;
        try {
          return fs.statSync(path.join(subcategoryAbs, name)).isDirectory();
        } catch {
          return false;
        }
      })
      .sort((a, b) => a.localeCompare(b));

    const folderName = candidates[0];
    if (!folderName) return null;
    return {
      categoryDir,
      subcategoryDir,
      folderAbs: path.join(subcategoryAbs, folderName),
      folderName,
    };
  } catch {
    return null;
  }
}

/**
 * Category card/list hero from:
 *   /images/products/{category}/{category}-hero-image/*
 * Also accepts alternate on-disk category folder names and any
 * `{…}-hero-image` folder directly under the category (without renaming assets).
 * Falls back to `fallback` when no image file is found.
 */
export function getCategoryHeroImage(categorySlug: string, fallback: string): string {
  const categoryDir = resolveCategoryDirName(categorySlug);
  const categoryAbs = path.join(PRODUCTS_ROOT, categoryDir);

  const preferredNames = [`${categoryDir}-hero-image`];
  if (categoryDir !== categorySlug) {
    preferredNames.push(`${categorySlug}-hero-image`);
  }

  for (const folderName of preferredNames) {
    const folderAbs = path.join(categoryAbs, folderName);
    if (!fs.existsSync(folderAbs) || !fs.statSync(folderAbs).isDirectory()) {
      continue;
    }
    const files = listFolderFiles(folderAbs);
    const filename = resolvePrimaryFilename(folderAbs, files);
    if (!filename) continue;
    return `/images/products/${encodePathSegment(categoryDir)}/${encodePathSegment(folderName)}/${encodeURIComponent(filename)}`;
  }

  try {
    if (!fs.existsSync(categoryAbs) || !fs.statSync(categoryAbs).isDirectory()) {
      return fallback;
    }

    const candidates = fs
      .readdirSync(categoryAbs)
      .filter((name) => {
        if (!/hero-image/i.test(name)) return false;
        try {
          return fs.statSync(path.join(categoryAbs, name)).isDirectory();
        } catch {
          return false;
        }
      })
      .sort((a, b) => a.localeCompare(b));

    const folderName = candidates[0];
    if (!folderName) return fallback;

    const folderAbs = path.join(categoryAbs, folderName);
    const files = listFolderFiles(folderAbs);
    const filename = resolvePrimaryFilename(folderAbs, files);
    if (!filename) return fallback;

    return `/images/products/${encodePathSegment(categoryDir)}/${encodePathSegment(folderName)}/${encodeURIComponent(filename)}`;
  } catch {
    return fallback;
  }
}

/**
 * Subcategory card/navigator hero from:
 *   /images/products/{category}/{subcategory}/{subcategory}-hero-image/*
 * Also accepts alternate on-disk category/subcategory folder names and any
 * `{…}-hero-image` sibling folder (without renaming on-disk assets).
 * Falls back to `fallback` when no image file is found.
 */
export function getSubcategoryHeroImage(
  categorySlug: string,
  subcategorySlug: string,
  fallback: string,
): string {
  const resolved = resolveSubcategoryHeroFolder(categorySlug, subcategorySlug);
  if (!resolved) {
    return fallback;
  }

  const files = listFolderFiles(resolved.folderAbs);
  const filename = resolvePrimaryFilename(resolved.folderAbs, files);
  if (!filename) {
    return fallback;
  }
  return `/images/products/${encodePathSegment(resolved.categoryDir)}/${encodePathSegment(resolved.subcategoryDir)}/${encodePathSegment(resolved.folderName)}/${encodeURIComponent(filename)}`;
}

export type ProductImageAuditRow = {
  slug: string;
  expectedFolder: string;
  folderExists: boolean;
  files: {
    "image-1.webp": boolean;
    "image-2.webp": boolean;
    "image-3.webp": boolean;
    "image-4.webp": boolean;
  };
  resolved: ProductGalleryImages;
};

/** Full-catalog audit against public/images/products (server-only). */
export function auditCatalogProductImages(
  products: Array<{ category: string; subcategory: string; slug: string }>,
): ProductImageAuditRow[] {
  return products.map((product) => {
    const isFlat = isFlatProductImageSubcategory(product.category, product.subcategory);
    const expectedFolder = isFlat
      ? `public/images/products/${product.category}/${product.subcategory}`
      : `public/images/products/${product.category}/${product.subcategory}/${product.slug}`;
    const folderAbs = isFlat
      ? path.join(PRODUCTS_ROOT, product.category, product.subcategory)
      : path.join(PRODUCTS_ROOT, product.category, product.subcategory, product.slug);
    const folderExists = fs.existsSync(folderAbs) && fs.statSync(folderAbs).isDirectory();
    const flatFilename = isFlat
      ? resolveFlatProductRelativePath(folderAbs, product.category, product.subcategory, product.slug)
      : null;

    return {
      slug: product.slug,
      expectedFolder,
      folderExists,
      files: {
        "image-1.webp":
          folderExists &&
          (isFlat
            ? Boolean(flatFilename)
            : fs.existsSync(path.join(folderAbs, "image-1.webp"))),
        "image-2.webp":
          folderExists &&
          (isFlat
            ? Boolean(flatFilename)
            : fs.existsSync(path.join(folderAbs, "image-2.webp"))),
        "image-3.webp":
          folderExists &&
          (isFlat
            ? Boolean(flatFilename)
            : fs.existsSync(path.join(folderAbs, "image-3.webp"))),
        "image-4.webp":
          folderExists &&
          (isFlat
            ? Boolean(flatFilename)
            : fs.existsSync(path.join(folderAbs, "image-4.webp"))),
      },
      resolved: getProductImages(product.category, product.subcategory, product.slug),
    };
  });
}
