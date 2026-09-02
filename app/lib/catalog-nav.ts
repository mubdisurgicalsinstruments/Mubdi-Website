/** Lightweight category data for client UI — avoids bundling full catalog product trees. */

function compareByName(a: { name: string }, b: { name: string }) {
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

const catalogCategoryLinksSource = [
  { slug: "cardiovascular", name: "Cardiovascular" },
  { slug: "dental", name: "Dental" },
  { slug: "ent", name: "ENT" },
  { slug: "general-surgery", name: "General Surgery" },
  { slug: "gynecology", name: "Gynecology" },
  { slug: "laparoscopic", name: "Laparoscopic" },
  { slug: "neurosurgery", name: "Neurosurgery" },
  { slug: "ophthalmic", name: "Ophthalmic" },
  { slug: "orthognathic", name: "Orthognathic" },
  { slug: "orthopedic", name: "Orthopedic" },
  { slug: "plastic-surgery", name: "Plastic Surgery" },
  { slug: "veterinary", name: "Veterinary" },
] as const;

export const catalogCategoryLinks = [...catalogCategoryLinksSource].sort(compareByName);

/** Main products entry point — homepage category grid. */
export const PRODUCTS_HOME_HREF = "/#categories";

const audienceFor =
  "distributors, hospitals, surgeons, and medical brands";

const catalogCategorySummariesSource = [
  {
    slug: "cardiovascular",
    name: "Cardiovascular",
    description: `Explore Cardiovascular instruments through five structured subcategories for ${audienceFor}.`,
    image:
      "/images/products/cardiovascular/cardiovascular-hero-image/cardiovascular_hero_exact_743x570.png",
  },
  {
    slug: "dental",
    name: "Dental",
    description: `Explore Dental instruments through five structured subcategories for ${audienceFor}.`,
    image: "/images/products/dental/dental-hero-image/dental_category_hero_743x570.png",
  },
  {
    slug: "ent",
    name: "ENT",
    description: `Explore ENT instruments through five structured subcategories for ${audienceFor}.`,
    image:
      "/images/products/ent/ent-hero-image/ChatGPT%20Image%20Aug%2023%2C%202026%2C%2010_01_33%20PM.png",
  },
  {
    slug: "general-surgery",
    name: "General Surgery",
    description: "Explore our General Surgery range through five focused instrument subcategories.",
    image:
      "/images/products/general-surgery/general-surgery-hero-image/general_surgery_hero_743x570.png",
  },
  {
    slug: "gynecology",
    name: "Gynecology",
    description: `Explore Gynecology instruments through five structured subcategories for ${audienceFor}.`,
    image:
      "/images/products/gynecology/gynecology-hero-image/ChatGPT%20Image%20Aug%2023%2C%202026%2C%2010_13_50%20PM.png",
  },
  {
    slug: "laparoscopic",
    name: "Laparoscopic",
    description:
      "Explore Laparoscopic instruments through four structured subcategories for minimally invasive product lines.",
    image:
      "/images/products/laparscopic/laparscopic-hero-image/ChatGPT%20Image%20Aug%2023%2C%202026%2C%2010_42_09%20PM.png",
  },
  {
    slug: "neurosurgery",
    name: "Neurosurgery",
    description: `Explore Neurosurgery instruments through five structured subcategories for ${audienceFor}.`,
    image:
      "/images/products/neurosurgery/neurosurgery-hero-image/ChatGPT%20Image%20Aug%2023%2C%202026%2C%2010_45_15%20PM.png",
  },
  {
    slug: "ophthalmic",
    name: "Ophthalmic",
    description: `Explore Ophthalmic instruments through five structured subcategories for ${audienceFor}.`,
    image:
      "/images/products/ophthalmic/ophthalmic-hero-image/ChatGPT%20Image%20Aug%2023%2C%202026%2C%2010_47_29%20PM.png",
  },
  {
    slug: "orthognathic",
    name: "Orthognathic",
    description:
      "Explore Orthognathic Surgery Instruments through five structured subcategories for maxillary, mandibular, and genioplasty procedures.",
    image:
      "/images/products/orthognathic/orthognathic-hero-image/ChatGPT%20Image%20Aug%2023%2C%202026%2C%2010_50_24%20PM.png",
  },
  {
    slug: "orthopedic",
    name: "Orthopedic",
    description: `Explore Orthopedic instruments through five structured subcategories for ${audienceFor}.`,
    image:
      "/images/products/orthopedic/orthopedic-hero-image/ChatGPT%20Image%20Aug%2023%2C%202026%2C%2010_53_02%20PM.png",
  },
  {
    slug: "plastic-surgery",
    name: "Plastic Surgery",
    description: `Explore Plastic Surgery instruments through four structured subcategories for ${audienceFor}.`,
    image:
      "/images/products/plastic-surgery/plastic-surgery-hero-image/ChatGPT%20Image%20Aug%2023%2C%202026%2C%2010_57_08%20PM.png",
  },
  {
    slug: "veterinary",
    name: "Veterinary",
    description: `Explore Veterinary instruments through five structured subcategories for ${audienceFor}.`,
    image:
      "/images/products/veterinary/veterinary-hero-image/ChatGPT%20Image%20Aug%2023%2C%202026%2C%2011_00_08%20PM.png",
  },
] as const;

export const catalogCategorySummaries = [...catalogCategorySummariesSource].sort(compareByName);
