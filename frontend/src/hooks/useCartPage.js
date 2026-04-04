import { useEffect, useMemo, useState } from "react";

const shippingFee = 0;
const assemblyFee = 200000;

export default function useCartPage(cartItems = []) {
  const [assembly, setAssembly] = useState(() => {
    try {
      const saved = localStorage.getItem("cart_assembly");
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) { }
    return true;
  });

  useEffect(() => {
    localStorage.setItem("cart_assembly", JSON.stringify(assembly));
  }, [assembly]);

  const items = useMemo(
    () =>
      cartItems.map((it) => {
        let snap = {};
        try {
          snap = typeof it.snapshot === 'string' ? JSON.parse(it.snapshot || '{}') : (it.snapshot || {});
        } catch (e) { }

        const imageArray = it.variants?.images;
        const img = Array.isArray(imageArray) && imageArray.length > 0
          ? imageArray[0]
          : (typeof imageArray === 'string' ? imageArray : "https://via.placeholder.com/300");

        const availableColors = Array.from(
          new Set(
            (it.variants?.variants || [])
              .map((v) => v.specs?.color)
              .filter((c) => c)
          )
        );

        return {
          cart_item_id: it.cart_item_id,
          id: it.product_id,
          name: it.product_name,
          sku: it.sku || "N/A",
          price: snap.price || 0,
          color: snap.color || "N/A",
          size: "N/A",
          qty: it.quantity,
          image: img,
          deliveryText: "Hàng sẽ được giao trong vòng 5-7 ngày",
          material: "N/A",
          availableColors
        };
      }),
    [cartItems],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.qty, 0),
    [items],
  );

  const discount = 0;

  const vat = useMemo(() => Math.round((subtotal - discount) * 0.1), [subtotal, discount]);

  const total = useMemo(() => {
    const service = assembly ? assemblyFee : 0;
    return Math.max(0, subtotal - discount + shippingFee + service + vat);
  }, [subtotal, discount, assembly, vat]);

  return {
    items,
    subtotal,
    discount,
    vat,
    total,
    shippingFee,
    assembly,
    setAssembly,
  };
}