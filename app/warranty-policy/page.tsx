import Footer from "@/app/components/Footer";
import NavbarWithSearch from "@/app/components/NavbarWithSearch";
import PolicyPageContent from "@/app/components/policy/PolicyPageContent";
import { warrantyPolicy } from "@/app/lib/policy-pages";
import { buildCatalogMetadata } from "@/app/lib/seo";

export const metadata = buildCatalogMetadata({
  title: `${warrantyPolicy.title} | Mubdi Surgical Instruments`,
  description: warrantyPolicy.metaDescription,
  path: warrantyPolicy.path,
});

export default function WarrantyPolicyPage() {
  return (
    <>
      <NavbarWithSearch />
      <main className="flex-1">
        <PolicyPageContent policy={warrantyPolicy} />
      </main>
      <Footer />
    </>
  );
}
