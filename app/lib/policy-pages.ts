import { COMPANY_NAME, EMAIL } from "./constants";

export type PolicySection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type PolicyPageDefinition = {
  slug: string;
  path: string;
  title: string;
  metaDescription: string;
  intro: string;
  sections: PolicySection[];
};

export const footerPolicyLinks = [
  { label: "Return & Refund Policy", href: "/return-refund-policy" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Warranty Policy", href: "/warranty-policy" },
] as const;

export const returnRefundPolicy: PolicyPageDefinition = {
  slug: "return-refund-policy",
  path: "/return-refund-policy",
  title: "Return & Refund Policy",
  metaDescription:
    "Return and refund terms for Mubdi Surgical Instruments orders, including eligibility, time limits, and the return request process.",
  intro: `This Return & Refund Policy explains how returns, refunds, and replacements are handled for products supplied by ${COMPANY_NAME}. By placing an order with us, you agree to the terms described on this page. This policy does not affect your statutory rights where applicable law provides otherwise.`,
  sections: [
    {
      title: "Overview",
      paragraphs: [
        "We want customers to receive instruments that meet their requirements. Returns may be accepted in limited circumstances and only when the conditions below are met. Returns are not unconditional, and approval is required before any item is sent back to us.",
        "Cash refunds are available only for eligible returns requested within fifteen (15) days of confirmed delivery. After that period, cash refunds are not offered. Where an issue remains eligible, we may offer a replacement or another appropriate resolution instead of a refund.",
      ],
    },
    {
      title: "Eligibility for Returns",
      bullets: [
        "The return request must be submitted within fifteen (15) days of confirmed delivery for a cash refund to be considered.",
        "The item must be unused, complete, and in the same undamaged condition as when delivered.",
        "Original packaging, labels, and accompanying components should be included where reasonably possible.",
        "The product must not show signs of use, installation, sterilization, modification, or mishandling.",
        "A valid proof of purchase or order reference must be provided.",
        "The return must be pre-approved in writing by our sales team before shipment back to us.",
      ],
    },
    {
      title: "Items That Are Not Eligible for Return or Refund",
      bullets: [
        "Products that are damaged, used, altered, improperly stored, or otherwise not in resalable condition.",
        "Items returned without prior approval or outside the approved return window.",
        "Products missing components, markings, or documentation that affect identification or resale.",
        "Custom-manufactured, private-label, engraved, or made-to-order products, except where required by applicable law or where we confirm a manufacturing error on our part.",
        "Items affected by normal wear, improper cleaning, or use contrary to standard surgical-instrument handling practices.",
        "Products where damage arose after delivery due to handling, storage, or use by the customer or third parties.",
      ],
    },
    {
      title: "Defective, Incorrect, or Missing Items",
      paragraphs: [
        "If you believe an item is defective, incorrect, or missing from your shipment, contact us promptly with your order number, product details, and supporting photographs where available. We will review the case and advise whether a return, replacement, credit, or other resolution is appropriate.",
        "For issues reported after the fifteen (15) day cash-refund window, replacement or repair may be considered where appropriate, but a cash refund will not be issued unless we are required to do so by law.",
      ],
    },
    {
      title: "How to Request a Return",
      bullets: [
        `Email ${EMAIL} or contact us through your usual Mubdi sales channel within the applicable time frame.`,
        "Include your order number, invoice or delivery reference, product name, quantity, and reason for the request.",
        "Provide clear photographs of the product and packaging if the request relates to damage, defect, or a discrepancy.",
        "Wait for written return authorization and instructions before sending any goods back to us.",
        "Ship approved returns using a traceable service and retain proof of dispatch.",
      ],
    },
    {
      title: "Return Shipping",
      paragraphs: [
        "Unless we confirm otherwise in writing, the customer is responsible for return shipping costs and any associated export, import, or customs charges on returned goods.",
        "We may specify the return destination, required documentation, and packaging standards. Returns sent without authorization or to an incorrect address may be refused or delayed.",
        "Risk of loss for return shipments remains with the sender until the goods are received and accepted at our designated facility.",
      ],
    },
    {
      title: "Inspection and Approval",
      paragraphs: [
        "All returned items are subject to inspection upon receipt. Approval of a return does not guarantee that a refund or replacement will be issued until the product condition and eligibility have been verified.",
        "If a returned item does not meet the conditions of this policy, we may decline the return, issue a partial credit at our discretion, or return the item to the customer, and any associated costs may be charged to the customer.",
      ],
    },
    {
      title: "Refunds",
      paragraphs: [
        "Approved cash refunds are issued only for eligible returns requested within fifteen (15) days of confirmed delivery and only after inspection confirms that the product qualifies under this policy.",
        "Refunds are made to the original payment method where practicable. Processing times vary depending on the payment provider, bank, or intermediary involved and may take several business days after approval.",
        "Shipping charges, duties, taxes, bank fees, and other third-party costs are generally non-refundable unless we agree otherwise in writing or applicable law requires otherwise.",
      ],
    },
    {
      title: "Replacements After the Refund Window",
      paragraphs: [
        "After the fifteen (15) day cash-refund period, eligible quality or fulfillment issues may be addressed through replacement, repair, or warranty review as appropriate. Cash refunds will not be provided solely because a request is made after that period.",
      ],
    },
    {
      title: "Custom and Made-to-Order Products",
      paragraphs: [
        "Instruments manufactured to customer drawings, specifications, branding, or order-specific requirements are generally not eligible for return or cash refund unless we confirm a manufacturing defect or an error attributable to Mubdi. Such cases are reviewed individually.",
      ],
    },
    {
      title: "Contact",
      paragraphs: [
        `For return or refund questions, contact ${COMPANY_NAME} at ${EMAIL}. Please include your order details so we can respond efficiently.`,
      ],
    },
  ],
};

export const shippingPolicy: PolicyPageDefinition = {
  slug: "shipping-policy",
  path: "/shipping-policy",
  title: "Shipping Policy",
  metaDescription:
    "International shipping information for Mubdi Surgical Instruments, including processing times, transit estimates, customs, and delivery support.",
  intro: `This Shipping Policy describes how ${COMPANY_NAME} processes and dispatches orders for customers worldwide. Delivery times are estimates only unless we expressly confirm otherwise in writing for a specific order.`,
  sections: [
    {
      title: "Order Processing",
      paragraphs: [
        "After order confirmation and any required payment or documentation checks, we prepare goods for dispatch from our manufacturing facility in Sialkot, Pakistan.",
        "Processing time depends on product availability, order size, customization requirements, export documentation, and current production schedule. Processing time is separate from shipping or transit time.",
        "We will advise if an order requires additional lead time before dispatch. Quoted lead times are estimates and not guaranteed delivery dates.",
      ],
    },
    {
      title: "Shipping Methods and Transit Estimates",
      paragraphs: [
        "We ship internationally using reputable courier and freight carriers selected according to destination, shipment size, and service requirements.",
        "Estimated transit times vary by destination, carrier service level, customs processing, and local delivery conditions. Transit estimates begin after the order has been handed to the carrier and are not guarantees of arrival on a specific date.",
      ],
      bullets: [
        "Express courier services: often several business days to two weeks internationally, depending on destination.",
        "Standard international services: commonly one to four weeks or longer, depending on route and customs.",
        "Air or sea freight for larger orders: timelines are quoted separately and depend on booking, documentation, and port handling.",
      ],
    },
    {
      title: "International Shipping",
      paragraphs: [
        "We export surgical instruments to distributors, hospitals, medical brands, and business customers in many countries. International shipments may require commercial invoices, packing lists, certificates, or other export documents.",
        "Customers are responsible for ensuring that ordered products may be lawfully imported into the destination country and for obtaining any import approvals or registrations required by local authorities.",
      ],
    },
    {
      title: "Tracking Information",
      paragraphs: [
        "Where available, we provide tracking details after dispatch. Tracking updates depend on the carrier and destination country systems and may not reflect real-time movement at every stage.",
        "If tracking has not updated for an extended period, contact us with your order number so we can assist with a carrier inquiry.",
      ],
    },
    {
      title: "Customs Clearance, Duties, and Taxes",
      paragraphs: [
        "International shipments are subject to customs inspection, import regulations, and local clearance procedures in the destination country.",
        "Unless otherwise agreed in writing, import duties, taxes, brokerage fees, storage charges, and other destination-country costs are the responsibility of the recipient.",
        "Delays caused by customs authorities, incomplete documentation, or regulatory holds are outside our direct control and do not entitle the customer to a refund of shipping charges or order cancellation after dispatch, except where required by law.",
      ],
    },
    {
      title: "Incorrect or Incomplete Addresses",
      paragraphs: [
        "Customers are responsible for providing accurate consignee details, including company name, contact person, telephone number, and full delivery address.",
        "If a shipment is delayed, returned, or incurs additional fees because of an incorrect or incomplete address supplied by the customer, those costs may be charged to the customer. Reshipment may require additional shipping payment.",
      ],
    },
    {
      title: "Lost, Delayed, or Damaged Shipments",
      paragraphs: [
        "If a shipment appears delayed, contact us with your order and tracking information. We will help investigate with the carrier where possible.",
        "If a parcel arrives visibly damaged, note the damage with the carrier where their process allows, take photographs of the outer packaging and contents, and contact us promptly with supporting details.",
        "Claims for loss or transit damage are subject to carrier terms, investigation periods, and packaging condition at receipt. We will work with you to pursue a reasonable resolution in line with carrier and insurance procedures.",
      ],
    },
    {
      title: "Split Shipments and Partial Dispatch",
      paragraphs: [
        "Large or mixed orders may be shipped in more than one parcel or on different dates. Each dispatch may have separate tracking and may clear customs independently.",
      ],
    },
    {
      title: "Contact",
      paragraphs: [
        `For shipping questions, contact ${EMAIL} and include your order number, destination country, and any tracking reference already received.`,
      ],
    },
  ],
};

export const warrantyPolicy: PolicyPageDefinition = {
  slug: "warranty-policy",
  path: "/warranty-policy",
  title: "Warranty Policy",
  metaDescription:
    "Two-year warranty terms for eligible Mubdi Surgical Instruments products, including coverage, claim procedures, and exclusions.",
  intro: `${COMPANY_NAME} provides a limited two (2) year warranty on eligible products against manufacturing defects under normal use, subject to the terms below. This warranty gives you specific rights and is in addition to any non-excludable rights you may have under applicable law.`,
  sections: [
    {
      title: "Warranty Period",
      paragraphs: [
        "Eligible standard catalogue products are covered by a two (2) year warranty from the date of delivery to the original purchaser, unless a different period is confirmed in writing for a specific order.",
        "This is a limited manufacturing warranty. It is not a lifetime guarantee and does not cover unlimited replacement without review.",
      ],
    },
    {
      title: "What the Warranty Covers",
      bullets: [
        "Manufacturing defects in materials or workmanship present at the time of delivery.",
        "Failure of a product to perform as intended when used, handled, cleaned, and stored in accordance with standard surgical-instrument practice.",
        "Issues confirmed after inspection to be attributable to production rather than use, misuse, or external damage.",
      ],
    },
    {
      title: "What the Warranty Does Not Cover",
      bullets: [
        "Normal wear, gradual performance changes, or deterioration from routine use over time.",
        "Damage caused by misuse, improper handling, incorrect cleaning or sterilization, or use contrary to intended purpose.",
        "Accidental damage, drops, impacts, corrosion from improper storage, or exposure to unsuitable environments.",
        "Unauthorized repair, modification, regrinding, alteration, or refurbishment by third parties.",
        "Products with removed, altered, or illegible markings where identification is required for warranty review.",
        "Consumables, wear components, or items expressly sold on an as-is basis where stated in the order confirmation.",
        "Custom or made-to-order products except where a manufacturing defect is confirmed; such cases are assessed individually.",
      ],
    },
    {
      title: "How to Submit a Warranty Claim",
      bullets: [
        `Contact ${EMAIL} with the subject line “Warranty Claim” and include your order or invoice reference.`,
        "Provide the product name, quantity, serial or batch details if available, date of delivery, and a clear description of the issue.",
        "Submit photographs showing the overall product, the affected area, and any relevant markings or packaging.",
        "Explain how the instrument has been used, cleaned, and stored since delivery.",
        "Do not return products for warranty review unless we issue written authorization and return instructions.",
      ],
    },
    {
      title: "Inspection and Evaluation",
      paragraphs: [
        "All warranty claims are subject to review. We may request additional information, photographs, or return of the product for inspection before a claim is approved.",
        "Approval is not automatic. A reported issue does not necessarily indicate a manufacturing defect. We will determine whether the condition falls within warranty coverage after evaluation.",
      ],
    },
    {
      title: "Resolution for Approved Claims",
      paragraphs: [
        "If a warranty claim is approved, we may, at our discretion, provide repair, replacement with the same or equivalent product, or another reasonable remedy appropriate to the circumstances.",
        "Replacement or repair is subject to product availability and production schedule. Where a direct replacement is not available, an equivalent alternative or credit may be offered.",
      ],
    },
    {
      title: "Shipping for Warranty Claims",
      paragraphs: [
        "Unless we confirm otherwise in writing, the customer is responsible for shipping products to us for inspection and for any associated export or import charges.",
        "If a claim is approved, we will advise whether return freight or outbound replacement shipping will be covered by Mubdi for that specific case. Free return shipping is not guaranteed in every situation.",
      ],
    },
    {
      title: "Custom and Private-Label Products",
      paragraphs: [
        "Instruments manufactured to customer-supplied specifications, branding, or drawings are covered only against confirmed manufacturing defects attributable to Mubdi production. Fit, finish, or functional preferences that meet agreed specifications are not warranty defects.",
      ],
    },
    {
      title: "Limitations",
      paragraphs: [
        "This warranty applies to the original purchaser and may not be transferable without our written consent.",
        "Our liability under this warranty is limited to repair, replacement, or another remedy described in this policy. We are not responsible for indirect, consequential, or commercial losses arising from instrument unavailability, except where prohibited by law.",
      ],
    },
    {
      title: "Contact",
      paragraphs: [
        `For warranty assistance, email ${EMAIL} with your order details and supporting photographs so our team can review your claim efficiently.`,
      ],
    },
  ],
};

export const policyPagesByPath: Record<string, PolicyPageDefinition> = {
  [returnRefundPolicy.path]: returnRefundPolicy,
  [shippingPolicy.path]: shippingPolicy,
  [warrantyPolicy.path]: warrantyPolicy,
};
