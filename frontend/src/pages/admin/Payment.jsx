import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from "@/lib/api";

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
  CreditCard,
  Pencil,
  Plus,
  Search,
  Trash2,
  ReceiptText,
  Wallet,
} from "lucide-react";

const paymentSchema = z.object({
  paymentMethod: z.string().min(1, "Vui lòng nhập phương thức thanh toán"),
  orderId: z
    .string()
    .min(1, "Vui lòng nhập order id")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Order ID phải là số lớn hơn 0",
    }),
});

const formDefaults = {
  paymentMethod: "",
  orderId: "",
};

const mapPayment = (item) => ({
  id: item.payment_id,
  paymentMethod: item.payment_method || "",
  orderId: item.order_id || "",
});

const paymentBadgeClass = (method) => {
  const value = String(method).toLowerCase();

  if (value.includes("cod")) {
    return "bg-orange-100 text-orange-700 hover:bg-orange-100";
  }

  if (
    value.includes("bank") ||
    value.includes("transfer") ||
    value.includes("banking")
  ) {
    return "bg-blue-100 text-blue-700 hover:bg-blue-100";
  }

  if (
    value.includes("momo") ||
    value.includes("zalopay") ||
    value.includes("vnpay")
  ) {
    return "bg-violet-100 text-violet-700 hover:bg-violet-100";
  }

  return "bg-slate-100 text-slate-700 hover:bg-slate-100";
};

export default function PaymentPage() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: formDefaults,
  });

  const fetchPayments = async () => {
    try {
      const res = await getPayments();
      setPayments((res?.data || []).map(mapPayment));
    } catch (error) {
      alert(error.message || "Không thể tải danh sách payment");
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return payments.filter(
      (item) =>
        String(item.id).includes(keyword) ||
        String(item.orderId).includes(keyword) ||
        item.paymentMethod.toLowerCase().includes(keyword)
    );
  }, [payments, search]);

  const closeDialog = (value) => {
    setOpen(value);
    if (!value) {
      setEditingPayment(null);
      form.reset(formDefaults);
    }
  };

  const openCreate = () => {
    setEditingPayment(null);
    form.reset(formDefaults);
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditingPayment(item);
    form.reset({
      paymentMethod: item.paymentMethod,
      orderId: String(item.orderId),
    });
    setOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      const payload = {
        paymentMethod: values.paymentMethod.trim(),
        orderId: Number(values.orderId),
      };

      if (editingPayment) {
        await updatePayment(editingPayment.id, payload);
      } else {
        await createPayment(payload);
      }

      await fetchPayments();
      closeDialog(false);
    } catch (error) {
      alert(error.message || "Thao tác thất bại");
    }
  };

  const openDeleteDialog = (item) => {
    setDeletingPayment(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPayment) return;

    try {
      setIsDeleting(true);
      await deletePayment(deletingPayment.id);
      await fetchPayments();
      setDeleteDialogOpen(false);
      setDeletingPayment(null);
    } catch (error) {
      alert(error.message || "Không thể xoá payment");
    } finally {
      setIsDeleting(false);
    }
  };

  const stats = [
    { label: "Tổng payment", value: payments.length, icon: ReceiptText },
    {
      label: "Order liên kết",
      value: payments.filter((item) => item.orderId).length,
      icon: Wallet,
    },
    {
      label: "Phương thức khác nhau",
      value: new Set(
        payments.map((item) => item.paymentMethod.toLowerCase())
      ).size,
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Trang payment</h1>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Dialog open={open} onOpenChange={closeDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus size={16} />
              Thêm payment
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[720px] rounded-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPayment ? "Cập nhật payment" : "Thêm payment"}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phương thức thanh toán</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="VD: COD, Banking, Momo..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="orderId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order ID</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Nhập order id"
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
                    onClick={() => closeDialog(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {editingPayment ? "Cập nhật" : "Tạo payment"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <div className="relative w-full md:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Tìm theo ID, order, phương thức..."
            className="bg-white pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {item.label}
                    </div>
                    <div className="mt-2 text-2xl font-bold">{item.value}</div>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                    <Icon size={18} className="text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr className="text-left">
                  <th className="px-6 py-4 font-medium">ID</th>
                  <th className="px-6 py-4 font-medium">Phương thức</th>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 text-right font-medium">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-b-0 hover:bg-muted/20"
                  >
                    <td className="px-6 py-4 font-medium">{item.id}</td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                          <CreditCard size={18} className="text-blue-600" />
                        </div>

                        <div className="space-y-1">
                          <div className="font-medium">
                            {item.paymentMethod}
                          </div>
                          <Badge
                            className={`rounded-full px-3 py-1 ${paymentBadgeClass(
                              item.paymentMethod
                            )}`}
                          >
                            {item.paymentMethod}
                          </Badge>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">{item.orderId}</td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          className="flex items-center gap-1 bg-yellow-400 text-white hover:bg-yellow-500"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil size={14} />
                          Sửa
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex items-center gap-1"
                          onClick={() => openDeleteDialog(item)}
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
          </div>

          {filteredPayments.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Không có payment nào
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(value) => {
          setDeleteDialogOpen(value);
          if (!value) {
            setDeletingPayment(null);
          }
        }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá payment</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingPayment ? (
                <>
                  Bạn có chắc muốn xoá payment có ID{" "}
                  <span className="font-semibold text-foreground">
                    #{deletingPayment.id}
                  </span>{" "}
                  với phương thức{" "}
                  <span className="font-semibold text-foreground">
                    {deletingPayment.paymentMethod}
                  </span>{" "}
                  không?
                  <br />
                  Hành động này không thể hoàn tác.
                </>
              ) : (
                "Bạn có chắc muốn xoá payment này không?"
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? "Đang xoá..." : "Xóa payment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}