import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardSummary } from "@/lib/api";
import { format } from "date-fns";
import { Loader2, Package, TrendingUp } from "lucide-react";

export default function RecentOrders() {
  const [data, setData] = useState({ recentOrders: [], topProducts: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboardSummary();
        setData(res.data || { recentOrders: [], topProducts: [] });
      } catch (error) {
        console.error("Error fetching dashboard summary:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Cột trái: Đơn hàng gần đây */}
      <Card className="shadow-sm border-gray-100 h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#0f2a71]">
            <Package className="h-5 w-5" />
            Đơn hàng gần đây
          </CardTitle>
          <Badge variant="outline" className="font-normal">
            5 mới nhất
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f8faff] text-[#64748b]">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">ID</th>
                  <th className="px-6 py-3 text-left font-semibold">Khách hàng</th>
                  <th className="px-6 py-3 text-left font-semibold">Ngày đặt</th>
                  <th className="px-6 py-3 text-right font-semibold">Tổng tiền</th>
                  <th className="px-6 py-3 text-center font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentOrders.length > 0 ? (
                  data.recentOrders.map((order) => (
                    <Row
                      key={order.order_id}
                      id={`#${order.order_id}`}
                      name={order.customer_email.split('@')[0]} // Hoặc hiển thị email
                      date={format(new Date(order.order_date), "dd/MM/yyyy")}
                      price={`${Number(order.total_price).toLocaleString()}đ`}
                      status={order.order_status}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-muted-foreground">
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cột phải: Sản phẩm đã bán */}
      <Card className="shadow-sm border-gray-100 h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#0f2a71]">
            <TrendingUp className="h-5 w-5" />
            Sản phẩm đã bán
          </CardTitle>
          <Badge variant="outline" className="font-normal text-emerald-600 bg-emerald-50">
            Xu hướng
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topProducts.length > 0 ? (
              data.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-[#f8faff] border border-transparent hover:border-[#0f2a71]/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f2a71] text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium text-[#1e293b]">{product.product_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#0f2a71]">{product.total_sold}</span>
                    <span className="text-xs text-[#64748b]">đã bán</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-muted-foreground">
                Chưa có dữ liệu sản phẩm
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ id, name, date, price, status }) {
  const getStatusStyle = (s) => {
    switch (s) {
      case 'DELIVERED':
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case 'PENDING':
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case 'DELIVERING':
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case 'CANCELLED':
        return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const statusMap = {
    'DELIVERED': 'Giao thành công',
    'PENDING': 'Chờ xử lý',
    'DELIVERING': 'Đang giao',
    'CANCELLED': 'Đã hủy'
  };

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4 font-bold text-[#0f2a71]">{id}</td>
      <td className="px-6 py-4 text-[#475569] truncate max-w-[120px]">{name}</td>
      <td className="px-6 py-4 text-[#64748b] font-medium">{date}</td>
      <td className="px-6 py-4 text-right font-bold text-[#1e293b]">{price}</td>
      <td className="px-6 py-4 text-center">
        <Badge className={`shadow-none font-medium ${getStatusStyle(status)}`}>
          {statusMap[status] || status}
        </Badge>
      </td>
    </tr>
  );
}
