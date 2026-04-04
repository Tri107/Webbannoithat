import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  Package,
  CreditCard,
  Users,
  Settings,
  Wrench,
  Truck,
  LogOut,
  MessageCircle
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="w-64 border-r flex flex-col">

      {/* Header Admin */}
      <div className="h-16 px-6 flex items-center border-b bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
            A
          </div>
          <div className="leading-tight">
            <p className="font-semibold text-sm text-white">Admin</p>
            <p className="text-xs text-slate-300">admin@gmail.com</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="p-4 space-y-2 text-sm bg-slate-100 flex-1">

        <Item to="/admin" icon={<Home size={18} />} label="Trang chủ" end />
        <Item to="/admin/products" icon={<Package size={18} />} label="Trang sản phẩm" />
        <Item to="/admin/categories" icon={<Package size={18} />} label="Danh mục" />
        <Item to="/admin/brands" icon={<Package size={18} />} label="Thương hiệu" />
        <Item to="/admin/collections" icon={<Package size={18} />} label="Bộ Sưu Tập" />
        {/* <Item to="/admin/payment" icon={<CreditCard size={18} />} label="Thanh toán" /> */}
        <Item to="/admin/orders" icon={<Package size={18} />} label="Đơn hàng" />
        <Item to="/admin/discounts" icon={<CreditCard size={18} />} label="Khuyến mãi" />
        <Item to="/admin/accounts" icon={<Users size={18} />} label="Người dùng" />
        <Item to="/admin/chat" icon={<MessageCircle size={18} />} label="Hỗ trợ Chat" />
      </nav>

      {/* Logout */}
      <div className="p-4 border-t bg-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-red-600 hover:bg-red-100 w-full transition"
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>

    </aside>
  );
}

function Item({ to, icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md transition
        ${
          isActive
            ? "bg-gray-200 text-black font-medium"
            : "text-black hover:bg-gray-200"
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}