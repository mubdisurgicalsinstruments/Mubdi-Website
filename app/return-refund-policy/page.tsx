import Footer from "@/app/components/Footer";
import NavbarWithSearch from "@/app/components/NavbarWithSearch";
import PolicyPageContent from "@/app/components/policy/PolicyPageContent";
import { returnRefundPolicy } from "@/app/lib/policy-pages";
import { buildCatalogMetadata } from "@/app/lib/seo";

export const metadata = buildCatalogMetadata({
  title: `${returnRefundPolicy.title} | Mubdi Surgical Instruments`,
  description: returnRefundPolicy.metaDescription,
  path: returnRefundPolicy.path,
});

export default function ReturnRefundPolicyPage() {
  return (
    <>
      <NavbarWithSearch />
      <main className="flex-1">
        <PolicyPageContent policy={returnRefundPolicy} />
      </main>
      <Footer />
    </>
  );
}
