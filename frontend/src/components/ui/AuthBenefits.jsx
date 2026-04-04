import { Check } from "lucide-react";

const benefits = [
  "Mua sắm nhanh hơn",
  "Quản lý đơn hàng",
  "Ưu đãi dành riêng cho thành viên",
];

const AuthBenefits = () => {
  return (
    <div className="mb-6">
       
      <h2 className="text-xl font-semibold mb-4">
        Đăng nhập hoặc Đăng kí 
      </h2>

      <ul className="space-y-2 text-sm text-gray-700">
        {benefits.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <Check className="w-4 h-4 text-orange-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AuthBenefits;
