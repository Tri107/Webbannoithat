import { useState } from "react";
import toast from "react-hot-toast";
import { createOrder, createVnpayPaymentUrl } from "@/lib/api";
import { clearCart } from "@/lib/cartApi";

export default function useCheckoutSubmit({
  cartItems,
  cart,
  shippingData,
  paymentMethod,
  navigate,
  optimisticClear,
  discountId,
  discountValue,
  discountPercentage,
  finalTotal,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!cartItems || cartItems.length === 0) {
      return false;
    }

    if (
      !shippingData.fullName.trim() ||
      !shippingData.phone.trim() ||
      !shippingData.address.trim() ||
      !shippingData.city.trim() ||
      !shippingData.district.trim() ||
      !shippingData.ward.trim()
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng.");
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (isSubmitting) return;

    if (!validate()) return;

    if (paymentMethod === "vnpay") {
      try {
        const data = await createVnpayPaymentUrl({
          amount: finalTotal,
        });

        if (data.paymentUrl) {
          sessionStorage.setItem(
            "pendingOrder",
            JSON.stringify({
              cartItems,
              shippingData,
              discountId,
              finalTotal,
            }),
          );

          window.location.href = data.paymentUrl;
          return;
        }

        throw new Error("Không nhận được link thanh toán VNPay.");
      } catch (error) {
        sessionStorage.removeItem("pendingOrder");
        toast.error(error.message || "Lỗi khi khởi tạo thanh toán VNPay.");
        setIsSubmitting(false);
      }

      return;
    }

    try {
      setIsSubmitting(true);

      const userStr = localStorage.getItem("user");
      if (!userStr) {
        toast.error("Vui lòng đăng nhập để tiếp tục.");
        return;
      }

      const user = JSON.parse(userStr);

      const fullAddress = `${shippingData.address}, ${shippingData.ward}, ${shippingData.district}, ${shippingData.city}`;

      const orderNote = `Người nhận: ${shippingData.fullName.trim()} - SĐT: ${shippingData.phone.trim()}. Ghi chú: ${(shippingData.note || "").trim()}`;

      const mappedItems = cartItems.map((item) => ({
        product_id: item.product_id,
        sku: item.sku,
        quantity: item.quantity,
      }));

      const payload = {
        account_id: user.id,
        total_price: finalTotal !== undefined ? finalTotal : cart.total,
        address: fullAddress,
        note: orderNote,
        discount_id: discountId || null,
        items: mappedItems,
        extra_info: {
          subtotal: cart.subtotal,
          vat: cart.vat,
          discount: discountValue || 0,
          discountPercentage: discountPercentage || null,
          assemblyFee: cart.assembly ? 200000 : 0,
          shippingFee: cart.shippingFee || 0
        }
      };

      await createOrder(payload);

      optimisticClear();
      await clearCart();

      toast.success("Đặt hàng thành công");

      navigate("/order-success", {
        state: {
          total: finalTotal !== undefined ? finalTotal : cart.total,
          address: fullAddress,
          paymentMethod: "cod",
        },
      });
    } catch (error) {
      toast.error(error.message || "Lỗi khi đặt hàng");
      setIsSubmitting(false);
    }
  };

  return {
    handlePlaceOrder,
    isSubmitting,
  };
}
