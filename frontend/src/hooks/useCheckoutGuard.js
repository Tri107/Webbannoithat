import { useEffect } from "react";
import toast from "react-hot-toast";

export default function useCheckoutGuard(cartItems, loading, isSubmitting, navigate) {
  useEffect(() => {
    if (loading || isSubmitting) return;

    if (!cartItems || cartItems.length === 0) {
      toast.error("Giỏ hàng đang trống.");
      navigate("/cart");
    }
  }, [cartItems, loading, isSubmitting, navigate]);
}
