import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444"];
const STATUS_NAMES = ["Chờ xử lý", "Đang giao", "Đã giao", "Đã hủy"];

export default function OrderChart({ data = [] }) {
  const { chartData, totalOrders } = useMemo(() => {
    const summary = data.reduce(
      (acc, curr) => {
        acc.pending += Number(curr.PENDING) || 0;
        acc.delivering += Number(curr.DELIVERING) || 0;
        acc.delivered += Number(curr.DELIVERED) || 0;
        acc.cancelled += Number(curr.CANCELLED) || 0;
        return acc;
      },
      { pending: 0, delivering: 0, delivered: 0, cancelled: 0 }
    );

    const total = summary.pending + summary.delivering + summary.delivered + summary.cancelled;

    const formattedData = [
      { name: STATUS_NAMES[0], value: summary.pending },
      { name: STATUS_NAMES[1], value: summary.delivering },
      { name: STATUS_NAMES[2], value: summary.delivered },
      { name: STATUS_NAMES[3], value: summary.cancelled },
    ].filter(item => item.value > 0); // Only show statuses with values

    return { chartData: formattedData, totalOrders: total };
  }, [data]);

  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-[#0f2a71]">
          Phân Bổ Đơn Hàng
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center h-[300px]">
        <div className="relative w-full h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={65}
                outerRadius={90}
                dataKey="value"
                paddingAngle={4}
                stroke="none"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-[#0f2a71]">{totalOrders}</span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">Đơn hàng</span>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 text-xs">
          {chartData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-medium text-gray-600 truncate w-20">{item.name}</span>
              <span className="font-bold text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
