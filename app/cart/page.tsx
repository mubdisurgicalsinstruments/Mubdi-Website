import Footer from "@/app/components/Footer";
import NavbarWithSearch from "@/app/components/NavbarWithSearch";
import CartPageContent from "@/app/components/cart/CartPageContent";
import { buildCatalogMetadata } from "@/app/lib/seo";

export const metadata = buildCatalogMetadata({
  title: "Your Instrument List | Mubdi Surgical Instruments",
  description:
    "Review your selected surgical instruments and submit your requirements for a quotation with Mubdi Surgical Instruments.",
  path: "/cart",
});

export default function CartPage() {
  return (
    <>
      <NavbarWithSearch />
      <main className="flex-1">
        <CartPageContent />
      </main>
      <Footer />
    </>
  );
}
