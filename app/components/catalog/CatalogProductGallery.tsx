"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/app/lib/product-image-constants";

/** Canonical product-hero frame: 1536 × 1536 (1:1). Scales down responsively. */
export const PRODUCT_HERO_SIZE_PX = 1536;

type CatalogProductGalleryProps = {
  heroImage: string;
  productName: string;
};

function GalleryImage({
  src,
  alt,
  preload = false,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  preload?: boolean;
  sizes: string;
  className?: string;
}) {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <Image
      key={currentSrc}
      src={currentSrc}
      alt={alt}
      fill
      preload={preload}
      sizes={sizes}
      className={className}
      onError={() => {
        if (currentSrc === PRODUCT_IMAGE_PLACEHOLDER) return;
        setCurrentSrc(PRODUCT_IMAGE_PLACEHOLDER);
      }}
    />
  );
}

export default function CatalogProductGallery({
  heroImage,
  productName,
}: CatalogProductGalleryProps) {
  if (!heroImage) {
    return null;
  }

  // Fixed 1:1 hero frame (1536×1536 standard). object-contain keeps the full
  // instrument visible with navy negative space — never crop or stretch.
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[1536px] overflow-hidden rounded-2xl bg-navy"
      style={{ aspectRatio: "1 / 1" }}
    >
      <GalleryImage
        src={heroImage}
        alt={productName}
        preload
        sizes="(max-width: 639px) calc(100vw - 2.5rem), (max-width: 1023px) calc(100vw - 4rem), (max-width: 1279px) 58vw, 36rem"
        className="object-contain object-center"
      />
    </div>
  );
}
