import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import ShippingForm from "@/components/ui/ShippingForm";
import PaymentMethod from "@/components/ui/PaymentMethod";
import CheckoutCart from "@/components/ui/CheckoutCart";
import OrderSummary from "@/components/ui/OrderSummary";

import { useCart } from "@/hooks/useCart";
import useCartPage from "@/hooks/useCartPage";

import useCheckoutProfile from "@/hooks/useCheckoutProfile";
import useCheckoutGuard from "@/hooks/useCheckoutGuard";
import useCheckoutSubmit from "@/hooks/useCheckoutSubmit";
import useCheckoutDiscount from "@/hooks/useCheckoutDiscount";

export default function Checkout() {
  const navigate = useNavigate();

  // CART
  const { cartItems, loading, optimisticClear } = useCart();
  const cart = useCartPage(cartItems);
  const items = cart.items;

  const {
    discountCode,
    setDiscountCode,
    discountId,
    discountValue,
    discountPercentage,
    discountMessage,
    handleApplyDiscount,
  } = useCheckoutDiscount(cart.total);

  const finalTotal = Math.max(0, cart.total - discountValue);

  const [shippingData, setShippingData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    note: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const { handlePlaceOrder, isSubmitting } = useCheckoutSubmit({
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
  });

  useCheckoutProfile(setShippingData);
  useCheckoutGuard(cartItems, loading, isSubmitting, navigate);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Link
            to="/cart"
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Quay lại giỏ hàng
          </Link>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* LEFT */}
            <div className="lg:col-span-7 space-y-6">
              <ShippingForm
                formData={shippingData}
                setFormData={setShippingData}
              />

              <PaymentMethod
                method={paymentMethod}
                setMethod={setPaymentMethod}
              />
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-5 space-y-6">
              <CheckoutCart items={items} />

              <OrderSummary
                items={items}
                subtotal={cart.subtotal}
                shippingFee={cart.shippingFee}
                discount={discountValue}
                total={finalTotal}
                onPlaceOrder={handlePlaceOrder}
                isSubmitting={isSubmitting}
                discountCode={discountCode}
                setDiscountCode={setDiscountCode}
                onApplyDiscount={handleApplyDiscount}
                discountMessage={discountMessage}
                discountPercentage={discountPercentage}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
