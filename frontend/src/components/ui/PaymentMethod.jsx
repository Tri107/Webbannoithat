import React from "react";
import { Truck } from "lucide-react";

export default function PaymentMethod({ method, setMethod }) {
  // Excluding MoMo payment as requested
  const options = [
    { id: "cod", label: "Thanh toán khi giao hàng đến nơi", icon: <Truck className="w-5 h-5" /> },
    {
      id: "vnpay",
      label: "Thanh toán online qua cổng VNPay",
      icon: (
        <div className="relative w-8 h-5 flex items-center">
          <div className="absolute left-1 w-3.5 h-3.5 bg-[#005BAA] rounded-[2px] transform rotate-45"></div>
          <div className="absolute left-3.5 w-3.5 h-3.5 bg-[#ED1C24] rounded-[2px] transform rotate-45 mix-blend-multiply"></div>
        </div>
      ),
    },
  ];

  return (
    <div className="border border-slate-200 rounded-2xl p-6 bg-white mb-6">
      <h2 className="text-lg font-bold text-slate-900 mb-5">Phương thức thanh toán</h2>
      <div className="space-y-4">
        {options.map((opt) => (
          <label
            key={opt.id}
            onClick={() => setMethod(opt.id)}
            className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${
              method === opt.id ? "border-slate-800 bg-slate-50" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-center w-5 h-5 rounded-full border border-slate-300 mr-4 bg-white">
              {method === opt.id && <div className="w-2.5 h-2.5 bg-slate-800 rounded-full"></div>}
            </div>
            <div className="mr-3">{opt.icon}</div>
            <span className="text-slate-700 font-medium">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
