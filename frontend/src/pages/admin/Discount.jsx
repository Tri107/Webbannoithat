import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import toast from "react-hot-toast";

import {
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
} from "../../lib/api";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import {
  Pencil,
  Trash2,
  Plus,
  Search,
  TicketPercent,
  Wand2,
  Eye,
  EyeOff,
  CalendarDays,
} from "lucide-react";

const discountSchema = z.object({
  code: z.string().min(3, "Mã phải có ít nhất 3 ký tự"),
  type: z.string().min(1, "Vui lòng chọn loại giảm giá"),
  value: z.string().min(1, "Vui lòng nhập giá trị"),
  condition: z.string().min(1, "Vui lòng nhập mô tả / điều kiện áp dụng"),
  startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
});

const defaultValues = {
  code: "",
  type: "Phần trăm",
  value: "",
  condition: "",
  startDate: "",
  endDate: "",
};

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const formatDisplayDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
};

const generateDiscountCode = () =>
  `SALE${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const mapApiDiscountToUI = (item) => ({
  id: item.discount_id,
  code: item.discount_code || "",
  type: "Phần trăm",
  value: String(item.discount_percentage || 0),
  condition: item.discount_description || "",
  startDate: toDateInputValue(item.valid_from),
  endDate: toDateInputValue(item.valid_to),
  status: item.is_disabled === 1 ? "Đang ẩn" : "Đang hoạt động",
  discountPercentage: item.discount_percentage || 0,
  isDisabled: item.is_disabled ?? 0,
});

const getStatusClass = (status) =>
  status === "Đang hoạt động"
    ? "bg-green-100 text-green-700 hover:bg-green-100"
    : "bg-gray-200 text-gray-700 hover:bg-gray-200";

function DatePickerField({ value, onChange, placeholder = "Chọn ngày" }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="w-full justify-between font-normal">
          {value ? format(new Date(value), "dd/MM/yyyy") : placeholder}
          <CalendarDays className="h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={vi}
          selected={value ? new Date(value) : undefined}
          onSelect={(date) => date && onChange(format(date, "yyyy-MM-dd"))}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export default function DiscountPage() {
  const [discounts, setDiscounts] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [deletingDiscount, setDeletingDiscount] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const form = useForm({
    resolver: zodResolver(discountSchema),
    defaultValues,
  });

  const fetchDiscountList = async () => {
    try {
      const res = await getDiscounts();
      setDiscounts((res?.data || []).map(mapApiDiscountToUI));
    } catch (error) {
      console.error("GET DISCOUNTS ERROR:", error);
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Không thể tải danh sách mã giảm giá"
      );
    }
  };

  useEffect(() => {
    fetchDiscountList();
  }, []);

  const filteredDiscounts = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    return discounts.filter(
      (item) =>
        item.code.toLowerCase().includes(keyword) ||
        item.type.toLowerCase().includes(keyword) ||
        item.condition.toLowerCase().includes(keyword)
    );
  }, [discounts, search]);

  const resetFormAndClose = () => {
    form.reset(defaultValues);
    setEditingDiscount(null);
    setOpen(false);
  };

  const buildPayload = (data, isDisabled = 0) => ({
    discountCode: data.code.trim().toUpperCase(),
    discountPercentage: Number(data.value ?? data.discountPercentage),
    validFrom: data.startDate,
    validTo: data.endDate,
    discountDescription: data.condition.trim(),
    isDisabled,
  });

  const onSubmit = async (values) => {
    try {
      const discountPercentage = Number(values.value);

      if (Number.isNaN(discountPercentage)) {
        toast.error("Giá trị giảm không hợp lệ");
        return;
      }

      setSubmitting(true);

      const payload = buildPayload(
        values,
        editingDiscount ? editingDiscount.isDisabled : 0
      );

      if (editingDiscount) {
        await updateDiscount(editingDiscount.id, payload);
        toast.success("Cập nhật mã giảm giá thành công!");
      } else {
        await createDiscount(payload);
        toast.success("Thêm mã giảm giá thành công!");
      }

      await fetchDiscountList();
      resetFormAndClose();
    } catch (error) {
      console.error("SAVE ERROR:", error);
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Không thể lưu mã giảm giá"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openDeletePopup = (item) => {
    setDeletingDiscount(item);
    setDeletePopupOpen(true);
  };

  const closeDeletePopup = () => {
    if (deleting) return;
    setDeletePopupOpen(false);
    setDeletingDiscount(null);
  };

  const confirmDelete = async () => {
    if (!deletingDiscount) return;

    try {
      setDeleting(true);
      await deleteDiscount(deletingDiscount.id);
      toast.success(`Đã xóa mã giảm giá "${deletingDiscount.code}"`);
      await fetchDiscountList();
      setDeletePopupOpen(false);
      setDeletingDiscount(null);
    } catch (error) {
      console.error("DELETE ERROR:", error);
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Không thể xóa mã giảm giá"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingDiscount(item);
    form.reset({
      code: item.code || "",
      type: item.type || "Phần trăm",
      value: item.discountPercentage ? String(item.discountPercentage) : "",
      condition: item.condition || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
    });
    setOpen(true);
  };

  const handleToggleVisibility = async (item) => {
    const nextDisabled = item.isDisabled === 1 ? 0 : 1;

    try {
      await updateDiscount(item.id, buildPayload(item, nextDisabled));

      toast.success(
        nextDisabled === 1
          ? `Đã ẩn mã giảm giá "${item.code}"`
          : `Đã hiện mã giảm giá "${item.code}"`
      );

      await fetchDiscountList();
    } catch (error) {
      console.error("TOGGLE ERROR:", error);
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Không thể cập nhật trạng thái mã giảm giá"
      );
    }
  };

  const stats = [
    { label: "Tổng mã giảm giá", value: discounts.length },
    {
      label: "Đang hoạt động",
      value: discounts.filter((item) => item.status === "Đang hoạt động").length,
    },
    {
      label: "Đang ẩn",
      value: discounts.filter((item) => item.status === "Đang ẩn").length,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Trang mã giảm giá</h1>

      <div className="flex items-center justify-between">
        <Dialog
          open={open}
          onOpenChange={(value) => {
            setOpen(value);
            if (!value) resetFormAndClose();
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="flex items-center gap-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                setEditingDiscount(null);
                form.reset(defaultValues);
                setOpen(true);
              }}
            >
              <Plus size={16} />
              Thêm mã giảm giá
            </Button>
          </DialogTrigger>

          <DialogContent
            className="sm:max-w-[760px] rounded-2xl"
            aria-describedby="discount-dialog-description"
          >
            <DialogHeader>
              <DialogTitle>
                {editingDiscount ? "Cập nhật mã giảm giá" : "Thêm mã giảm giá"}
              </DialogTitle>
            </DialogHeader>

            <p id="discount-dialog-description" className="sr-only">
              Form thêm hoặc cập nhật mã giảm giá
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã giảm giá</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="VD: SALE20" {...field} />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              form.setValue("code", generateDiscountCode(), {
                                shouldValidate: true,
                              })
                            }
                            className="shrink-0 flex items-center gap-2"
                            disabled={submitting}
                          >
                            <Wand2 size={14} />
                            Tạo mã
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại giảm giá</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại giảm giá" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Phần trăm">Phần trăm</SelectItem>
                            <SelectItem value="Giảm tiền">Giảm tiền</SelectItem>
                            <SelectItem value="Miễn phí vận chuyển">
                              Miễn phí vận chuyển
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá trị giảm (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="VD: 20" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày bắt đầu</FormLabel>
                        <FormControl>
                          <DatePickerField
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Chọn ngày bắt đầu"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày kết thúc</FormLabel>
                        <FormControl>
                          <DatePickerField
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Chọn ngày kết thúc"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Mô tả / Điều kiện áp dụng</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="VD: Giảm giá 10% toàn bộ sản phẩm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetFormAndClose}
                    disabled={submitting}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={submitting}
                  >
                    {submitting
                      ? editingDiscount
                        ? "Đang cập nhật..."
                        : "Đang lưu..."
                      : editingDiscount
                      ? "Cập nhật"
                      : "Lưu mã giảm giá"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <div className="relative w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Tìm kiếm..."
            className="bg-white pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.label} className="rounded-2xl">
            <CardContent className="p-5">
              <div className="text-sm text-muted-foreground">{item.label}</div>
              <div className="mt-2 text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr className="text-left">
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Mã giảm giá</th>
                <th className="px-6 py-4 font-medium">Loại</th>
                <th className="px-6 py-4 font-medium">Giá trị</th>
                <th className="px-6 py-4 font-medium">Điều kiện</th>
                <th className="px-6 py-4 font-medium">Bắt đầu</th>
                <th className="px-6 py-4 font-medium">Kết thúc</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 text-right font-medium">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {filteredDiscounts.map((item) => (
                <tr key={item.id} className="border-b last:border-b-0 hover:bg-muted/20">
                  <td className="px-6 py-4">{item.id}</td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <TicketPercent size={18} className="text-muted-foreground" />
                      </div>
                      <span className="font-medium">{item.code}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">{item.type}</td>
                  <td className="px-6 py-4 font-medium">{item.value}%</td>
                  <td className="px-6 py-4">{item.condition}</td>
                  <td className="px-6 py-4">{formatDisplayDate(item.startDate)}</td>
                  <td className="px-6 py-4">{formatDisplayDate(item.endDate)}</td>

                  <td className="px-6 py-4">
                    <Badge className={`rounded-full px-3 py-1 ${getStatusClass(item.status)}`}>
                      {item.status}
                    </Badge>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        className="flex items-center gap-1 bg-slate-600 text-white hover:bg-slate-700"
                        onClick={() => handleToggleVisibility(item)}
                      >
                        {item.isDisabled === 1 ? (
                          <>
                            <Eye size={14} />
                            Hiện
                          </>
                        ) : (
                          <>
                            <EyeOff size={14} />
                            Ẩn
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        className="flex items-center gap-1 bg-yellow-400 text-white hover:bg-yellow-500"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil size={14} />
                        Sửa
                      </Button>

                      <Button
                        size="sm"
                        className="flex items-center gap-1 bg-red-600 text-white hover:bg-red-700"
                        onClick={() => openDeletePopup(item)}
                      >
                        <Trash2 size={14} />
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredDiscounts.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Không có mã giảm giá nào
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deletePopupOpen} onOpenChange={setDeletePopupOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa mã giảm giá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa mã giảm giá{" "}
              <span className="font-semibold text-foreground">
                "{deletingDiscount?.code}"
              </span>{" "}
              không?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeletePopup} disabled={deleting}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? "Đang xóa..." : "Xác nhận xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}