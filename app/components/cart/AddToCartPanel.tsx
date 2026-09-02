"use client";

import { useState } from "react";
import { useCart } from "@/app/components/cart/CartProvider";
import {
  normalizeSizeSpecificationInput,
  parsePositiveIntegerQuantity,
  SIZE_SPECIFICATION_MAX_LENGTH,
  validateSizeSpecification,
} from "@/app/lib/cart";
import type { CatalogCategory, CatalogProduct, CatalogSubcategory } from "@/app/lib/catalog";

type AddToCartPanelProps = {
  category: CatalogCategory;
  subcategory: CatalogSubcategory;
  product: CatalogProduct;
};

function MinusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M3.5 8h9" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M8 3.5v9M3.5 8h9" strokeLinecap="round" />
    </svg>
  );
}

const purchaseActionClass =
  "flex h-11 min-h-0 min-w-0 items-center justify-center !gap-0 !px-3 !py-0 text-center text-sm font-semibold leading-none";

const addToCartButtonClass = `btn-primary ${purchaseActionClass} w-full shadow-[0_4px_14px_rgba(10,35,66,0.14)] hover:shadow-[0_6px_16px_rgba(10,35,66,0.16)]`;

export default function AddToCartPanel({
  category,
  subcategory,
  product,
}: AddToCartPanelProps) {
  const { addItem } = useCart();
  const [sizeSpecification, setSizeSpecification] = useState("");
  const [quantityInput, setQuantityInput] = useState("1");
  const [sizeError, setSizeError] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [addedMessage, setAddedMessage] = useState("");

  function currentQuantity(): number {
    return parsePositiveIntegerQuantity(quantityInput) ?? 1;
  }

  function handleAddToCart() {
    const sizeValidationError = validateSizeSpecification(sizeSpecification);
    let hasError = false;

    if (sizeValidationError) {
      setSizeError(sizeValidationError);
      hasError = true;
    } else {
      setSizeError("");
    }

    const quantity = parsePositiveIntegerQuantity(quantityInput);
    if (quantity === null) {
      setQuantityError("Please select a valid quantity.");
      hasError = true;
    } else {
      setQuantityError("");
    }

    if (hasError || quantity === null) {
      setAddedMessage("");
      return;
    }

    const storedSize = sizeSpecification.trim();

    addItem({
      productSlug: product.slug,
      productName: product.name,
      categorySlug: category.slug,
      categoryName: category.name,
      subcategorySlug: subcategory.slug,
      subcategoryName: subcategory.name,
      imageUrl: product.gallery.hero,
      sizeSpecification: storedSize,
      quantity,
    });

    setAddedMessage("Added to cart");
    window.setTimeout(() => setAddedMessage(""), 2500);
  }

  return (
    <div
      role="group"
      aria-label="Add to cart"
      className="border-t border-border bg-warm-gray/35 px-3 py-2.5"
    >
      <h2 className="pt-1.5 text-xs font-bold uppercase tracking-[0.18em] text-navy">Add to Cart</h2>

      <div className="mt-2 flex flex-col gap-2">
        <div>
          <label htmlFor={`size-spec-${product.slug}`} className="text-sm font-semibold text-navy">
            Size
          </label>
          <input
            id={`size-spec-${product.slug}`}
            name="sizeSpecification"
            type="text"
            value={sizeSpecification}
            maxLength={SIZE_SPECIFICATION_MAX_LENGTH}
            onChange={(event) => {
              setSizeSpecification(normalizeSizeSpecificationInput(event.target.value));
              if (sizeError) setSizeError("");
            }}
            placeholder="Enter required size or short detail..."
            autoComplete="off"
            required
            aria-invalid={sizeError ? true : undefined}
            aria-describedby={sizeError ? `size-error-${product.slug}` : undefined}
            className={`mt-0.5 w-full rounded-[var(--radius-control)] border bg-white px-3 py-1.5 text-sm text-navy outline-none transition-colors placeholder:text-muted-light focus:border-navy ${
              sizeError ? "border-red-700" : "border-border"
            }`}
          />
          {sizeError ? (
            <p id={`size-error-${product.slug}`} className="mt-1 text-sm text-red-700" role="alert">
              {sizeError}
            </p>
          ) : null}
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-navy">Quantity</span>
            <div className="inline-flex items-center rounded-[var(--radius-control)] border border-border bg-white">
              <button
                type="button"
                className="grid size-8 place-items-center text-navy transition-colors hover:bg-warm-gray disabled:opacity-40"
                aria-label="Decrease quantity"
                disabled={currentQuantity() <= 1}
                onClick={() => {
                  setQuantityInput(String(Math.max(1, currentQuantity() - 1)));
                  if (quantityError) setQuantityError("");
                }}
              >
                <span className="size-3.5">
                  <MinusIcon />
                </span>
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                aria-label="Quantity"
                value={quantityInput}
                onChange={(event) => {
                  setQuantityInput(event.target.value.replace(/\D/g, ""));
                  if (quantityError) setQuantityError("");
                }}
                onBlur={() => {
                  const parsed = parsePositiveIntegerQuantity(quantityInput);
                  setQuantityInput(parsed ? String(parsed) : "1");
                }}
                className="min-w-9 w-12 border-x border-border bg-transparent px-2 text-center text-sm font-semibold text-navy outline-none focus:bg-warm-gray/40"
              />
              <button
                type="button"
                className="grid size-8 place-items-center text-navy transition-colors hover:bg-warm-gray"
                aria-label="Increase quantity"
                onClick={() => {
                  setQuantityInput(String(currentQuantity() + 1));
                  if (quantityError) setQuantityError("");
                }}
              >
                <span className="size-3.5">
                  <PlusIcon />
                </span>
              </button>
            </div>
          </div>
          {quantityError ? (
            <p className="mt-1 text-right text-sm text-red-700" role="alert">
              {quantityError}
            </p>
          ) : null}
        </div>

        <button type="button" className={addToCartButtonClass} onClick={handleAddToCart}>
          Add to Cart
        </button>

        {addedMessage ? (
          <p className="text-center text-sm font-medium text-navy" role="status">
            {addedMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}
