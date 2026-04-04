import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, ShoppingBag } from "lucide-react";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { getOrders, updateOrderStatus } from "../../lib/api";
import { format } from "date-fns";
import toast from "react-hot-toast";
import ViewOrderModal from "../../components/ui/ViewOrderModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusColors = {
  PENDING: "bg-yellow-400",
  DELIVERING: "bg-blue-400",
  DELIVERED: "bg-green-400",
  CANCELLED: "bg-red-400",
};

const statusLabels = {
  PENDING: "Chờ xử lý",
  DELIVERING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
};

// Memoized Row Component
const OrderRow = React.memo(({ item, onUpdateStatus, onViewDetails }) => {
  return (
    <tr className="border-b last:border-b-0 hover:bg-muted/20">
      <td className="px-6 py-4 font-medium">#{item.order_id}</td>

      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-medium">{item.email}</span>
        </div>
      </td>

      <td className="px-6 py-4">
        {item.order_date ? format(new Date(item.order_date), "dd/MM/yyyy HH:mm") : "-"}
      </td>

      <td className="px-6 py-4 font-bold text-blue-600">
        {Number(item.total_price).toLocaleString("vi-VN")}đ
      </td>

      <td className="px-6 py-4 ">
        <div className="flex items-center justify-center">
          <Select
            value={item.order_status}
            onValueChange={(value) => onUpdateStatus(item.order_id, value)}
          >
            <SelectTrigger className="w-[140px] bg-white border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${statusColors[item.order_status].split(' ')[0]}`} />
                <span className="text-xs font-medium">{statusLabels[item.order_status]}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white">
              {Object.keys(statusLabels).map((status) => (
                <SelectItem key={status} value={status}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusColors[status].split(' ')[0]}`} />
                    <span>{statusLabels[status]}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1 hover:bg-blue-50"
            onClick={() => onViewDetails(item.order_id)}
          >
            <Eye size={14} />
            Chi tiết
          </Button>
        </div>
      </td>
    </tr>
  );
});

OrderRow.displayName = "OrderRow";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [viewOrderId, setViewOrderId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders();
      setOrders(res.data);
    } catch (err) {
      console.error("Load orders failed", err);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = useCallback(async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      toast.success("Cập nhật trạng thái thành công");
      // Cập nhật state local ngay lập tức để UI mượt hơn (Optimistic-like)
      setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, order_status: newStatus } : o));
    } catch (err) {
      console.error("Update status failed", err);
      toast.error("Cập nhật trạng thái thất bại");
    }
  }, []);

  const handleViewDetails = useCallback((id) => {
    setViewOrderId(id);
    setIsViewModalOpen(true);
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) =>
      order.email.toLowerCase().includes(search.toLowerCase()) ||
      order.order_id.toString().includes(search)
    );
  }, [orders, search]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Card className="rounded-2xl shrink-0 border-slate-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Tổng đơn hàng</p>
                <p className="text-xl font-bold text-slate-900">{orders.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Tìm theo email hoặc ID..."
            className="pl-9 bg-white border-slate-200 focus:ring-blue-500/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <Card className="rounded-2xl overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50">
                <tr className="text-left text-slate-500 uppercase text-[11px] tracking-wider">
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Khách hàng</th>
                  <th className="px-6 py-4 font-semibold">Ngày đặt</th>
                  <th className="px-6 py-4 font-semibold text-left">Tổng tiền</th>
                  <th className="px-6 py-4 font-semibold text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-right font-semibold">Hành động</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                        <span>Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((item) => (
                    <OrderRow
                      key={item.order_id}
                      item={item}
                      onUpdateStatus={handleUpdateStatus}
                      onViewDetails={handleViewDetails}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ViewOrderModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewOrderId(null);
        }}
        orderId={viewOrderId}
      />
    </div>
  );
}
