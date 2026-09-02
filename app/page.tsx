import About from "./components/About";
import CustomManufacturing from "./components/CustomManufacturing";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import NavbarWithSearch from "./components/NavbarWithSearch";
import ProductCategories from "./components/ProductCategories";
import RequestQuote from "./components/RequestQuote";
import type { ProductQuoteContext } from "./components/RequestQuote";
import { getCategory, getSubcategory, withFreshProductImages } from "./lib/catalog";
import { isInquiryTypeSlug } from "./lib/manufacturing-services";
import { SITE_URL } from "./lib/seo";

type HomeProps = {
  searchParams: Promise<{
    service?: string;
    category?: string;
    subcategory?: string;
    product?: string;
  }>;
};

function resolveProductQuoteContext(
  params: Awaited<HomeProps["searchParams"]>,
): ProductQuoteContext | null {
  if (
    params.service !== "product-inquiry" ||
    !params.category ||
    !params.subcategory ||
    !params.product
  ) {
    return null;
  }

  const category = getCategory(params.category);
  const subcategoryBase = getSubcategory(params.category, params.subcategory);
  if (!category || !subcategoryBase) return null;

  const subcategory = withFreshProductImages(category.slug, subcategoryBase);
  const product = subcategory.products.find((item) => item.slug === params.product);
  if (!product) return null;

  return {
    productSlug: product.slug,
    productName: product.name,
    categorySlug: category.slug,
    categoryName: category.name,
    subcategorySlug: subcategory.slug,
    subcategoryName: subcategory.name,
    imageUrl: product.image.startsWith("http") ? product.image : `${SITE_URL}${product.image}`,
  };
}

function resolveInitialService(
  params: Awaited<HomeProps["searchParams"]>,
  hasProductContext: boolean,
) {
  if (hasProductContext || !params.service || params.service === "product-inquiry") {
    return "" as const;
  }

  return isInquiryTypeSlug(params.service) ? params.service : ("" as const);
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const productQuoteContext = resolveProductQuoteContext(params);
  const initialService = resolveInitialService(params, Boolean(productQuoteContext));

  return (
    <>
      <NavbarWithSearch />
      <main>
        <Hero />
        <ProductCategories />
        <CustomManufacturing />
        <About />
        <RequestQuote
          initialProductContext={productQuoteContext}
          initialService={initialService}
        />
      </main>
      <Footer />
    </>
  );
}
