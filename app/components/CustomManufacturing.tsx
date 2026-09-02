"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import {
  manufacturingServices,
  type ManufacturingServiceSlug,
} from "../lib/manufacturing-services";

type CapabilityIcon =
  | "custom"
  | "privateLabel"
  | "branding"
  | "packaging";

const capabilityIcons: Record<ManufacturingServiceSlug, CapabilityIcon> = {
  "custom-manufacturing": "custom",
  "private-label-manufacturing": "privateLabel",
  "custom-branding-engraving": "branding",
  "custom-packaging": "packaging",
};

const capabilities = manufacturingServices.map((service) => ({
  ...service,
  icon: capabilityIcons[service.slug],
}));

function CapabilityIcon({ name }: { name: CapabilityIcon }) {
  const paths = {
    custom: (
      <>
        <path d="M12 3.5 19 7v5c0 4.4-3 7.2-7 8.5-4-1.3-7-4.1-7-8.5V7l7-3.5Z" />
        <path d="M9 12h6M12 9v6" />
      </>
    ),
    privateLabel: (
      <>
        <path d="M5 7h14v12H5V7Z" />
        <path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7" />
        <path d="M8.5 12h7M8.5 15.5h5" />
      </>
    ),
    branding: (
      <>
        <path d="M4 19V9l4 2V7l4 2V5l4 2v12H4Z" />
        <path d="M8 19v-4h4v4" />
      </>
    ),
    packaging: (
      <>
        <path d="m4.5 8 7.5-4 7.5 4v8l-7.5 4-7.5-4V8Z" />
        <path d="M4.5 8 12 12l7.5-4M12 12v8" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export default function CustomManufacturing() {
  const router = useRouter();

  function handleSectionClick(
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const target = document.getElementById(sectionId);
    if (!target) return;

    event.preventDefault();
    window.history.pushState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#${sectionId}`,
    );
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleServiceClick(
    event: MouseEvent<HTMLAnchorElement>,
    service: ManufacturingServiceSlug,
  ) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    const href = `/?service=${service}#inquiry`;
    const target = document.getElementById("inquiry");

    if (!target) {
      router.push(href);
      return;
    }

    window.history.pushState(null, "", href);
    window.dispatchEvent(
      new CustomEvent("quote-service-selected", { detail: service }),
    );
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section
      id="oem"
      className="scroll-mt-28 bg-background py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="max-w-3xl">
          <p className="section-label">
            <span className="section-label-rule" />
            Custom Manufacturing
          </p>
          <h2 className="section-heading mt-5 text-[2rem] sm:text-[2.45rem]">
            Manufacturing solutions built around your requirements.
          </h2>
          <p className="body-copy mt-5 text-base">
            From custom production and private-label manufacturing to branding and packaging, we
            provide flexible solutions for distributors, hospitals, surgeons, and medical brands.
          </p>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {capabilities.map((capability) => (
            <a
              key={capability.title}
              href={`/?service=${capability.slug}#inquiry`}
              onClick={(event) => handleServiceClick(event, capability.slug)}
              className="group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border border-border bg-surface px-5 py-6 text-center transition-[transform,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-navy/30 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-navy"
            >
              <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-lg bg-white text-navy ring-1 ring-border">
                <span className="size-8">
                  <CapabilityIcon name={capability.icon} />
                </span>
              </span>
              <h3 className="max-w-[14rem] text-[1.05rem] font-semibold leading-snug tracking-[-0.02em] text-navy">
                {capability.title}
              </h3>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-muted transition-colors duration-200 group-hover:text-navy">
                Request a quote
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </span>
            </a>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-navy">Have a specific requirement?</p>
          <a
            href="#inquiry"
            onClick={(event) => handleSectionClick(event, "inquiry")}
            className="text-link"
          >
            Discuss your requirements
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
