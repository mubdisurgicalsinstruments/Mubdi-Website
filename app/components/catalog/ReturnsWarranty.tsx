const warrantyItems = ["2 Year Warranty", "Return Accepted"] as const;

export default function ReturnsWarranty() {
  return (
    <div
      role="group"
      aria-label="Returns and warranty"
      className="border-t border-border bg-warm-gray/35 px-3 py-2.5"
    >
      <h2 className="pt-1.5 text-xs font-bold uppercase tracking-[0.18em] text-navy">Returns & Warranty</h2>

      <ul className="mt-2 space-y-1">
        {warrantyItems.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-navy">
            <span className="text-navy/65" aria-hidden="true">
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
