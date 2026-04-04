import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";

import { getBrands, createBrand, updateBrand, deleteBrand } from "../../lib/api";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Pencil, Trash2, Plus, Search, Tags, Eye, EyeOff, AlertTriangle } from "lucide-react";

const brandSchema = z.object({
  brandName: z.string().min(1, "Vui lòng nhập tên thương hiệu"),
  isDisabled: z.string().min(1, "Vui lòng chọn trạng thái"),
});

const defaultValues = {
  brandName: "",
  isDisabled: "0",
};

const mapApiBrandToUI = (item) => ({
  id: item.brand_id,
  name: item.brand_name || "",
  isDisabled: Number(item.is_disabled ?? 0),
  status: Number(item.is_disabled ?? 0) === 1 ? "Đang ẩn" : "Đang hoạt động",
});

const getStatusClass = (status) =>
  status === "Đang hoạt động"
    ? "bg-green-100 text-green-700 hover:bg-green-100"
    : "bg-gray-200 text-gray-700 hover:bg-gray-200";

export default function BrandPage() {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const form = useForm({
    resolver: zodResolver(brandSchema),
    defaultValues,
  });

  const fetchBrandList = async () => {
    try {
      const res = await getBrands();
      setBrands((res?.data || []).map(mapApiBrandToUI));
    } catch (error) {
      console.error("GET BRANDS ERROR:", error);
      toast.error(error?.response?.data?.message || error?.message || "Không thể tải danh sách thương hiệu");
    }
  };

  useEffect(() => {
    fetchBrandList();
  }, []);

  const filteredBrands = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return brands.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.status.toLowerCase().includes(keyword) ||
        String(item.id).includes(keyword)
    );
  }, [brands, search]);

  const resetFormAndClose = () => {
    form.reset(defaultValues);
    setEditingBrand(null);
    setOpen(false);
  };

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);

      const payload = {
        brandName: values.brandName.trim(),
        isDisabled: Number(values.isDisabled),
      };

      if (editingBrand) {
        await updateBrand(editingBrand.id, payload);
        toast.success("Cập nhật thương hiệu thành công!");
      } else {
        await createBrand({
          brandName: values.brandName.trim(),
        });
        toast.success("Thêm thương hiệu thành công!");
      }

      await fetchBrandList();
      resetFormAndClose();
    } catch (error) {
      console.error("SAVE BRAND ERROR:", error);
      toast.error(error?.response?.data?.message || error?.message || "Không thể lưu thương hiệu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id, name) => {
    setDeleteTarget({ id, name });
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await deleteBrand(deleteTarget.id);
      toast.success(`Đã xóa thương hiệu "${deleteTarget.name}"`);
      await fetchBrandList();
      setConfirmOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error("DELETE BRAND ERROR:", error);

      const serverMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "";

      const normalizedMessage = String(serverMessage).toLowerCase();

      const isBrandHasProductsError =
        normalizedMessage.includes("foreign key") ||
        normalizedMessage.includes("constraint") ||
        normalizedMessage.includes("cannot delete") ||
        normalizedMessage.includes("a foreign key constraint fails") ||
        normalizedMessage.includes("internal server error") ||
        normalizedMessage.includes("thương hiệu đang có sản phẩm") ||
        normalizedMessage.includes("vẫn còn sản phẩm");

      if (isBrandHasProductsError) {
        toast.error("Còn sản phẩm thuộc thương hiệu này");
      } else {
        toast.error(serverMessage || "Không thể xóa thương hiệu");
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingBrand(item);
    form.reset({
      brandName: item.name || "",
      isDisabled: String(item.isDisabled),
    });
    setOpen(true);
  };

  const handleToggleVisibility = async (item) => {
    const nextDisabled = item.isDisabled === 1 ? 0 : 1;

    try {
      await updateBrand(item.id, {
        brandName: item.name,
        isDisabled: nextDisabled,
      });

      toast.success(
        nextDisabled === 1
          ? `Đã ẩn thương hiệu "${item.name}"`
          : `Đã hiện thương hiệu "${item.name}"`
      );

      await fetchBrandList();
    } catch (error) {
      console.error("TOGGLE BRAND ERROR:", error);
      toast.error(error?.response?.data?.message || error?.message || "Không thể cập nhật trạng thái thương hiệu");
    }
  };

  const stats = [
    { label: "Tổng thương hiệu", value: brands.length },
    {
      label: "Đang hoạt động",
      value: brands.filter((item) => item.status === "Đang hoạt động").length,
    },
    {
      label: "Đang ẩn",
      value: brands.filter((item) => item.status === "Đang ẩn").length,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Trang thương hiệu</h1>

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
                setEditingBrand(null);
                form.reset(defaultValues);
                setOpen(true);
              }}
            >
              <Plus size={16} />
              Thêm thương hiệu
            </Button>
          </DialogTrigger>

          <DialogContent
            className="sm:max-w-[600px] rounded-2xl"
            aria-describedby="brand-dialog-description"
          >
            <DialogHeader>
              <DialogTitle>
                {editingBrand ? "Cập nhật thương hiệu" : "Thêm thương hiệu"}
              </DialogTitle>
            </DialogHeader>

            <p id="brand-dialog-description" className="sr-only">
              Form thêm hoặc cập nhật thương hiệu
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="brandName"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Tên thương hiệu</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: IKEA, Hòa Phát..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {editingBrand && (
                    <FormField
                      control={form.control}
                      name="isDisabled"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Trạng thái</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">Đang hoạt động</SelectItem>
                              <SelectItem value="1">Đang ẩn</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
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
                      ? editingBrand
                        ? "Đang cập nhật..."
                        : "Đang lưu..."
                      : editingBrand
                        ? "Cập nhật"
                        : "Lưu thương hiệu"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <div className="relative w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
                <th className="px-6 py-4 font-medium">Tên thương hiệu</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 text-right font-medium">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {filteredBrands.map((item) => (
                <tr key={item.id} className="border-b last:border-b-0 hover:bg-muted/20">
                  <td className="px-6 py-4">{item.id}</td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <Tags size={18} className="text-muted-foreground" />
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </td>

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
                        onClick={() => handleDelete(item.id, item.name)}
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

          {filteredBrands.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Không có thương hiệu nào
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={confirmOpen}
        onOpenChange={(value) => {
          setConfirmOpen(value);
          if (!value && !deleting) {
            setDeleteTarget(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[420px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-500" />
              Xác nhận xóa
            </DialogTitle>
          </DialogHeader>

          <div className="py-2 text-sm text-muted-foreground">
            Bạn có chắc muốn xóa thương hiệu{" "}
            <span className="font-semibold text-foreground">
              "{deleteTarget?.name}"
            </span>{" "}
            không?
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => {
                setConfirmOpen(false);
                setDeleteTarget(null);
              }}
            >
              Hủy
            </Button>

            <Button
              type="button"
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleting}
              onClick={confirmDelete}
            >
              {deleting ? "Đang xóa..." : "Xóa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}