import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../lib/api";
import toast from "react-hot-toast";

import AuthCard from "../../components/ui/AuthCard";
import AuthBenefits from "../../components/ui/AuthBenefits";
import AuthForm from "../../components/ui/AuthForm";
import InputField from "../../components/ui/InputField";
import SocialLogin from "../../components/ui/SocialLogin";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      return toast.error("Vui lòng nhập đầy đủ thông tin của mình ");
    }

    try {
      setLoading(true);

      const res = await loginUser(form);

      // SỬA LỖI 1: Đổi thành accessToken cho khớp với Backend mới
      if (res?.accessToken) {
        // Lưu đúng tên key là "accessToken" để hàm getAuthHeaders đọc được
        localStorage.setItem("accessToken", res.accessToken); 
        localStorage.setItem("user", JSON.stringify(res.user));

        toast.success("Đăng nhập thành công!");

        setTimeout(() => {
          if (res.user.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }, 1000);
      } else {
        toast.error(res?.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.message || "Tài khoản hoặc mật khẩu không đúng"); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #f59e0b 100%)
          `,
        }}
      />

      <div className="relative z-10 w-screen min-h-screen flex items-center justify-center">
        <AuthCard>
          <AuthBenefits />

          <AuthForm
            onSubmit={handleSubmit}
            submitText={loading ? "Đang đăng nhập..." : "Đăng nhập"}
          >
            <InputField
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />

            <InputField
              type="password"
              name="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={handleChange}
            />

            <div className="flex justify-end">
              <span className="text-sm text-gray-600">
                Chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  className="text-red-500 font-medium hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </span>
            </div>
          </AuthForm>

          <SocialLogin />
        </AuthCard>
      </div>
    </div>
  );
};

export default Login;
