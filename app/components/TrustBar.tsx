type TrustItem = {
  title: string;
  description: string;
  icon: "quality" | "precision" | "oem" | "global";
};

const trustItems: TrustItem[] = [
  {
    title: "Quality Focused",
    description: "Reliable standards for hospitals, surgeons, and medical brands.",
    icon: "quality",
  },
  {
    title: "Precision Built",
    description: "Consistent profiles, finishes, and feel.",
    icon: "precision",
  },
  {
    title: "Custom Manufacturing",
    description: "Private label and branding ready.",
    icon: "oem",
  },
  {
    title: "Export Ready",
    description: "Supply support for worldwide markets.",
    icon: "global",
  },
];

function TrustIcon({ name }: { name: TrustItem["icon"] }) {
  const paths = {
    quality: (
      <>
        <path d="M12 3.5 19 7v5c0 4.4-3 7.2-7 8.5-4-1.3-7-4.1-7-8.5V7l7-3.5Z" />
        <path d="m8.7 12 2.1 2.1 4.5-4.5" />
      </>
    ),
    precision: (
      <path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Zm6 12 .8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z" />
    ),
    oem: (
      <>
        <path d="M12 3.5 19 7v5c0 4.4-3 7.2-7 8.5-4-1.3-7-4.1-7-8.5V7l7-3.5Z" />
        <path d="M9 12h6M12 9v6" />
      </>
    ),
    global: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.8 12h16.4M12 3.5c2 2.3 3 5.1 3 8.5s-1 6.2-3 8.5c-2-2.3-3-5.1-3-8.5s1-6.2 3-8.5Z" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export default function TrustBar() {
  return (
    <section aria-label="Mubdi trust signals" className="border-y border-border bg-white">
      <div className="mx-auto grid max-w-7xl divide-y divide-border-light px-5 sm:px-8 md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-4 lg:px-10">
        {trustItems.map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-3.5 py-6 md:px-6 md:first:pl-0 lg:px-7 lg:first:pl-0 lg:last:pr-0"
          >
            <span className="mt-0.5 size-[1.25rem] shrink-0 text-navy">
              <TrustIcon name={item.icon} />
            </span>
            <span>
              <span className="block text-sm font-bold tracking-[-0.01em] text-navy">{item.title}</span>
              <span className="mt-1 block text-xs leading-5 text-muted sm:text-sm sm:leading-6">
                {item.description}
              </span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
