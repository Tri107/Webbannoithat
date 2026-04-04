import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";

export default function RevenueChart({ data = [] }) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: item.stats_date ? format(new Date(item.stats_date), "d/M") : "",
      fullName: item.stats_date ? format(new Date(item.stats_date), "dd/MM/yyyy") : "",
      value: Number(item.total_revenue) || 0,
    })).reverse(); // Reverse to show chronological order
  }, [data]);

  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold text-[#0f2a71]">
          Thống Kê Doanh Thu
        </CardTitle>
        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
          Doanh thu (VNĐ)
        </span>
      </CardHeader>

      <CardContent className="h-[280px] px-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              dy={10}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: '#6b7280' }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              labelFormatter={(label, payload) => {
                return payload[0]?.payload?.fullName || label;
              }}
              formatter={(value) => [
                new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value),
                "Doanh thu"
              ]}
            />

            <Area
              type="linear"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#colorRevenue)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
