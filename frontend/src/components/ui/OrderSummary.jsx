import React from "react";

export default function OrderSummary({
  items,
  subtotal,
  shippingFee,
  discount,
  total,
  onPlaceOrder,
  isSubmitting,
  discountCode,
  setDiscountCode,
  onApplyDiscount,
  discountMessage,
  discountPercentage,
}) {
  return (
    <div className="border border-slate-200 rounded-2xl p-6 bg-white">
      <h2 className="text-lg font-bold text-slate-900 mb-5">
        Tóm tắt đơn hàng
      </h2>

      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.id} className="text-slate-600 text-sm">
            {item.qty}x {item.name.split(" (")[0]}
          </div>
        ))}

        <div className="flex justify-between items-center text-slate-600 text-sm mt-4">
          <span>Tổng tiền hàng</span>
          <span className="font-medium text-slate-900">
            {subtotal.toLocaleString("vi-VN")}VNĐ
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between items-center text-slate-600 text-sm">
            <span>Giảm giá {discountPercentage ? `(${discountPercentage}%)` : ""}</span>
            <span className="font-medium text-slate-900">
              -{discount.toLocaleString("vi-VN")}VNĐ
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-slate-600 text-sm">
          <span>Phí vận chuyển</span>
          <span className="font-medium text-slate-900">
            {shippingFee === 0
              ? "Miễn phí"
              : `${shippingFee.toLocaleString("vi-VN")}VNĐ`}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Mã giảm giá
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder="Nhập mã giảm giá"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-red-500"
          />

          <button
            type="button"
            onClick={onApplyDiscount}
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Áp dụng
          </button>
        </div>

        {discountMessage ? (
          <p className="mt-2 text-sm text-slate-500">{discountMessage}</p>
        ) : null}
      </div>

      <div className="flex justify-between items-center mb-6">
        <span className="font-bold text-red-500">Tổng thanh toán</span>
        <span className="font-bold text-red-500 text-lg">
          {total.toLocaleString("vi-VN")}VNĐ
        </span>
      </div>

      <button
        onClick={onPlaceOrder}
        disabled={isSubmitting}
        className="w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
      </button>
    </div>
  );
}
