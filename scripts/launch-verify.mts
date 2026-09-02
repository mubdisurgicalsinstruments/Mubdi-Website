import fs from "node:fs";
import path from "node:path";
import { catalogCategories } from "../app/lib/catalog";
import { getProductHeroImage } from "../app/lib/product-images";
import { PRODUCT_IMAGE_PLACEHOLDER } from "../app/lib/product-image-constants";
import { footerPolicyLinks } from "../app/lib/policy-pages";

const PLACEHOLDER_RE = /catalogue entry prepared|Awaiting approved technical data/i;

let placeholderDescriptions = 0;
let missingImages = 0;
let total = 0;

for (const category of catalogCategories) {
  for (const subcategory of category.subcategories) {
    for (const product of subcategory.products) {
      total += 1;
      if (PLACEHOLDER_RE.test(product.description)) placeholderDescriptions += 1;
      const hero = getProductHeroImage(category.slug, subcategory.slug, product.slug);
      if (hero === PRODUCT_IMAGE_PLACEHOLDER || !fs.existsSync(path.join("public", decodeURIComponent(hero)))) {
        missingImages += 1;
      }
    }
  }
}

console.log(`Products: ${total}`);
console.log(`Placeholder SEO descriptions: ${placeholderDescriptions}`);
console.log(`Missing/broken images: ${missingImages}`);
console.log(`Policy routes: ${footerPolicyLinks.map((l) => l.href).join(", ")}`);

const sample = catalogCategories[0]?.subcategories[0]?.products[0];
console.log(`Sample description: ${sample?.description}`);

process.exit(placeholderDescriptions + missingImages > 0 ? 1 : 0);
