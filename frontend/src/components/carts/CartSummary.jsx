import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw, ShieldCheck, CreditCard, Truck } from "lucide-react";

export default function CartSummary({
  subtotal, // Tổng tiền tạm tính (sản phẩm × số lượng)
  discount, // Số tiền giảm giá từ coupon
  vat, // Thuế VAT (10% của subtotal sau discount)
  total, // Tổng tiền cuối cùng (sau tất cả tính toán)
  shippingFee, // Phí vận chuyển (0 hoặc số tiền)
  assembly, // Boolean: có chọn dịch vụ lắp ráp không
  setAssembly, // Function: cập nhật trạng thái assembly
  isEmpty, // Boolean: giỏ hàng rỗng không
  onCheckout, // Function: xử lý thanh toán
}) {
  return (
    <Card className="rounded-md border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Tóm tắt đơn hàng</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-5 pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-slate-700">
            <span>Tạm tính</span>
            <span>{subtotal}</span>
          </div>

          <div className="flex items-center justify-between text-slate-700">
            <span>Vận chuyển</span>
            <span>{shippingFee === 0 ? "Miễn phí" : shippingFee}</span>
          </div>

          <div className="flex items-center justify-between text-slate-700">
            <span>VAT (10%)</span>
            <span>{vat}</span>
          </div>
        </div>

        <div className="h-px w-full bg-slate-200" />

        <label className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <input
              type="checkbox"
              checked={assembly}
              onChange={(e) => setAssembly(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-red-600"
            />

            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span>Dịch vụ lắp ráp</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  -50%
                </span>
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Chúng tôi sẽ giao hàng và lắp ráp đồ nội thất cho bạn
              </p>
            </div>
          </div>

          <div className="shrink-0 text-sm font-semibold text-red-600">
            {assembly ? "200.000 ₫" : "0 ₫"}
          </div>
        </label>

        <div className="h-px w-full bg-slate-200" />

        <div className="flex items-center justify-between">
          <p className="text-lg font-normal text-slate-900">Tổng Tiền</p>
          <p className="text-[20px] font-bold text-red-600">{total}</p>
        </div>

        <Button
          className="h-12 w-full rounded-full bg-red-600 text-base hover:bg-red-700"
          disabled={isEmpty}
          onClick={onCheckout}
        >
          Thanh toán
        </Button>

        <div className="h-px w-full bg-slate-200" />

        <div className="pt-1 space-y-3 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4 text-slate-500" />
            Đổi trả miễn phí trong 7 ngày
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-slate-500" />
            Bao gồm bảo hành 6 tháng
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-slate-500" />
            Thanh toán nhanh chóng và an toàn
          </div>
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-slate-500" />
            Giao hàng tận nhà
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
