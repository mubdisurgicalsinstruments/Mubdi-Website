import { getCatalogSearchIndex } from "@/app/lib/catalog";
import Navbar from "@/app/components/Navbar";

export default function NavbarWithSearch() {
  const searchIndex = getCatalogSearchIndex();
  return <Navbar searchIndex={searchIndex} />;
}
