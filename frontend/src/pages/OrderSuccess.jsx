import { useEffect, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";

import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";

import { createOrder } from "@/lib/api";
import { clearCart } from "@/lib/cartApi";

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const hasCreatedOrderRef = useRef(false);

  const state = location.state || {};

  const paymentStatus = searchParams.get("paymentStatus");
  const paymentMethodFromQuery = searchParams.get("paymentMethod");

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isVnpaySuccess, setIsVnpaySuccess] = useState(false);
  const [displayData, setDisplayData] = useState({
    total: state.total || 0,
    address: state.address || "",
    paymentMethod: state.paymentMethod || paymentMethodFromQuery || "cod",
  });

  useEffect(() => {
    const handleVnpaySuccess = async () => {
      if (paymentStatus !== "success") return;
      if (hasCreatedOrderRef.current) return;

      hasCreatedOrderRef.current = true;

      try {
        setIsCreatingOrder(true);

        const pendingOrderStr = sessionStorage.getItem("pendingOrder");
        const userStr = localStorage.getItem("user");

        if (!pendingOrderStr) {
          toast.error("Không tìm thấy dữ liệu đơn hàng tạm.");
          return;
        }

        if (!userStr) {
          toast.error("Vui lòng đăng nhập lại để hoàn tất đơn hàng.");
          navigate("/login");
          return;
        }

        const pendingOrder = JSON.parse(pendingOrderStr);
        const user = JSON.parse(userStr);

        const { shippingData, discountId, finalTotal, cartItems } =
          pendingOrder;

        const fullAddress = `${shippingData.address}, ${shippingData.ward}, ${shippingData.district}, ${shippingData.city}`;

        const orderNote = `Người nhận: ${shippingData.fullName.trim()} - SĐT: ${shippingData.phone.trim()}. Ghi chú: ${(shippingData.note || "").trim()}`;

        const mappedItems = cartItems.map((item) => ({
          product_id: item.product_id,
          sku: item.sku,
          quantity: item.quantity,
        }));

        const payload = {
          account_id: user.id,
          total_price: finalTotal,
          address: fullAddress,
          note: orderNote,
          discount_id: discountId || null,
          items: mappedItems,
        };

        await createOrder(payload);
        await clearCart();

        sessionStorage.removeItem("pendingOrder");

        setDisplayData({
          total: finalTotal,
          address: fullAddress,
          paymentMethod: "vnpay",
        });

        setIsVnpaySuccess(true);
        toast.success("Thanh toán VNPay thành công, đơn hàng đã được tạo.");
      } catch (error) {
        toast.error(
          error.message || "Tạo đơn hàng sau thanh toán VNPay thất bại.",
        );
      } finally {
        setIsCreatingOrder(false);
      }
    };

    handleVnpaySuccess();
  }, [paymentStatus, navigate]);

  const total = displayData.total || 0;
  const address = displayData.address || "";
  const paymentMethod = displayData.paymentMethod || "cod";

  const isFailed =
    paymentStatus === "failed" ||
    paymentStatus === "invalid" ||
    paymentStatus === "error";

  const renderTitle = () => {
    if (isCreatingOrder) return "Đang hoàn tất đơn hàng";
    if (isFailed) return "Thanh toán thất bại";
    return "Đặt hàng thành công";
  };

  const renderDescription = () => {
    if (isCreatingOrder) {
      return "Thanh toán thành công. Hệ thống đang tạo đơn hàng cho bạn.";
    }

    if (isFailed) {
      return "Giao dịch VNPay chưa thành công hoặc không hợp lệ. Đơn hàng chưa được tạo.";
    }

    if (isVnpaySuccess) {
      return "Thanh toán VNPay thành công. Đơn hàng của bạn đã được tạo.";
    }

    return "Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đã được tạo thành công.";
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-sm border border-slate-200 text-center">
          <div className="flex justify-center mb-4">
            {isFailed ? (
              <XCircle className="h-16 w-16 text-red-600" />
            ) : (
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            {renderTitle()}
          </h1>
          <p className="text-slate-600 mb-6">{renderDescription()}</p>
          <p className="text-slate-600 mb-6">
            Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đã được tạo thành công.
          </p>

          <p className="text-blue-600 font-medium mb-6">
            Vui lòng kiểm tra email của bạn để xem thông tin chi tiết đơn hàng.
          </p>  

          {/* Đã thêm thẻ đóng </div> cho khối này */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-left space-y-3 mb-6">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Phương thức thanh toán</span>
              <span className="font-medium text-slate-900">
                {paymentMethod === "cod"
                  ? "Thanh toán khi nhận hàng"
                  : paymentMethod}
              </span>
            </div>
          </div> 

          {!isFailed && (
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-left space-y-3 mb-6">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Phương thức thanh toán</span>
                <span className="font-medium text-slate-900">
                  {paymentMethod === "cod"
                    ? "Thanh toán khi nhận hàng"
                    : paymentMethod === "vnpay"
                      ? "Thanh toán qua VNPay"
                      : paymentMethod}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Tổng thanh toán</span>
                <span className="font-medium text-red-600">
                  {Number(total).toLocaleString("vi-VN")}VNĐ
                </span>
              </div>

              <div className="flex justify-between gap-4 items-start">
                <span className="text-slate-500">Địa chỉ giao hàng</span>
                <span className="font-medium text-slate-900 text-right max-w-[65%]">
                  {address || "Không có thông tin"}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-red-600 px-6 py-3 text-white font-semibold hover:bg-red-700 transition-colors"
            >
              Tiếp tục mua sắm
            </Link>

            <Link
              to="/cart"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Về giỏ hàng
            </Link>
          </div>
        </div>
        {/* Đã xóa bớt 1 thẻ </div> bị dư ở đây */}
      </main>

      <Footer />
    </div>
  );
}
