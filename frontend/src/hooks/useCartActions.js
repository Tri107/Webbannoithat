import {
  addToCart,
  updateCartItem,
  updateCartItemColor,
  removeCartItem,
  clearCart,
} from "../lib/cartApi";

import { useCart } from "./useCart";
import toast from "react-hot-toast";

export const useCartActions = (backupRefetch) => {
  const cartContext = useCart();
  const refetch = cartContext?.refetch || backupRefetch;
  const { optimisticUpdate, optimisticRemove, optimisticAdd } = cartContext || {};
  const handleAddToCart = async (
    productId,
    sku = "UNKNOWN-SKU",
    price = 0,
    color = null,
  ) => {
    try {
      if (optimisticAdd) optimisticAdd();
      await addToCart(productId, 1, sku, price, color);// default quantity = 1
      toast.success("Added to cart");
      if (refetch) refetch();
    } catch (err) {
      console.log(err);
      toast.error("Add to cart failed");
    }
  };

  const handleUpdateQuantity = async (cartItemId, quantity) => {
    if (optimisticUpdate) optimisticUpdate(cartItemId, quantity);
    try {
      await updateCartItem(cartItemId, quantity);
      if (refetch) refetch();
    } catch (err) {
      toast.error("Update failed");
      if (refetch) refetch();
    }
  };

  const handleUpdateColor = async (cartItemId, color) => {
    try {
      await updateCartItemColor(cartItemId, color);
      refetch();
      toast.success("Color updated in cart");
    } catch (err) {
      console.log(err);
      toast.error("Update color failed");
    }
  };

  const handleRemove = async (productId) => {
    if (optimisticRemove) optimisticRemove(productId);
    try {
      await removeCartItem(productId);
      toast.success("Removed");
      if (refetch) refetch();
    } catch (err) {
      toast.error("Remove failed");
      if (refetch) refetch();
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast.success("Cart cleared");
      if (refetch) refetch();
    } catch (err) {
      toast.error("Clear failed");
      if (refetch) refetch();
    }
  };

  return {
    handleAddToCart,
    handleUpdateQuantity,
    handleUpdateColor,
    handleRemove,
    handleClearCart,
  };
};
