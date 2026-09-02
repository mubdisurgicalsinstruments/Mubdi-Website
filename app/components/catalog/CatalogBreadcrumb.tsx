import Link from "next/link";

export type BreadcrumbCrumb = {
  label: string;
  href?: string;
};

export default function CatalogBreadcrumb({ items }: { items: BreadcrumbCrumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-navy-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
              {index > 0 && <span aria-hidden="true" className="text-muted-light">/</span>}
              {item.href && !isLast ? (
                <Link href={item.href} className="transition-colors hover:text-navy">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "font-medium text-navy" : undefined} aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
