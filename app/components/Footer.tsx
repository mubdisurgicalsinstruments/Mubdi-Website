import Link from "next/link";
import { PRODUCTS_HOME_HREF } from "@/app/lib/catalog-nav";
import {
  COMPANY_NAME,
  EMAIL,
  FACTORY_LOCATION,
  PHONE_DISPLAY,
  WHATSAPP_LINK,
} from "@/app/lib/constants";
import { footerPolicyLinks } from "@/app/lib/policy-pages";

const footerNav = [
  { label: "Products", href: PRODUCTS_HOME_HREF },
  { label: "Custom Manufacturing", href: "/#oem" },
  { label: "About", href: "/#about" },
  { label: "Request a Quote", href: "/#inquiry" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-2 lg:grid-cols-4 lg:px-10 lg:py-14">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.12em]">{COMPANY_NAME}</p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/65">
            Precision surgical instruments manufactured in {FACTORY_LOCATION} for international distributors, hospitals, surgeons, and medical brands.
          </p>
        </div>

        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/50">
            Explore
          </p>
          <ul className="mt-5 space-y-3">
            {footerNav.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="inline-flex min-h-11 items-center text-sm text-white/75 transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/50">
            Policies
          </p>
          <ul className="mt-5 space-y-3">
            {footerPolicyLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-11 items-center text-sm text-white/75 transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/50">
            Contact
          </p>
          <ul className="mt-5 space-y-3 text-sm text-white/75">
            <li>
              <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`} className="inline-flex min-h-11 items-center transition-colors hover:text-white">
                {PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center transition-colors hover:text-white">
                WhatsApp
              </a>
            </li>
            <li>{FACTORY_LOCATION}</li>
            <li>
              <a href={`mailto:${EMAIL}`} className="inline-flex min-h-11 items-center transition-colors hover:text-white">
                Email: {EMAIL}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>© {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</p>
          <p>Sialkot, Pakistan</p>
        </div>
      </div>
    </footer>
  );
}
