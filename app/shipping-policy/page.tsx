import Footer from "@/app/components/Footer";
import NavbarWithSearch from "@/app/components/NavbarWithSearch";
import PolicyPageContent from "@/app/components/policy/PolicyPageContent";
import { shippingPolicy } from "@/app/lib/policy-pages";
import { buildCatalogMetadata } from "@/app/lib/seo";

export const metadata = buildCatalogMetadata({
  title: `${shippingPolicy.title} | Mubdi Surgical Instruments`,
  description: shippingPolicy.metaDescription,
  path: shippingPolicy.path,
});

export default function ShippingPolicyPage() {
  return (
    <>
      <NavbarWithSearch />
      <main className="flex-1">
        <PolicyPageContent policy={shippingPolicy} />
      </main>
      <Footer />
    </>
  );
}
