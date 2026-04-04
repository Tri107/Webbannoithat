import { useState, useEffect, useCallback } from "react";
import { format, subDays, differenceInDays } from "date-fns";
import { toast } from "react-hot-toast";

import StatCards from "../../components/ui/StatCards";
import RevenueChart from "../../components/ui/RevenueChart";
import OrderChart from "../../components/ui/OrderChart";
import RecentOrders from "../../components/ui/RecentOrders";
import { DatePicker } from "../../components/ui/DatePicker";
import { getChartData } from "../../lib/api";

export default function Dashboard() {
  const [fromDate, setFromDate] = useState(subDays(new Date(), 21));
  const [toDate, setToDate] = useState(new Date());
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchChartData = useCallback(async () => {
    // Validate range
    const diff = differenceInDays(toDate, fromDate);
    if (diff < 0) {
      toast.error("Ngày bắt đầu không thể sau ngày kết thúc");
      return;
    }
    if (diff > 21) {
      toast.error("Khoảng cách ngày không được quá 21 ngày (3 tuần)");
      return;
    }

    setIsLoading(true);
    try {
      const res = await getChartData({
        from: format(fromDate, "yyyy-MM-dd"),
        to: format(toDate, "yyyy-MM-dd"),
      });
      setChartData(res.data || []);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      toast.error("Không thể tải dữ liệu biểu đồ");
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  return (
    <div className="w-full space-y-6">
      {/* Title */}
      <h1 className="text-3xl font-bold text-[#0f2a71]">Trang quản lý</h1>

      {/* Stat cards */}
      <StatCards />

      {/* Filters Section */}
      <div className="flex justify-start w-full">
        <div className="flex flex-wrap items-center justify-start gap-6 bg-white py-4 px-8 rounded-xl shadow-md border border-gray-100 w-fit">
          <DatePicker 
            label="Từ ngày" 
            date={fromDate} 
            setDate={(date) => date && setFromDate(date)} 
          />
          <div className="h-10 w-[1px] bg-gray-200 hidden md:block self-end mb-1" />
          <DatePicker 
            label="Đến ngày" 
            date={toDate} 
            setDate={(date) => date && setToDate(date)} 
          />
          <div className="flex items-end h-full self-end pb-1">
            <span className="text-xs text-muted-foreground italic font-medium">
              * Giới hạn trong 21 ngày
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className={isLoading ? "opacity-50 pointer-events-none transition-opacity duration-300" : "transition-opacity duration-300"}>
          <RevenueChart data={chartData} />
        </div>
        <div className={isLoading ? "opacity-50 pointer-events-none transition-opacity duration-300" : "transition-opacity duration-300"}>
          <OrderChart data={chartData} />
        </div>
      </div>

      {/* Table */}
      <RecentOrders />
    </div>
  );
}