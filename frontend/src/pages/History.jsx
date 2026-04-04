import React, { useState, useEffect, useMemo } from "react";
import { 
  ShoppingBag, 
  ChevronLeft, 
  Calendar, 
  CreditCard, 
  Truck, 
  Eye,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { getOrdersByUserId } from "../lib/api";
import { format } from "date-fns";
import ViewOrderModal from "../components/ui/ViewOrderModal";
import { useNavigate } from "react-router-dom";

const statusColors = {
  PENDING: "bg-yellow-400 text-white",
  DELIVERING: "bg-blue-400 text-white",
  DELIVERED: "bg-green-400 text-white",
  CANCELLED: "bg-red-400 text-white",
};

const statusLabels = {
  PENDING: "Chờ xử lý",
  DELIVERING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
};

import { ScrollArea } from "@/components/ui/scroll-area";

export default function History() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewOrderId, setViewOrderId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.id) {
          const res = await getOrdersByUserId(user.id);
          setOrders(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch order history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleViewDetails = (id) => {
    setViewOrderId(id);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto w-full p-6 py-10">
        <div className="flex items-center gap-4 mb-8 shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full bg-white shadow-sm border"
          >
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Lịch sử đơn hàng</h1>
            <p className="text-slate-500 text-sm">Theo dõi và xem lại các giao dịch của bạn</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" />
            <p className="text-slate-500">Đang tải lịch sử đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-none shadow-sm text-center py-20">
            <CardContent className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">Chưa có đơn hàng nào</h3>
                <p className="text-slate-500">Bạn chưa thực hiện bất kỳ giao dịch nào với chúng tôi.</p>
              </div>
              <Button 
                onClick={() => window.location.href = "/"}
                className="mt-4 bg-orange-600 hover:bg-orange-700"
              >
                Khám phá sản phẩm ngay
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="h-[650px] overflow-hidden rounded-xl border border-slate-100 bg-white/30 backdrop-blur-sm p-4">
            <ScrollArea className="h-full">
              <div className="grid gap-6 pr-4">
              {orders.map((order) => (
                <Card key={order.order_id} className="border-none shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className={`h-1 w-full ${statusColors[order.order_status]}`} />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 bg-white/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Đơn hàng #{order.order_id}</CardTitle>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <Calendar size={12} />
                          {order.order_date ? format(new Date(order.order_date), "dd/MM/yyyy HH:mm") : "N/A"}
                        </div>
                      </div>
                    </div>
                    <Badge className={`${statusColors[order.order_status]} px-4 py-1.5 rounded-full border-none font-bold uppercase text-[10px] tracking-widest shadow-sm`}>
                      {statusLabels[order.order_status]}
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-4 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Tổng thanh toán</p>
                        <p className="text-xl font-black text-blue-700">
                          {Number(order.total_price).toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Địa chỉ nhận hàng</p>
                        <p className="text-sm text-slate-600 line-clamp-1 italic">
                          {order.address || "N/A"}
                        </p>
                      </div>
                      <div className="flex items-end justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="group flex items-center gap-2 border-slate-200 hover:bg-slate-900 hover:text-white transition-all duration-300"
                          onClick={() => handleViewDetails(order.order_id)}
                        >
                          <Eye size={16} />
                          Chi tiết đơn hàng
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </main>

      <ViewOrderModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        orderId={viewOrderId} 
      />

      <Footer />
    </div>
  );
}
