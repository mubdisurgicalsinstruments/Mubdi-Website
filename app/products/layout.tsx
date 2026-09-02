import Footer from "@/app/components/Footer";
import NavbarWithSearch from "@/app/components/NavbarWithSearch";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavbarWithSearch />
      {children}
      <Footer />
    </>
  );
}
