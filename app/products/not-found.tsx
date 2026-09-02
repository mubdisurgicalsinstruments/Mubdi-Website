import Link from "next/link";
import { PRODUCTS_HOME_HREF } from "@/app/lib/catalog-nav";

export default function ProductsNotFound() {
  return (
    <main className="bg-background">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
        <p className="section-label">
          <span className="section-label-rule" />
          Products
        </p>
        <h1 className="section-heading mt-4 text-3xl sm:text-4xl">Page not found</h1>
        <p className="body-copy mt-4 max-w-lg">
          This product path does not exist or may have moved.
        </p>
        <Link href={PRODUCTS_HOME_HREF} className="btn-primary mt-8">
          Back to Products
        </Link>
      </div>
    </main>
  );
}
