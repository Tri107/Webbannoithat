import { useNavigate } from "react-router-dom";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";

import { useCart } from "@/hooks/useCart";
import { useCartActions } from "@/hooks/useCartActions";

import CartList from "../components/carts/CartList";
import CartSummary from "../components/carts/CartSummary";
import useCartPage from "../hooks/useCartPage";
import { formatVND } from "../lib/utils";

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, loading, refetch } = useCart();
  const { handleUpdateQuantity, handleUpdateColor, handleRemove } = useCartActions(refetch);

  const cart = useCartPage(cartItems);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-2xl font-bold text-slate-900">Giỏ hàng của bạn</h1>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Hiển thị danh sách */}
            <div className="lg:col-span-8">
              <CartList
                items={cart.items.map((item) => ({
                  ...item,
                  totalPrice: formatVND(item.price * item.qty),
                }))}
                onUpdate={(id, qty) => {
                  if (qty < 1) {
                    alert("Số lượng sản phẩm tối thiểu là 1.");
                    return;
                  }
                  handleUpdateQuantity(id, qty);
                }}
                onUpdateColor={handleUpdateColor}
                onRemove={handleRemove}
              />
            </div>

            <div className="lg:col-span-4">
              <CartSummary
                subtotal={formatVND(cart.subtotal)}
                discount={formatVND(cart.discount)}
                vat={formatVND(cart.vat)}
                total={formatVND(cart.total)}
                shippingFee={cart.shippingFee}
                assembly={cart.assembly}
                setAssembly={cart.setAssembly}
                isEmpty={cart.items.length === 0}
                onCheckout={() => navigate("/checkout")}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}