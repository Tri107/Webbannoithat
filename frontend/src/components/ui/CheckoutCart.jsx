import React from "react";

export default function CheckoutCart({ items }) {
  return (
    <div className="border border-slate-200 rounded-2xl p-6 bg-white mb-6">
      <h2 className="text-lg font-bold text-slate-900 mb-5">Giỏ hàng</h2>
      {items.length === 0 ? (
        <p className="text-slate-500">Giỏ hàng trống.</p>
      ) : (
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover mix-blend-multiply"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-slate-900 text-sm">{item.name}</span>
                </div>

                <div className="mt-1 flex gap-2">
                  <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                    {item.color}
                  </span>
                  {item.sku && (
                    <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                      {item.sku}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-red-500 font-semibold">{item.price.toLocaleString("vi-VN")}VNĐ</span>
                  <span className="text-sm font-medium text-slate-600">x{item.qty}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
