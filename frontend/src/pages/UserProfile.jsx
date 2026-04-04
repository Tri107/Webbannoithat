import React, { useState, useEffect } from "react";
import { User, Truck, Mail, Phone, MapPin, ChevronRight, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { getMyProfile, updateProfile } from "../lib/api"; 

const UserProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  
  // State cho Popup
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    phone_number: "",
    user_address: ""
  });

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const result = await getMyProfile();
      setProfileData(result.data);
      // Cập nhật formData khi lấy dữ liệu mới
      setFormData({
        username: result.data.username || "",
        phone_number: result.data.phone_number || "",
        user_address: result.data.user_address || ""
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Xử lý gửi API cập nhật
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      // Gọi API cập nhật (hãy đảm bảo bạn đã định nghĩa hàm này trong lib/api)
      await updateProfile(formData);
      
      // Load lại dữ liệu mới
      await fetchProfile();
      setIsDialogOpen(false); // Đóng popup
      alert("Cập nhật thông tin thành công!");
    } catch (err) {
      alert("Lỗi khi cập nhật: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-slate-500 animate-pulse">Đang tải thông tin...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto w-full p-6 py-10">
        <h1 className="text-3xl font-bold mb-8 text-slate-800">Tài khoản của tôi</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Thông tin cá nhân */}
          <Card className="border-none shadow-sm h-full flex flex-col">
            <CardHeader className="flex flex-row items-center space-x-4 pb-4">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <User size={24} />
              </div>
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow text-sm">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Mail size={16} /> Email
                </span>
                <span className="font-medium">{profileData?.email || "Chưa cập nhật"}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-muted-foreground flex items-center gap-2">
                  <User size={16} /> Tên hiển thị
                </span>
                <span className="font-medium">{profileData?.username || "Chưa cập nhật"}</span>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 mt-auto">
              <Button variant="link" className="text-orange-600 p-0 h-auto flex items-center">
                Đổi mật khẩu <ChevronRight size={16} />
              </Button>
            </CardFooter>
          </Card>

          {/* Card 2: Liên hệ & Giao hàng */}
          <Card className="border-none shadow-sm h-full flex flex-col">
            <CardHeader className="flex flex-row items-center space-x-4 pb-4">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Truck size={24} />
              </div>
              <CardTitle>Liên hệ & Giao hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow text-sm">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-muted-foreground flex items-center gap-2 min-w-[100px]">
                  <Phone size={16} /> Điện thoại
                </span>
                <span className="font-medium text-right">{profileData?.phone_number || "Chưa cập nhật"}</span>
              </div>
              <div className="flex justify-between items-start border-b pb-3">
                <span className="text-muted-foreground flex items-center gap-2 min-w-[100px] mt-1">
                  <MapPin size={16} /> Địa chỉ
                </span>
                <span className="font-medium text-right max-w-[250px] leading-relaxed">
                  {profileData?.user_address || "Chưa thiết lập địa chỉ giao hàng"}
                </span>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 mt-auto">
              
              {/* POPUP CẬP NHẬT THÔNG TIN */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="link" className="text-orange-600 p-0 h-auto flex items-center">
                    Cập nhật thông tin <ChevronRight size={16} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Cập nhật hồ sơ</DialogTitle>
                    <DialogDescription>
                      Thay đổi thông tin cá nhân của bạn tại đây. Nhấn lưu để hoàn tất.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdate} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tên hiển thị</label>
                      <Input 
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Nhập tên của bạn"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Số điện thoại</label>
                      <Input 
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Địa chỉ giao hàng</label>
                      <Input 
                        name="user_address"
                        value={formData.user_address}
                        onChange={handleInputChange}
                        placeholder="Nhập địa chỉ của bạn"
                      />
                    </div>
                    <DialogFooter className="pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Hủy
                      </Button>
                      <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={isUpdating}>
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Lưu thay đổi
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

            </CardFooter>
          </Card>

          {/* Card 3: Lịch sử đơn hàng */}
          <Card className="border-none shadow-sm h-full flex flex-col md:col-span-2">
            <CardHeader className="flex flex-row items-center space-x-4 pb-4">
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <Truck size={24} />
              </div>
              <CardTitle>Lịch sử đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow text-sm">
              <p className="text-muted-foreground mb-4">
                Xem lại danh sách các đơn hàng bạn đã đặt và theo dõi tình trạng vận chuyển của chúng.
              </p>
            </CardContent>
            <CardFooter className="border-t pt-4 mt-auto">
              <Button 
                variant="link" 
                className="text-orange-600 p-0 h-auto flex items-center"
                onClick={() => window.location.href = "/history"}
              >
                Xem lịch sử đơn hàng <ChevronRight size={16} />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;