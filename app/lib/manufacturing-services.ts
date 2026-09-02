export const inquiryTypes = [
  { slug: "custom-manufacturing", title: "Custom Manufacturing" },
  { slug: "private-label-manufacturing", title: "Private Label Manufacturing" },
  { slug: "custom-branding-engraving", title: "Custom Branding & Engraving" },
  { slug: "custom-packaging", title: "Custom Packaging" },
  { slug: "product-inquiry", title: "Product Inquiry" },
  { slug: "general-other-inquiry", title: "General / Other Inquiry" },
] as const;

export type InquiryTypeSlug = (typeof inquiryTypes)[number]["slug"];

export const manufacturingServices = [
  inquiryTypes[0],
  inquiryTypes[1],
  inquiryTypes[2],
  inquiryTypes[3],
] as const;

export type ManufacturingServiceSlug = (typeof manufacturingServices)[number]["slug"];

export function isInquiryTypeSlug(value: string | null): value is InquiryTypeSlug {
  return inquiryTypes.some((option) => option.slug === value);
}

export function isManufacturingServiceSlug(
  value: string | null,
): value is ManufacturingServiceSlug {
  return manufacturingServices.some((service) => service.slug === value);
}
