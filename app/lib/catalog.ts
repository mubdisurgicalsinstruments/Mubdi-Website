import {
  getCategoryHeroImage,
  getProductImages,
  getSubcategoryHeroImage,
} from "./product-images";
import type { ProductGalleryImages } from "./product-images";

export type CatalogProduct = {
  slug: string;
  name: string;
  description: string;
  /** Canonical catalog location used when the same product is reused elsewhere. */
  imageSource: {
    categorySlug: string;
    subcategorySlug: string;
  };
  /** Derived hero path from category/subcategory/slug — never manually authored. */
  image: string;
  /** Hero + 3 thumbnails resolved from disk (placeholder when a slot is missing). */
  gallery: ProductGalleryImages;
  availableSizes: string;
  /** Explicit selectable sizes; used when `availableSizes` is a generic label. */
  sizeOptions?: string[];
  material: string;
  finish: string;
  oemAvailability: string;
  specifications: [string, string][];
  features: string[];
  applications: string[];
};

export type CatalogSubcategory = {
  slug: string;
  name: string;
  description: string;
  image: string;
  products: CatalogProduct[];
};

export type CatalogCategory = {
  slug: string;
  name: string;
  description: string;
  image: string;
  subcategories: CatalogSubcategory[];
};

const PLACEHOLDER_IMAGE = "/images/mubdi-surgical-instruments-hero.png";

const categoryImages: Record<string, string> = {
  "general-surgery": "/images/products/general-surgery.jpg",
  orthopedic: "/images/products/orthopedic.jpg",
  dental: "/images/products/dental.jpg",
  laparoscopic: "/images/products/laparoscopic.jpg",
  ent: "/images/products/ent.jpg",
  ophthalmic: "/images/products/ophthalmic.jpg",
  gynecology: "/images/products/gynecology.jpg",
  cardiovascular: "/images/products/cardiovascular.jpg",
  neurosurgery: "/images/products/neurosurgery.jpg",
  "plastic-surgery": "/images/products/plastic-surgery.jpg",
  veterinary: "/images/products/veterinary.jpg",
};

const productRegistry = new Map<string, CatalogProduct>();

type ProductDefinition = string | { name: string; slug: string };

function normalizeProductDefinition(entry: ProductDefinition): { name: string; slug?: string } {
  if (typeof entry === "string") {
    return { name: entry };
  }

  return entry;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildProductSeoDescription(
  productName: string,
  categoryName: string,
  subcategoryName: string,
): string {
  return `${productName} — ${subcategoryName} in the ${categoryName} range from Mubdi Surgical Instruments. Request a quote for pricing, sizing, and custom manufacturing. Made in Sialkot, Pakistan.`;
}

function createProducts(
  categorySlug: string,
  subcategorySlug: string,
  subcategoryName: string,
  categoryName: string,
  names: ProductDefinition[],
  reuseExistingProducts = false,
): CatalogProduct[] {
  return names.map((entry) => {
    const { name, slug: slugOverride } = normalizeProductDefinition(entry);
    const description = buildProductSeoDescription(name, categoryName, subcategoryName);
    const existingProduct = reuseExistingProducts ? productRegistry.get(name) : undefined;
    if (existingProduct) {
      const source = existingProduct.imageSource;
      if (
        source.categorySlug === categorySlug &&
        source.subcategorySlug === subcategorySlug
      ) {
        return { ...existingProduct, description };
      }
    }

    const slug = slugOverride ?? slugify(name);
    const gallery = getProductImages(categorySlug, subcategorySlug, slug);

    const product: CatalogProduct = {
      slug,
      name,
      description,
      imageSource: { categorySlug, subcategorySlug },
      image: gallery.hero,
      gallery,
      availableSizes: "Multiple sizes available",
      material: "Premium Medical Grade",
      finish: "Made in Pakistan",
      oemAvailability: "Available",
      specifications: [],
      features: [
        "Product details will be verified against the approved Mubdi catalogue.",
        "Custom branding and private-label requirements can be discussed with our team.",
        "Custom size, finish, and packaging requests can be reviewed on inquiry.",
      ],
      applications: [
        "Application information will be added with the final approved technical catalogue.",
      ],
    };

    if (!productRegistry.has(name)) {
      productRegistry.set(name, product);
    }

    return product;
  });
}

function placeholderProducts(
  categorySlug: string,
  subcategorySlug: string,
  subcategoryName: string,
  categoryName: string,
) {
  return createProducts(
    categorySlug,
    subcategorySlug,
    subcategoryName,
    categoryName,
    Array.from({ length: 10 }, (_, index) => `Product ${String(index + 1).padStart(2, "0")}`),
  );
}

function createSubcategories(
  categorySlug: string,
  categoryName: string,
  categoryImage: string,
  definitions: {
    slug: string;
    name: string;
    description: string;
    products?: ProductDefinition[];
  }[],
  reuseExistingProducts = false,
): CatalogSubcategory[] {
  return definitions.map((definition) => ({
    slug: definition.slug,
    name: definition.name,
    description: definition.description,
    image: getSubcategoryHeroImage(categorySlug, definition.slug, categoryImage),
    products: definition.products
      ? createProducts(
          categorySlug,
          definition.slug,
          definition.name,
          categoryName,
          definition.products,
          reuseExistingProducts,
        )
      : placeholderProducts(categorySlug, definition.slug, definition.name, categoryName),
  }));
}

function compareByName(a: { name: string }, b: { name: string }) {
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

function createCategory(
  slug: string,
  name: string,
  description: string,
  subcategories: {
    slug: string;
    name: string;
    description: string;
    products?: ProductDefinition[];
  }[],
  reuseExistingProducts = false,
): CatalogCategory {
  const image = getCategoryHeroImage(slug, categoryImages[slug] ?? PLACEHOLDER_IMAGE);

  return {
    slug,
    name,
    description,
    image,
    subcategories: createSubcategories(
      slug,
      name,
      image,
      subcategories,
      reuseExistingProducts,
    ).sort(compareByName),
  };
}

const catalogCategoriesUnsorted: CatalogCategory[] = [
  createCategory(
    "general-surgery",
    "General Surgery",
    "Explore our General Surgery range through five focused instrument subcategories.",
    [
      {
        slug: "scissors",
        name: "Scissors",
        description: "Core cutting scissors patterns for General Surgery instrument lines.",
        products: [
          "Mayo Straight Scissors",
          "Mayo Curved Scissors",
          "Metzenbaum Straight Scissors",
          "Metzenbaum Curved Scissors",
          "Iris Straight Scissors",
          "Iris Curved Scissors",
          "Potts-Smith TC Scissors",
          "Spencer Stitch Scissors",
          "Lister Bandage Scissors",
          "Operating Scissors",
        ],
      },
      {
        slug: "forceps",
        name: "Forceps",
        description: "Dressing and tissue forceps patterns for General Surgery requirements.",
        products: [
          "Adson Dressing Forceps",
          "Adson Tissue Forceps",
          "DeBakey Forceps",
          "Brown Adson Forceps",
          "Dressing Forceps",
          "Russian Tissue Forceps",
          "Gerald Forceps",
          "Cushing Forceps",
          "Allis Tissue Forceps",
          "Babcock Tissue Forceps",
        ],
      },
      {
        slug: "needle-holders",
        name: "Needle Holders",
        description: "Needle holder patterns for General Surgery suturing support.",
        products: [
          "Mayo-Hegar Needle Holder",
          "Olsen-Hegar Needle Holder",
          "Crile-Wood Needle Holder",
          "Mathieu Needle Holder",
          "Webster Needle Holder",
          "Halsey Needle Holder",
          "Ryder Needle Holder",
          "Castroviejo Needle Holder",
          "Derf Needle Holder",
          "Gillies Needle Holder",
        ],
      },
      {
        slug: "retractors",
        name: "Retractors",
        description: "Handheld and self-retaining retractor patterns for General Surgery.",
        products: [
          "Army-Navy Retractor",
          "Senn Retractor",
          "Richardson Retractor",
          "Langenbeck Retractor",
          "Deaver Retractor",
          "Weitlaner Retractor",
          "Gelpi Retractor",
          "Volkmann Retractor",
          "Parker Retractor",
          "Rake Retractor",
        ],
      },
      {
        slug: "scalpels-accessories",
        name: "Scalpels & Accessories",
        description: "Scalpel handles, blades, and accessories for General Surgery workflows.",
        products: [
          "Bard-Parker Handle No. 3",
          "Bard-Parker Handle No. 4",
          "Scalpel Blade No. 10",
          "Scalpel Blade No. 11",
          "Scalpel Blade No. 12",
          "Scalpel Blade No. 15",
          "Scalpel Blade No. 20",
          "Scalpel Blade No. 21",
          "Scalpel Blade No. 22",
          "Scalpel Blade Remover",
        ],
      },
    ],
  ),
  createCategory(
    "orthopedic",
    "Orthopedic",
    "Explore Orthopedic instruments through five structured subcategories for distributors, hospitals, surgeons, and medical brands.",
    [
      {
        slug: "bone-cutting-instruments",
        name: "Bone Cutting Instruments",
        description: "Bone cutting and rongeur patterns for Orthopedic instrument lines.",
        products: [
          "Liston Bone Cutting Forceps",
          "Stille Bone Rongeur",
          "Luer Bone Rongeur",
          "Double Action Bone Rongeur",
          "Bone Cutting Forceps",
          "Bone Chisel",
          "Osteotome",
          "Gigli Wire Saw",
          "Bone Mallet",
          "Bone Gouge",
        ],
      },
      {
        slug: "bone-holding-instruments",
        name: "Bone Holding Instruments",
        description: "Bone holding and reduction patterns for Orthopedic requirements.",
        products: [
          "Lane Bone Holding Forceps",
          "Verbrugge Bone Holding Forceps",
          "Lowman Bone Holding Forceps",
          "Kern Bone Holding Forceps",
          "Pointed Reduction Forceps",
          "Pelvic Reduction Forceps",
          { name: "Weber Bone Clamp", slug: "weber-bone-clamp" },
          "Bone Clamp",
          "Speed Lock Bone Clamp",
          "Fracture Reduction Forceps",
        ],
      },
      {
        slug: "bone-elevators-osteotomes",
        name: "Bone Elevators & Osteotomes",
        description: "Elevator and osteotome patterns for Orthopedic workflows.",
        products: [
          "Cobb Periosteal Elevator",
          "Key Periosteal Elevator",
          "Freer Elevator",
          "Hohmann Elevator",
          "Lambotte Osteotome",
          "Bone Lever",
          "Periosteal Elevator",
          "Cobb Elevator",
          { name: "Fergusson Bone Holding Forceps", slug: "ferguson-bone-lever" },
          "Lambotte Chisel",
        ],
      },
      {
        slug: "bone-drills-measuring-instruments",
        name: "Bone Drills & Measuring Instruments",
        description: "Drill, measuring, and fixation support instruments for Orthopedic use.",
        products: [
          { name: "Bone Hand Drill with Jacobs Chuck", slug: "jacob-s-chuck" },
          { name: "T-Handle Bone Drill", slug: "t-handle-chuck" },
          { name: "Bone Awl", slug: "hand-drill" },
          { name: "Bone Tap", slug: "bone-awl" },
          { name: "Depth Gauge", slug: "bone-tap" },
          { name: "Bone Reamer", slug: "depth-gauge" },
          { name: "Trephine", slug: "screwdriver-handle" },
          { name: "Kirschner Wire Drill", slug: "ao-screwdriver" },
          { name: "Wire Tightener", slug: "wire-tightener" },
          { name: "Plate Bending Iron", slug: "plate-bending-iron" },
        ],
      },
      {
        slug: "orthopedic-retractors",
        name: "Orthopedic Retractors",
        description: "Retractor patterns for Orthopedic exposure requirements.",
        products: [
          "Hohmann Retractor",
          "Bennett Retractor",
          "Cobra Retractor",
          { name: "Lambotte Bone Hook", slug: "lambotte-bone-hook" },
          "Muller Retractor",
          "Bone Hook",
          "Beckman Retractor",
          "Hibbs Retractor",
          "Murphy Retractor",
          "Farabeuf Retractor",
        ],
      },
    ],
  ),
  createCategory(
    "dental",
    "Dental",
    "Explore Dental instruments through five structured subcategories for distributors, hospitals, surgeons, and medical brands.",
    [
      {
        slug: "examination-instruments",
        name: "Examination Instruments",
        description: "Diagnostic and examination patterns for Dental instrument lines.",
        products: [
          "Mouth Mirror",
          "Explorer 17/23",
          "Dental Probe",
          "College Tweezers",
          "Periodontal Probe",
          "Shepherd Hook Explorer",
          "Williams Probe",
          "UNC-15 Probe",
          "Cotton Pliers",
          "Diagnostic Mirror Handle",
        ],
      },
      {
        slug: "extraction-instruments",
        name: "Extraction Instruments",
        description: "Extraction forceps and elevators for Dental requirements.",
        products: [
          "Upper Universal Extraction Forceps",
          "Lower Universal Extraction Forceps",
          "Upper Molar Forceps",
          "Lower Molar Forceps",
          "Root Tip Forceps",
          "Cryer Elevator",
          "Coupland Elevator",
          "Warwick James Elevator",
          "Apexo Elevator",
          "Extraction Forceps No. 150",
        ],
      },
      {
        slug: "restorative-instruments",
        name: "Restorative Instruments",
        description: "Restorative placement and finishing instruments for Dental workflows.",
        products: [
          "Amalgam Carrier",
          "Condenser Plugger",
          "Ball Burnisher",
          "Flat Plastic Instrument",
          "Cement Spatula",
          "Composite Placement Instrument",
          "Carver Hollenback",
          "Discoid Cleoid Carver",
          "Excavator Spoon",
          "Matrix Retainer",
        ],
      },
      {
        slug: "periodontal-instruments",
        name: "Periodontal Instruments",
        description: "Scaling and periodontal patterns for Dental manufacturing partners.",
        products: [
          "Sickle Scaler",
          "Universal Curette",
          "Gracey Curette 1/2",
          "Gracey Curette 11/12",
          "Gracey Curette 13/14",
          "Periodontal Hoe",
          "Chisel Scaler",
          "Periodontal File",
          "Pocket Marker",
          "Surgical Curette",
        ],
      },
      {
        slug: "oral-surgery-instruments",
        name: "Oral Surgery Instruments",
        description: "Oral surgery instrument patterns for Dental specialist requirements.",
        products: [
          "Molt Periosteal Elevator",
          "Minnesota Retractor",
          "Austin Retractor",
          "Needle Holder",
          "Tissue Forceps",
          "Bone Rongeur",
          "Bone File",
          "Surgical Curette",
          "Scalpel Handle No. 3",
          "Mayo Scissors",
        ],
      },
    ],
  ),
  createCategory(
    "laparoscopic",
    "Laparoscopic",
    "Explore Laparoscopic instruments through four structured subcategories for minimally invasive product lines.",
    [
      {
        slug: "graspers",
        name: "Graspers",
        description: "Laparoscopic grasper patterns for catalogue development.",
        products: [
          "Johan Fenestrated Grasper",
          "Babcock Grasper",
          "Clinch Grasper",
          "Atraumatic Grasper",
          "Rat Tooth Grasper",
          "Alligator Grasper",
          "Bowel Grasper",
          "Claw Grasper",
          "DeBakey Grasper",
          "Cobra Toothed Grasper",
        ],
      },
      {
        slug: "dissectors",
        name: "Dissectors",
        description: "Laparoscopic dissector patterns for structured instrument lines.",
        products: [
          "Maryland Dissector",
          "Right Angle Dissector",
          "Dolphin Nose Dissector",
          "Tapered Dissector",
          "Blunt Tip Dissector",
          "Curved Dissector",
          "Mixter Dissector",
          "Kelly Dissector",
          "Needle Nose Dissector",
          "Micro Dissecting Forceps",
        ],
      },
      {
        slug: "scissors",
        name: "Scissors",
        description: "Laparoscopic scissors prepared for cutting requirements.",
        products: [
          "Metzenbaum Laparoscopic Scissors",
          "Curved Scissors",
          "Straight Scissors",
          "Hook Scissors",
          "Micro Scissors",
          "Mini Metzenbaum Laparoscopic Scissors",
          "Monopolar Scissors",
          "Bipolar Scissors",
        ],
      },
      {
        slug: "needle-holders",
        name: "Needle Holders",
        description: "Needle holder patterns for Laparoscopic suturing support.",
        products: [
          "Mayo-Hegar Needle Holder",
          "Olsen-Hegar Needle Holder",
          "Curved Needle Holder",
          "Straight Needle Holder",
          "TC Needle Holder",
          "Self-Riding Needle Holder",
          "Rotating Needle Holder",
          "Left Curved Needle Holder",
          "Right Curved Needle Holder",
          "Self-Aligning Needle Holder",
        ],
      },
    ],
  ),
  createCategory(
    "ent",
    "ENT",
    "Explore ENT instruments through five structured subcategories for distributors, hospitals, surgeons, and medical brands.",
    [
      {
        slug: "nasal-instruments",
        name: "Nasal Instruments",
        description: "Nasal instrument patterns for ENT catalogue development.",
        products: [
          "Killian Nasal Speculum",
          "Vienna Nasal Speculum",
          "Cottle Nasal Speculum",
          "Freer Elevator",
          "Joseph Elevator",
          "Ballenger Swivel Knife",
          "Septum Chisel",
          "Nasal Osteotome",
          "Fomon Rasp",
          "Cottle Nasal Retractor",
        ],
      },
      {
        slug: "ear-instruments",
        name: "Ear Instruments",
        description: "Ear instrument patterns for structured ENT product lines.",
        products: [
          "Hartmann Ear Forceps",
          "Hartmann Alligator Forceps",
          "Jobson Horne Probe",
          "Buck Ear Curette",
          "Rosen Needle",
          "House Pick",
          "Ear Speculum",
          "Wax Hook",
          "Myringotomy Knife",
          "Ear Suction Tube",
        ],
      },
      {
        slug: "throat-instruments",
        name: "Throat Instruments",
        description: "Throat instruments for ENT manufacturing requirements.",
        products: [
          "Magill Forceps",
          "Tonsil Snare",
          "Negus Artery Forceps",
          "Boyle Davis Mouth Gag",
          "Draffin Bipod",
          "Yankauer Suction Tube",
          "Mollison Tonsil Dissector",
          "St. Clair Thompson Forceps",
          "Tonsil Holding Forceps",
          "Adenoid Curette",
        ],
      },
      {
        slug: "ent-forceps",
        name: "ENT Forceps",
        description: "Dressing and sinus forceps patterns for ENT portfolios.",
        products: [
          "Tilley Dressing Forceps",
          "Hartmann Dressing Forceps",
          "Wilde Forceps",
          "Luc Forceps",
          "Blakesley Forceps",
          "Takahashi Forceps",
          "Gruenwald Forceps",
          "Nasal Dressing Forceps",
          "Jansen Bayonet Forceps",
          "Struempel Forceps",
        ],
      },
      {
        slug: "ent-speculums-retractors",
        name: "ENT Speculums & Retractors",
        description: "Speculum and retractor patterns for ENT exposure requirements.",
        products: [
          "Killian Speculum",
          "Vienna Speculum",
          "Cottle Speculum",
          "Thudichum Nasal Speculum",
          "Langenbeck Retractor",
          "Aufricht Retractor",
          "Kilner Retractor",
          "Cottle Retractor",
          "Skin Hook",
          "Joseph Retractor",
        ],
      },
    ],
  ),
  createCategory(
    "ophthalmic",
    "Ophthalmic",
    "Explore Ophthalmic instruments through five structured subcategories for distributors, hospitals, surgeons, and medical brands.",
    [
      {
        slug: "ophthalmic-scissors",
        name: "Ophthalmic Scissors",
        description: "Scissors patterns for Ophthalmic cutting requirements.",
        products: [
          "Castroviejo Scissors Curved",
          "Castroviejo Scissors Straight",
          "Westcott Scissors",
          "Vannas Scissors Straight",
          "Vannas Scissors Curved",
          "Stevens Tenotomy Scissors Straight",
          "Stevens Tenotomy Scissors Curved",
          "Iris Scissors Straight",
          "Iris Scissors Curved",
          "Corneal Scissors",
        ],
      },
      {
        slug: "ophthalmic-forceps",
        name: "Ophthalmic Forceps",
        description: "Forceps prepared for structured Ophthalmic instrument lines.",
        products: [
          "Colibri Forceps",
          "McPherson Forceps",
          "Bonn Forceps",
          "Castroviejo Forceps",
          "Utrata Capsulorhexis Forceps",
          "Troutman Forceps",
          "Fixation Forceps",
          "Tying Forceps",
          "Hoskins Forceps",
          "Pierse Forceps",
        ],
      },
      {
        slug: "needle-holders",
        name: "Needle Holders",
        description: "Needle holders for Ophthalmic suturing support.",
        products: [
          "Castroviejo Needle Holder",
          "Barraquer Needle Holder",
          "Ryder Needle Holder",
          "Halsey Needle Holder",
          "Derf Needle Holder",
          "Webster Needle Holder",
          "Micro Needle Holder",
          "TC Needle Holder",
          "Straight Needle Holder",
          "Curved Needle Holder",
        ],
      },
      {
        slug: "speculums-retractors",
        name: "Speculums & Retractors",
        description: "Speculum and retractor patterns for Ophthalmic exposure requirements.",
        products: [
          "Barraquer Wire Speculum",
          "Lieberman Speculum",
          "Castroviejo Speculum",
          "Barraquer Retractor",
          "Desmarres Retractor",
          "Lid Retractor",
          "Scleral Depressor",
          "Eyelid Retractor",
          "Muscle Hook",
          "Chalazion Clamp",
        ],
      },
      {
        slug: "knives-surgical-instruments",
        name: "Knives & Surgical Instruments",
        description: "Knives and surgical instruments for Ophthalmic catalogue development.",
        products: [
          "Crescent Knife",
          "Keratome Knife",
          "MVR Knife",
          "Slit Knife",
          "Bevel Up Knife",
          "Bevel Down Knife",
          "Cystotome",
          "Lens Manipulator",
          "Sinskey Hook",
          "Phaco Chopper",
        ],
      },
    ],
  ),
  createCategory(
    "gynecology",
    "Gynecology",
    "Explore Gynecology instruments through five structured subcategories for distributors, hospitals, surgeons, and medical brands.",
    [
      {
        slug: "vaginal-speculums",
        name: "Vaginal Speculums",
        description: "Vaginal speculum patterns for Gynecology catalogue development.",
        products: [
          "Cusco Vaginal Speculum",
          "Graves Vaginal Speculum",
          "Pederson Vaginal Speculum",
          "Auvard Weighted Speculum",
          "Sims Vaginal Speculum",
          "Collin Vaginal Speculum",
          "Breisky Vaginal Speculum",
          "Neugebauer Speculum",
          "Ferguson Speculum",
          "Kristeller Speculum",
        ],
      },
      {
        slug: "forceps",
        name: "Forceps",
        description: "Forceps prepared for structured Gynecology instrument lines.",
        products: [
          "Pozzi Tenaculum Forceps",
          "Schroeder Tenaculum Forceps",
          "Foerster Sponge Forceps",
          "Bozeman Uterine Forceps",
          "Green Armytage Forceps",
          "Braun Uterine Forceps",
          "Allis Tissue Forceps",
          "Babcock Forceps",
          "Ovum Forceps",
          "Dressing Forceps",
        ],
      },
      {
        slug: "curettes-dilators",
        name: "Curettes & Dilators",
        description: "Curettes and dilators for Gynecology manufacturing requirements.",
        products: [
          "Sims Uterine Curette",
          "Bumm Uterine Curette",
          "Simon Uterine Curette",
          "Recamier Curette",
          "Novak Curette",
          "Hegar Dilator Set",
          "Pratt Dilator",
          "Hank Dilator",
          "Denniston Dilator",
          "Uterine Sound",
        ],
      },
      {
        slug: "scissors",
        name: "Scissors",
        description: "Scissors patterns for Gynecology cutting requirements.",
        products: [
          "Mayo Straight Scissors",
          "Mayo Curved Scissors",
          "Metzenbaum Curved Scissors",
          "Metzenbaum Straight Scissors",
          "Iris Scissors Straight",
          "Iris Scissors Curved",
          "Spencer Stitch Scissors",
          "Operating Scissors",
          "Episiotomy Scissors",
          "Littauer Suture Scissors",
        ],
      },
      {
        slug: "retractors",
        name: "Retractors",
        description: "Retractor patterns for Gynecology exposure requirements.",
        products: [
          "Doyen Retractor",
          "Breisky Retractor",
          "Deaver Retractor",
          "Sims Retractor",
          "Richardson Retractor",
          "Langenbeck Retractor",
          "Auvard Retractor",
          "O'Sullivan-O'Connor Retractor",
          "Eastman Retractor",
          "Gelpi Retractor",
        ],
      },
    ],
  ),
  createCategory(
    "cardiovascular",
    "Cardiovascular",
    "Explore Cardiovascular instruments through five structured subcategories for distributors, hospitals, surgeons, and medical brands.",
    [
      {
        slug: "cardiovascular-scissors",
        name: "Cardiovascular Scissors",
        description: "Scissors patterns for Cardiovascular cutting requirements.",
        products: [
          "Potts-Smith Scissors",
          "DeBakey Cardiovascular Scissors",
          "Metzenbaum TC Scissors",
          "Mayo TC Scissors",
          "Micro Scissors Straight",
          "Micro Scissors Curved",
          "Tenotomy Scissors Straight",
          "Tenotomy Scissors Curved",
          "Vascular Scissors",
          "Coronary Scissors",
        ],
      },
      {
        slug: "cardiovascular-forceps",
        name: "Cardiovascular Forceps",
        description: "Forceps prepared for structured Cardiovascular instrument lines.",
        products: [
          "DeBakey Tissue Forceps",
          "Gerald Forceps",
          "Cooley Forceps",
          "Russian Forceps",
          "Potts Forceps",
          "Adson Forceps",
          "Micro Forceps Straight",
          "Micro Forceps Curved",
          "Dressing Forceps",
          "Vascular Thumb Forceps",
        ],
      },
      {
        slug: "needle-holders",
        name: "Needle Holders",
        description: "Needle holders for Cardiovascular suturing support.",
        products: [
          "Castroviejo Needle Holder",
          "Ryder Needle Holder",
          "Mayo-Hegar TC Needle Holder",
          "Crile-Wood Needle Holder",
          "Webster Needle Holder",
          "Micro Needle Holder Straight",
          "Micro Needle Holder Curved",
          "Halsey Needle Holder",
          "Derf Needle Holder",
          "Olsen-Hegar Needle Holder",
        ],
      },
      {
        slug: "clamps",
        name: "Clamps",
        description: "Clamp patterns for Cardiovascular catalogue development.",
        products: [
          "DeBakey Vascular Clamp",
          "Satinsky Clamp",
          "Cooley Clamp",
          "Bulldog Clamp",
          "Glover Clamp",
          "Fogarty Clamp",
          "Lambert-Kay Clamp",
          "Aortic Cross Clamp",
          "Carotid Clamp",
          "Vascular Occlusion Clamp",
        ],
      },
      {
        slug: "retractors",
        name: "Retractors",
        description: "Retractors reserved for Cardiovascular exposure requirements.",
        products: [
          "Finochietto Rib Retractor",
          "Cooley Sternal Retractor",
          "Morse Retractor",
          "Sellors Rib Retractor",
          "Beckman Retractor",
          "Deaver Retractor",
          "Richardson Retractor",
          "Army-Navy Retractor",
          "Weitlaner Retractor",
          "Gelpi Retractor",
        ],
      },
    ],
  ),
  createCategory(
    "neurosurgery",
    "Neurosurgery",
    "Explore Neurosurgery instruments through five structured subcategories for distributors, hospitals, surgeons, and medical brands.",
    [
      {
        slug: "neurosurgical-forceps",
        name: "Neurosurgical Forceps",
        description: "Forceps prepared for structured Neurosurgery instrument lines.",
        products: [
          "Adson Bipolar Forceps",
          "Bayonet Forceps",
          "Cushing Forceps",
          "Gerald Forceps",
          "DeBakey Forceps",
          "McPherson Forceps",
          "Dressing Forceps",
          "Micro Tissue Forceps",
          "Tying Forceps",
          "Tumor Forceps",
        ],
      },
      {
        slug: "neurosurgical-scissors",
        name: "Neurosurgical Scissors",
        description: "Scissors patterns for Neurosurgery cutting requirements.",
        products: [
          "Metzenbaum Scissors Straight",
          "Metzenbaum Scissors Curved",
          "Micro Scissors Straight",
          "Micro Scissors Curved",
          "Tenotomy Scissors Straight",
          "Tenotomy Scissors Curved",
          "Potts-Smith Scissors",
          "Iris Scissors Straight",
          "Iris Scissors Curved",
          "Operating Scissors",
        ],
      },
      {
        slug: "dissectors-elevators",
        name: "Dissectors & Elevators",
        description: "Dissectors and elevators for Neurosurgery manufacturing requirements.",
        products: [
          "Penfield Dissector No.1",
          "Penfield Dissector No.2",
          "Penfield Dissector No.3",
          "Penfield Dissector No.4",
          "Penfield Dissector No.5",
          "Freer Elevator",
          "Cushing Elevator",
          "Cobb Elevator",
          "Love Nerve Root Retractor",
          "Woodson Elevator",
        ],
      },
      {
        slug: "retractors",
        name: "Retractors",
        description: "Retractor patterns for Neurosurgery catalogue development.",
        products: [
          "Leyla Retractor",
          "Greenberg Retractor",
          "Gelpi Retractor",
          "Weitlaner Retractor",
          "Cloward Retractor",
          "Caspar Retractor",
          "Love Nerve Root Retractor",
          "Beckman Retractor",
          "Taylor Retractor",
          "Langenbeck Retractor",
        ],
      },
      {
        slug: "rongeurs-bone-instruments",
        name: "Rongeurs & Bone Instruments",
        description: "Rongeurs and bone instruments for Neurosurgery specialty requirements.",
        products: [
          "Kerrison Rongeur",
          "Leksell Rongeur",
          "Stille Rongeur",
          "Luer Rongeur",
          "Bone Curette",
          "Bone Punch",
          "Bone Chisel",
          "Osteotome",
          "Bone Mallet",
          "Hudson Brace",
        ],
      },
    ],
  ),
  createCategory(
    "plastic-surgery",
    "Plastic Surgery",
    "Explore Plastic Surgery instruments through four structured subcategories for distributors, hospitals, surgeons, and medical brands.",
    [
      {
        slug: "plastic-surgery-scissors",
        name: "Plastic Surgery Scissors",
        description: "Scissors patterns for Plastic Surgery catalogue development.",
        products: [
          "Stevens Tenotomy Scissors Straight",
          "Stevens Tenotomy Scissors Curved",
          "Iris Scissors Straight",
          "Iris Scissors Curved",
          "Metzenbaum Scissors Straight",
          "Metzenbaum Scissors Curved",
          "SuperCut Scissors",
          "Facelift Scissors",
          "Converse Scissors",
          "Joseph Scissors",
        ],
      },
      {
        slug: "plastic-surgery-forceps",
        name: "Plastic Surgery Forceps",
        description: "Forceps prepared for structured Plastic Surgery instrument lines.",
        products: [
          "Adson Tissue Forceps",
          "Adson Dressing Forceps",
          "Brown Adson Forceps",
          "Gerald Forceps",
          "Bishop-Harmon Forceps",
          "McPherson Forceps",
          "DeBakey Forceps",
          "Russian Tissue Forceps",
          "Tying Forceps",
          "Dressing Forceps",
        ],
      },
      {
        slug: "needle-holders",
        name: "Needle Holders",
        description: "Needle holders for Plastic Surgery suturing support.",
        products: [
          "Castroviejo Needle Holder",
          "Webster Needle Holder",
          "Halsey Needle Holder",
          "Ryder Needle Holder",
          "Mayo-Hegar Needle Holder",
          "Olsen-Hegar Needle Holder",
          "Derf Needle Holder",
          "Crile-Wood Needle Holder",
          "TC Needle Holder",
          "Micro Needle Holder",
        ],
      },
      {
        slug: "retractors",
        name: "Retractors",
        description: "Retractor patterns for Plastic Surgery exposure requirements.",
        products: [
          "Skin Hook",
          "Joseph Retractor",
          "Kilner Retractor",
          "Aufricht Retractor",
          "Senn Retractor",
          "Ragnell Retractor",
          "Desmarres Retractor",
          "Army-Navy Retractor",
          "Gelpi Retractor",
          "Weitlaner Retractor",
        ],
      },
    ],
  ),
  createCategory(
    "veterinary",
    "Veterinary",
    "Explore Veterinary instruments through five structured subcategories for distributors, hospitals, surgeons, and medical brands.",
    [
      {
        slug: "veterinary-scissors",
        name: "Veterinary Scissors",
        description: "Scissors patterns for Veterinary catalogue development.",
        products: [
          "Mayo Straight Scissors",
          "Mayo Curved Scissors",
          "Metzenbaum Straight Scissors",
          "Metzenbaum Curved Scissors",
          "Operating Scissors",
          "Lister Bandage Scissors",
          "Spencer Stitch Scissors",
          "Iris Straight Scissors",
          "Iris Curved Scissors",
          "SuperCut Scissors",
        ],
      },
      {
        slug: "veterinary-forceps",
        name: "Veterinary Forceps",
        description: "Forceps prepared for structured Veterinary instrument lines.",
        products: [
          "Allis Tissue Forceps",
          "Babcock Tissue Forceps",
          "Kocher Forceps",
          "Rochester Pean Forceps",
          "Kelly Forceps Straight",
          "Kelly Forceps Curved",
          "Halsted Mosquito Forceps",
          "Adson Tissue Forceps",
          "Dressing Forceps",
          "Sponge Holding Forceps",
        ],
      },
      {
        slug: "needle-holders",
        name: "Needle Holders",
        description: "Needle holders for Veterinary suturing support.",
        products: [
          "Mayo-Hegar Needle Holder",
          "Olsen-Hegar Needle Holder",
          "Crile-Wood Needle Holder",
          "Mathieu Needle Holder",
          "Webster Needle Holder",
          "Ryder Needle Holder",
          "Halsey Needle Holder",
          "Castroviejo Needle Holder",
          "Derf Needle Holder",
          "TC Needle Holder",
        ],
      },
      {
        slug: "retractors",
        name: "Retractors",
        description: "Retractor patterns for Veterinary exposure requirements.",
        products: [
          "Army-Navy Retractor",
          "Senn Retractor",
          "Gelpi Retractor",
          "Weitlaner Retractor",
          "Richardson Retractor",
          "Deaver Retractor",
          "Langenbeck Retractor",
          "Volkmann Retractor",
          "Rake Retractor",
          "Parker Retractor",
        ],
      },
      {
        slug: "castration-large-animal-instruments",
        name: "Castration & Large Animal Instruments",
        description: "Castration and large animal instruments for Veterinary specialty requirements.",
        products: [
          "Burdizzo Castrator",
          "Emasculator",
          "Henderson Castrating Tool",
          "Reimer Emasculator",
          "Hoof Knife",
          "Hoof Nipper",
          "Dehorner",
          "Bull Nose Ring Applicator",
          "Trocar & Cannula",
          "Obstetrical Hook",
        ],
      },
    ],
  ),
  createCategory(
    "orthognathic",
    "Orthognathic",
    "Explore Orthognathic Surgery Instruments through five structured subcategories for maxillary, mandibular, and genioplasty procedures.",
    [
      {
        slug: "le-fort-i-maxillary-osteotomy-instruments",
        name: "Le Fort I & Maxillary Osteotomy Instruments",
        description: "Instruments for Le Fort I and maxillary osteotomy procedures.",
        products: [
          { name: "Blade Osteotome", slug: "le-fort-i-osteotome" },
          "Pterygoid Osteotome",
          "Curved Maxillary Osteotome",
          "Straight Maxillary Osteotome",
          "Maxillary Chisel",
          "Nasal Septum Osteotome",
          "Maxillary Bone Spreader",
          "Le Fort I Osteotomy Retractor",
          "Rowe Disimpaction Forceps",
          { name: "Le Fort I Posterior Retractor", slug: "maxillary-le-fort-i-retractor" },
        ],
      },
      {
        slug: "bsso-mandibular-osteotomy-instruments",
        name: "BSSO & Mandibular Osteotomy Instruments",
        description: "Instruments for BSSO and mandibular osteotomy procedures.",
        products: [
          "BSSO Splitting Osteotome",
          "Obwegeser Split Osteotome",
          "BSSO Chisel",
          "Curved Steinhauser Osteotome",
          "Obwegeser Ramus Retractor",
          "Hargis Anterior Border Stripper",
          "Mandibular Ramus Retractor",
          "Smith Ramus Separator",
          "Obwegeser Channel Retractor",
          "Obwegeser J-Stripper",
        ],
      },
      {
        slug: "orthognathic-retractors-elevators",
        name: "Orthognathic Retractors & Elevators",
        description: "Retractors and elevators for Orthognathic Surgery procedures.",
        products: [
          "Obwegeser Ramus Retractor",
          "Le Fort I Retractor",
          "Obwegeser Toe-In Retractor",
          "Obwegeser Toe-Out Retractor",
          "Mandibular Ramus Retractor",
          "Maxillary Retractor",
          "Langenbeck Retractor",
          "Soft Tissue Retractor",
          "Bone Hook / Osteotomy Hook",
          "Chin / Genioplasty Retractor",
        ],
      },
      {
        slug: "genioplasty-instruments",
        name: "Genioplasty Instruments",
        description: "Instruments for genioplasty and chin osteotomy procedures.",
        products: [
          "Chin Osteotomy Retractor",
          "Chin Retractor",
          "Genioplasty Osteotome",
          "Chin Osteotome – Thin",
          "Chin Osteotome – Wedge",
          "Genioplasty Bone Hook",
          "Chin Repositioning Forceps",
          "Genioplasty Bone Holding Forceps",
          "Chin Holder",
          { name: "Chin Osteotomy Periosteal Elevator", slug: "genioplasty-cutting-guide" },
        ],
      },
      {
        slug: "orthognathic-osteotomes-chisels-bone-instruments",
        name: "Orthognathic Osteotomes, Chisels & Bone Instruments",
        description: "Osteotomes, chisels, and bone instruments for Orthognathic Surgery.",
        products: [
          "Straight Osteotome",
          "Curved Osteotome",
          "Angled Osteotome",
          "Guarded Osteotome",
          "Double-Guarded Osteotome",
          "Straight Chisel",
          "Curved Chisel",
          "Bone Spreader",
          "Periosteal Elevator",
          "Bone Elevator",
        ],
      },
    ],
    true,
  ),
];

/** Categories and nested subcategories are always shown A–Z sitewide. */
export const catalogCategories: CatalogCategory[] = [...catalogCategoriesUnsorted].sort(compareByName);

export function getCategory(categorySlug: string) {
  return catalogCategories.find((category) => category.slug === categorySlug);
}

export function getSubcategory(categorySlug: string, subcategorySlug: string) {
  return getCategory(categorySlug)?.subcategories.find((subcategory) => subcategory.slug === subcategorySlug);
}

export function getProduct(categorySlug: string, subcategorySlug: string, productSlug: string) {
  return getSubcategory(categorySlug, subcategorySlug)?.products.find((product) => product.slug === productSlug);
}

/**
 * Re-read image files from public/images/products for a subcategory's products.
 * Does not change catalog names/slugs — only refreshes resolved gallery URLs from disk.
 */
export function withFreshProductImages(
  categorySlug: string,
  subcategory: CatalogSubcategory,
): CatalogSubcategory {
  return {
    ...subcategory,
    products: subcategory.products.map((product) => {
      const gallery = getProductImages(
        product.imageSource.categorySlug,
        product.imageSource.subcategorySlug,
        product.slug,
      );
      return {
        ...product,
        gallery,
        image: gallery.hero,
      };
    }),
  };
}

/**
 * Re-read subcategory hero images from disk (e.g. `{subcategory}-hero-image/`).
 * Keeps names/slugs unchanged — only refreshes card/navigator image URLs.
 */
export function withFreshCategoryImages(category: CatalogCategory): CatalogCategory {
  return {
    ...category,
    subcategories: category.subcategories.map((subcategory) => ({
      ...subcategory,
      image: getSubcategoryHeroImage(category.slug, subcategory.slug, category.image),
    })),
  };
}

import type { CatalogSearchHit } from "./catalog-search";

export type { CatalogSearchHit } from "./catalog-search";
export { searchCatalog } from "./catalog-search";
export { getProductWhatsAppLink } from "./catalog-whatsapp";
export {
  getCategoryHeroImage,
  getProductHeroImage,
  getProductImages,
  getSubcategoryHeroImage,
  PRODUCT_IMAGE_PLACEHOLDER,
} from "./product-images";
export type { ProductGalleryImages } from "./product-images";

export function getCatalogSearchIndex(): CatalogSearchHit[] {
  const hits: CatalogSearchHit[] = [];

  for (const category of catalogCategories) {
    hits.push({
      type: "category",
      name: category.name,
      href: `/products/${category.slug}`,
      breadcrumb: category.name,
      image: category.image,
    });

    for (const subcategory of category.subcategories) {
      hits.push({
        type: "subcategory",
        name: subcategory.name,
        href: `/products/${category.slug}/${subcategory.slug}`,
        breadcrumb: `${category.name} / ${subcategory.name}`,
        image: subcategory.image,
      });

      for (const product of subcategory.products) {
        hits.push({
          type: "product",
          name: product.name,
          href: `/products/${category.slug}/${subcategory.slug}/${product.slug}`,
          breadcrumb: `${category.name} / ${subcategory.name}`,
          image: product.image,
        });
      }
    }
  }

  return hits;
}

export function getAllCatalogPaths() {
  return getCatalogSearchIndex().map((hit) => hit.href);
}
