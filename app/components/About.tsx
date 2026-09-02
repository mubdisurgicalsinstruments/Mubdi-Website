"use client";

import type { MouseEvent } from "react";

export default function About() {
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

  return (
    <section
      id="about"
      className="scroll-mt-24 bg-background py-10 sm:scroll-mt-28 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:gap-20">
          <div className="flex flex-col justify-center lg:py-3">
            <p className="section-label">
              <span className="section-label-rule" />
              About Mubdi
            </p>
            <h2 className="section-heading mt-6 max-w-2xl text-[2rem] sm:text-[2.55rem]">
              Precision instruments. Trusted manufacturing.
            </h2>
            <p className="body-copy mt-6 max-w-2xl text-base">
              MUBDI Surgical Instruments manufactures precision surgical instruments for distributors,
              hospitals, surgeons, and medical brands worldwide. We combine skilled craftsmanship,
              consistent manufacturing standards, and flexible production to deliver dependable
              instruments and tailored supply solutions.
            </p>
            <a
              href="#oem"
              onClick={(event) => handleSectionClick(event, "oem")}
              className="text-link group mt-9 w-fit"
            >
              Explore Our Capabilities
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                →
              </span>
            </a>
          </div>

          <div className="flex h-full flex-col justify-center rounded-2xl border border-border bg-surface p-7 shadow-[0_14px_34px_rgba(10,35,66,0.04)] sm:p-9 lg:p-10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-navy">
              Built for professional medical partners
            </p>
            <ul className="mt-6 divide-y divide-border-light border-y border-border-light">
              {[
                "Precision manufacturing for established specifications and requirements.",
                "Private-label production and custom branding support.",
                "Flexible supply for distributors, hospitals, surgeons, and medical brands.",
              ].map((point) => (
                <li key={point} className="flex gap-3.5 py-4 text-sm leading-6 text-navy-muted">
                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-navy" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
