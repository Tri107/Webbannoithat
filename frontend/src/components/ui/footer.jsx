import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0B1E3A] text-gray-300">
      {/* container đồng bộ header */}
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Logo */}
          <div>
            <h2 className="text-orange-500 font-bold text-xl mb-4 tracking-wide">
              B2VT
            </h2>

            <p className="text-sm leading-6 text-gray-300/90">
              Chúng tôi cung cấp các giải pháp nội thất hiện đại, tối giản và tinh tế,
              biến ngôi nhà của bạn thành nơi đáng sống nhất.
            </p>

            <div className="flex gap-3 mt-5">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, idx) => (
                <button
                  key={idx}
                  className="bg-[#13284d] p-2 rounded-full hover:bg-[#1a3564] transition"
                  aria-label="social"
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Link nhanh */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên Kết Nhanh</h3>
            <div className="space-y-2 text-sm text-gray-300/90">
              <p className="hover:text-white cursor-pointer">Về Chúng Tôi</p>
              <p className="hover:text-white cursor-pointer">Cửa Hàng</p>
              <p className="hover:text-white cursor-pointer">Blog Thiết Kế</p>
              <p className="hover:text-white cursor-pointer">Liên Hệ</p>
              <p className="hover:text-white cursor-pointer">Chính Sách Bảo Mật</p>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Chăm Sóc Khách Hàng</h3>
            <div className="space-y-2 text-sm text-gray-300/90">
              <p className="hover:text-white cursor-pointer">Trung Tâm Trợ Giúp</p>
              <p className="hover:text-white cursor-pointer">Chính Sách Đổi Trả</p>
              <p className="hover:text-white cursor-pointer">Chính Sách Vận Chuyển</p>
              <p className="hover:text-white cursor-pointer">Theo Dõi Đơn Hàng</p>
              <p className="hover:text-white cursor-pointer">Phương Thức Thanh Toán</p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Thông Tin Liên Hệ</h3>
            <div className="space-y-3 text-sm text-gray-300/90">
              <p>121 Đường Nguyễn Huệ, Quận 1, TP Hồ Chí Minh</p>
              <p>(+84) 90 123 4567</p>
              <p>support@b2vt.com</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-10 flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h3 className="text-white font-semibold">Đăng ký nhận bản tin</h3>
            <p className="text-sm mt-1 text-gray-300/80">
              Nhận thông tin về sản phẩm mới và khuyến mãi đặc biệt.
            </p>
          </div>

          <div className="flex w-full md:w-auto">
            <input
              placeholder="Email của bạn"
              className="bg-[#13284d] px-4 py-2 w-full md:w-80 outline-none rounded-l-md"
            />
            <button className="bg-orange-500 px-6 text-white font-semibold rounded-r-md hover:bg-orange-600">
              Đăng Ký
            </button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-400 mt-10">
          © 2026 BaoVinhTriTinhVu Vietnam. All rights reserved.
        </div>
      </div>
    </footer>
  );
}