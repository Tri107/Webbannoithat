import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, SquareChartGantt, Package, Users } from "lucide-react";
import { getWeeklyStats } from "../../lib/api";
import { useState, useEffect } from "react";
import { formatVND } from "../../lib/utils";

export default function StatCards() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getWeeklyStats();
        const data = res.data[0];
        console.log("data:", data);
        setStats({
          revenue: formatVND(Number(data.revenue)) || 0,
          orderCount: Number(data.order_count) || 0,
          productSold: Number(data.product_sold) || 0,
          newUsers: Number(data.new_users) || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
      {/* weekly revenue */}
      <Card className="w-full">
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">Doanh thu tuần này</p>
            <p className="text-2xl font-bold text-black">{stats.revenue ?? 0}</p>
          </div>
          <ShoppingCart className="text-muted-foreground" />
        </CardContent>
      </Card>

      {/* weekly order count */}
      <Card className="w-full">
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">Đơn hàng trong tuần</p>
            <p className="text-2xl font-bold">{stats.orderCount ?? 0}</p>
          </div>
          <SquareChartGantt className="text-muted-foreground" />
        </CardContent>
      </Card>

      {/* weekly product sold */}
      <Card className="w-full">
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">Số sản phẩm đã bán trong tuần</p>
            <p className="text-2xl font-bold">{stats.productSold ?? 0}</p>
          </div>
          <Package className="text-muted-foreground" />
        </CardContent>
      </Card>

      {/* new users */}
      <Card className="w-full">
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">Người dùng mới trong tuần</p>
            <p className="text-2xl font-bold">{stats.newUsers ?? 0}</p>

          </div>
          <Users className="text-muted-foreground" />
        </CardContent>
      </Card>


    </div>
  );
}
