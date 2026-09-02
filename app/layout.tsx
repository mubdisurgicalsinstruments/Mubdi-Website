import type { Metadata } from "next";
import localFont from "next/font/local";
import { CartProvider } from "@/app/components/cart/CartProvider";
import JsonLd from "@/app/components/catalog/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/app/lib/json-ld";
import { SITE_URL } from "@/app/lib/seo";
import "./globals.css";

const plusJakarta = localFont({
  src: "./fonts/PlusJakartaSans-latin.woff2",
  variable: "--font-plus-jakarta",
  weight: "400 700",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMono-latin.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Mubdi Surgical Instruments | Custom Manufacturing & Private Label",
    template: "%s",
  },
  description:
    "Mubdi Surgical Instruments manufactures precision surgical instruments in Sialkot, Pakistan for international distributors, hospitals, surgeons, and medical brands.",
  openGraph: {
    type: "website",
    siteName: "Mubdi Surgical Instruments",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-navy">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
