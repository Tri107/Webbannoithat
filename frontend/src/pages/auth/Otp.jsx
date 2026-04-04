import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp } from "../../lib/api";
import toast from "react-hot-toast";
import AuthCard from "../../components/ui/AuthCard";

const Otp = () => {
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    if (value.length === 1 && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    setError("");

    const otp = inputsRef.current
      .map((input) => input?.value || "")
      .join("");

    if (otp.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 số OTP");
      
    }

    try {
      setLoading(true);

      const res = await verifyOtp({ email, otp });

      if (res?.success === true || res?.account_id) {
        toast.success("Xác minh thành công!");
        navigate("/login", { replace: true });
        return;
      }

      toast.error(res?.message || "OTP không đúng");
     

    } catch {
      toast.error("Lỗi kết nối server");
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(180deg, 
              rgba(255,247,237,1) 0%, 
              rgba(255,237,213,0.8) 25%, 
              rgba(254,215,170,0.6) 50%, 
              rgba(251,146,60,0.4) 75%, 
              rgba(249,115,22,0.3) 100%
            )
          `,
        }}
      />

      <div className="w-screen relative z-10 min-h-screen flex items-center justify-center">
        <AuthCard>
          <h2 className="text-xl font-semibold mb-2 text-center">
            Xác minh OTP
          </h2>

          <p className="text-sm text-gray-600 mb-4 text-center">
            Nhập mã gồm 6 chữ số đã gửi về email của bạn
          </p>

          {error && (
            <div className="text-red-500 text-sm text-center mb-4">
              {error}
            </div>
          )}

          <div className="flex justify-center gap-3 mb-6">
            {[...Array(6)].map((_, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                onChange={(e) =>
                  handleChange(e.target.value, index)
                }
                className="w-12 h-12 text-center border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white font-semibold py-3 rounded-full transition"
          >
            {loading ? "Đang xác minh..." : "Xác minh"}
          </button>
        </AuthCard>
      </div>
    </div>
  );
};

export default Otp;
