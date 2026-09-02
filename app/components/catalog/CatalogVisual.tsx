"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/app/lib/product-image-constants";

type CatalogVisualProps = {
  src: string;
  alt: string;
  preload?: boolean;
};

export default function CatalogVisual({ src, alt, preload = false }: CatalogVisualProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-surface">
      <Image
        key={currentSrc}
        src={currentSrc}
        alt={alt}
        fill
        preload={preload}
        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        onError={() => {
          if (currentSrc === PRODUCT_IMAGE_PLACEHOLDER) return;
          setCurrentSrc(PRODUCT_IMAGE_PLACEHOLDER);
        }}
      />
    </div>
  );
}
