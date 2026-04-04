import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Otp from "./pages/auth/Otp";
import Cart from "./pages/Cart";
import Products from "./pages/Products";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import UserProfile from "./pages/UserProfile";
import History from "./pages/History";
import DetailProduct from "./pages/DetailProduct";

import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Product from "./pages/admin/Product";
import Favorites from "./pages/Favorites";

import Discount from "./pages/admin/Discount";
import AccountPage from "./pages/admin/Account";
import Collection from "./pages/admin/Collection";
import Payment from "./pages/admin/Payment";
import CategoryPage from "./pages/admin/Category";   
import Brands from "./pages/admin/Brands";
import AdminChat from "./pages/admin/Chat";
import Orders from "./pages/admin/Orders";

import Chatbox from "./components/ui/Chatbox";


function App() {
  return (
    <BrowserRouter>

      <Routes>
        {/* Public */}
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/" element={<Home />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/history" element={<History />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/detailproduct/:id" element={<DetailProduct />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Product />} />
          <Route path="discounts" element={<Discount />} />
          <Route path="accounts" element={<AccountPage />} />
          <Route path="collections" element={<Collection />} />
          <Route path="payment" element={<Payment />} />
          <Route path="categories" element={<CategoryPage />} />
          <Route path="brands" element={<Brands />} />
          <Route path="orders" element={<Orders />} />
          <Route path="chat" element={<AdminChat />} />
        </Route>
      </Routes>

      {/* CHATBOX GLOBAL (nổi góc phải) */}
      <div className="fixed bottom-5 right-5 z-50">
        <Chatbox />
      </div>

    </BrowserRouter>
  );
}

export default App;