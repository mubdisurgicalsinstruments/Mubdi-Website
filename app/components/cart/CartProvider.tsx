"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  buildCartItemId,
  CART_STORAGE_KEY,
  getCartItemCount,
  type CartItem,
} from "@/app/lib/cart";

type AddToCartInput = Omit<CartItem, "id" | "quantity"> & { quantity?: number };

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  addItem: (input: AddToCartInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function normalizeCartItem(item: unknown): CartItem | null {
  if (!item || typeof item !== "object") return null;

  const record = item as Record<string, unknown>;
  if (
    typeof record.productSlug !== "string" ||
    typeof record.productName !== "string" ||
    typeof record.categorySlug !== "string" ||
    typeof record.categoryName !== "string" ||
    typeof record.subcategorySlug !== "string" ||
    typeof record.subcategoryName !== "string" ||
    typeof record.imageUrl !== "string" ||
    typeof record.quantity !== "number"
  ) {
    return null;
  }

  const rawSize =
    typeof record.sizeSpecification === "string"
      ? record.sizeSpecification
      : typeof record.size === "string"
        ? record.size
        : "";
  const sizeSpecification = rawSize.trim() || null;
  const id =
    typeof record.id === "string"
      ? record.id
      : buildCartItemId(
          record.categorySlug,
          record.subcategorySlug,
          record.productSlug,
          sizeSpecification,
        );

  return {
    id,
    productSlug: record.productSlug,
    productName: record.productName,
    categorySlug: record.categorySlug,
    categoryName: record.categoryName,
    subcategorySlug: record.subcategorySlug,
    subcategoryName: record.subcategoryName,
    imageUrl: record.imageUrl,
    sizeSpecification,
    quantity: record.quantity,
  };
}

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => normalizeCartItem(item))
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrated]);

  const addItem = useCallback((input: AddToCartInput) => {
    const quantity = Math.max(1, input.quantity ?? 1);
    const sizeSpecification = input.sizeSpecification?.trim() || null;
    const id = buildCartItemId(
      input.categorySlug,
      input.subcategorySlug,
      input.productSlug,
      sizeSpecification,
    );

    setItems((current) => {
      const existing = current.find((item) => item.id === id);
      if (existing) {
        return current.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }

      return [
        ...current,
        {
          id,
          productSlug: input.productSlug,
          productName: input.productName,
          categorySlug: input.categorySlug,
          categoryName: input.categoryName,
          subcategorySlug: input.subcategorySlug,
          subcategoryName: input.subcategoryName,
          imageUrl: input.imageUrl,
          sizeSpecification,
          quantity,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      setItems((current) => current.filter((item) => item.id !== id));
      return;
    }

    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: getCartItemCount(items),
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [addItem, clearCart, items, removeItem, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
