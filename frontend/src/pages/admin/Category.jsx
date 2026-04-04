import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
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

import {
  Pencil,
  Trash2,
  Plus,
  Search,
  FolderTree,
  Eye,
  EyeOff,
} from "lucide-react";

const categorySchema = z.object({
  categoryName: z.string().min(1, "Vui lòng nhập tên danh mục"),
  isDisabled: z.string().min(1, "Vui lòng chọn trạng thái"),
});

const defaultValues = {
  categoryName: "",
  isDisabled: "0",
};

const mapApiCategoryToUI = (item) => ({
  id: item.category_id,
  name: item.category_name || "",
  isDisabled: Number(item.is_disabled ?? 0),
  status: Number(item.is_disabled ?? 0) === 1 ? "Đang ẩn" : "Đang hoạt động",
});

const getStatusClass = (status) =>
  status === "Đang hoạt động"
    ? "bg-green-100 text-green-700 hover:bg-green-100"
    : "bg-gray-200 text-gray-700 hover:bg-gray-200";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });

  const fetchCategoryList = async () => {
    try {
      const res = await getCategories();
      setCategories((res?.data || []).map(mapApiCategoryToUI));
    } catch (error) {
      console.error("GET CATEGORIES ERROR:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tải danh sách danh mục"
      );
    }
  };

  useEffect(() => {
    fetchCategoryList();
  }, []);

  const filteredCategories = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    return categories.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.status.toLowerCase().includes(keyword) ||
        String(item.id).includes(keyword)
    );
  }, [categories, search]);

  const resetFormAndClose = () => {
    form.reset(defaultValues);
    setEditingCategory(null);
    setOpen(false);
  };

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);

      const payload = {
        categoryName: values.categoryName.trim(),
        isDisabled: Number(values.isDisabled),
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await createCategory({
          categoryName: values.categoryName.trim(),
        });
        toast.success("Thêm danh mục thành công!");
      }

      await fetchCategoryList();
      resetFormAndClose();
    } catch (error) {
      console.error("SAVE CATEGORY ERROR:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể lưu danh mục"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteDialog = (item) => {
    setDeletingCategory(item);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    try {
      setDeleting(true);
      await deleteCategory(deletingCategory.id);
      toast.success(`Đã xóa danh mục "${deletingCategory.name}"`);
      setDeleteDialogOpen(false);
      setDeletingCategory(null);
      await fetchCategoryList();
    } catch (error) {
      console.error("DELETE CATEGORY ERROR:", error);

      const serverMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "";

      const normalizedMessage = String(serverMessage).toLowerCase();

      const isCategoryHasProductsError =
        normalizedMessage.includes("foreign key") ||
        normalizedMessage.includes("constraint") ||
        normalizedMessage.includes("cannot delete") ||
        normalizedMessage.includes("a foreign key constraint fails") ||
        normalizedMessage.includes("internal server error") ||
        normalizedMessage.includes("danh mục đang có sản phẩm") ||
        normalizedMessage.includes("vẫn còn sản phẩm");

      if (isCategoryHasProductsError) {
        toast.error("Không thể xóa danh mục vì vẫn còn sản phẩm trong danh mục này");
      } else {
        toast.error(serverMessage || "Không thể xóa danh mục");
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingCategory(item);
    form.reset({
      categoryName: item.name || "",
      isDisabled: String(item.isDisabled),
    });
    setOpen(true);
  };

  const handleToggleVisibility = async (item) => {
    const nextDisabled = item.isDisabled === 1 ? 0 : 1;

    try {
      await updateCategory(item.id, {
        categoryName: item.name,
        isDisabled: nextDisabled,
      });

      toast.success(
        nextDisabled === 1
          ? `Đã ẩn danh mục "${item.name}"`
          : `Đã hiện danh mục "${item.name}"`
      );

      await fetchCategoryList();
    } catch (error) {
      console.error("TOGGLE CATEGORY ERROR:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể cập nhật trạng thái danh mục"
      );
    }
  };

  const stats = [
    { label: "Tổng danh mục", value: categories.length },
    {
      label: "Đang hoạt động",
      value: categories.filter((item) => item.status === "Đang hoạt động").length,
    },
    {
      label: "Đang ẩn",
      value: categories.filter((item) => item.status === "Đang ẩn").length,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Trang danh mục</h1>

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
                setEditingCategory(null);
                form.reset(defaultValues);
                setOpen(true);
              }}
            >
              <Plus size={16} />
              Thêm danh mục
            </Button>
          </DialogTrigger>

          <DialogContent
            className="sm:max-w-[600px] rounded-2xl"
            aria-describedby="category-dialog-description"
          >
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Cập nhật danh mục" : "Thêm danh mục"}
              </DialogTitle>
            </DialogHeader>

            <p id="category-dialog-description" className="sr-only">
              Form thêm hoặc cập nhật danh mục
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="categoryName"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Tên danh mục</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: Phòng khách" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {editingCategory && (
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
                      ? editingCategory
                        ? "Đang cập nhật..."
                        : "Đang lưu..."
                      : editingCategory
                      ? "Cập nhật"
                      : "Lưu danh mục"}
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
                <th className="px-6 py-4 font-medium">Tên danh mục</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 text-right font-medium">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.map((item) => (
                <tr key={item.id} className="border-b last:border-b-0 hover:bg-muted/20">
                  <td className="px-6 py-4">{item.id}</td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <FolderTree size={18} className="text-muted-foreground" />
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

          {filteredCategories.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Không có danh mục nào
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(value) => {
          setDeleteDialogOpen(value);
          if (!value) {
            setDeletingCategory(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Bạn có chắc muốn xóa danh mục{" "}
              <span className="font-semibold text-foreground">
                "{deletingCategory?.name}"
              </span>{" "}
              không?
            </p>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeletingCategory(null);
                }}
                disabled={deleting}
              >
                Hủy
              </Button>

              <Button
                type="button"
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Đang xóa..." : "Xác nhận xóa"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}