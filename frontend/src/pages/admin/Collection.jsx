import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";

import { getCollections, createCollection, updateCollection, deleteCollection } from "../../lib/api";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Pencil, Trash2, Plus, Search, FolderKanban, Eye, EyeOff } from "lucide-react";

const collectionSchema = z.object({
  collectionName: z.string().min(1, "Vui lòng nhập tên bộ sưu tập"),
  isDisabled: z.string().min(1, "Vui lòng chọn trạng thái"),
});

const defaultValues = {
  collectionName: "",
  isDisabled: "0",
};

const mapApiCollectionToUI = (item) => ({
  id: item.collection_id,
  name: item.collection_name || "",
  isDisabled: Number(item.is_disabled ?? 0),
  status: Number(item.is_disabled ?? 0) === 1 ? "Đang ẩn" : "Đang hoạt động",
});

const getStatusClass = (status) =>
  status === "Đang hoạt động"
    ? "bg-green-100 text-green-700 hover:bg-green-100"
    : "bg-gray-200 text-gray-700 hover:bg-gray-200";

export default function CollectionPage() {
  const [collections, setCollections] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [deletingCollection, setDeletingCollection] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const form = useForm({
    resolver: zodResolver(collectionSchema),
    defaultValues,
  });

  const fetchCollectionList = async () => {
    try {
      const res = await getCollections();
      setCollections((res?.data || []).map(mapApiCollectionToUI));
    } catch (error) {
      console.error("GET COLLECTIONS ERROR:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tải danh sách bộ sưu tập"
      );
    }
  };

  useEffect(() => {
    fetchCollectionList();
  }, []);

  const filteredCollections = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    return collections.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.status.toLowerCase().includes(keyword) ||
        String(item.id).includes(keyword)
    );
  }, [collections, search]);

  const resetFormAndClose = () => {
    form.reset(defaultValues);
    setEditingCollection(null);
    setOpen(false);
  };

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);

      const payload = {
        collectionName: values.collectionName.trim(),
        isDisabled: Number(values.isDisabled),
      };

      if (editingCollection) {
        await updateCollection(editingCollection.id, payload);
        toast.success("Cập nhật bộ sưu tập thành công!");
      } else {
        await createCollection({
          collectionName: values.collectionName.trim(),
        });
        toast.success("Thêm bộ sưu tập thành công!");
      }

      await fetchCollectionList();
      resetFormAndClose();
    } catch (error) {
      console.error("SAVE COLLECTION ERROR:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể lưu bộ sưu tập"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openDeletePopup = (item) => {
    setDeletingCollection(item);
    setDeletePopupOpen(true);
  };

  const closeDeletePopup = () => {
    if (deleting) return;
    setDeletePopupOpen(false);
    setDeletingCollection(null);
  };

  const confirmDelete = async () => {
    if (!deletingCollection) return;

    try {
      setDeleting(true);
      await deleteCollection(deletingCollection.id);
      toast.success(`Đã xóa bộ sưu tập "${deletingCollection.name}"`);
      await fetchCollectionList();
      setDeletePopupOpen(false);
      setDeletingCollection(null);
    } catch (error) {
      console.error("DELETE COLLECTION ERROR:", error);

      const serverMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "";

      const normalizedMessage = String(serverMessage).toLowerCase();

      const isCollectionHasProductsError =
        normalizedMessage.includes("foreign key") ||
        normalizedMessage.includes("constraint") ||
        normalizedMessage.includes("cannot delete") ||
        normalizedMessage.includes("a foreign key constraint fails") ||
        normalizedMessage.includes("internal server error") ||
        normalizedMessage.includes("bộ sưu tập đang có sản phẩm") ||
        normalizedMessage.includes("vẫn còn sản phẩm");

      if (isCollectionHasProductsError) {
        toast.error("Còn sản phẩm thuộc bộ sưu tập này");
      } else {
        toast.error(serverMessage || "Không thể xóa bộ sưu tập");
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingCollection(item);
    form.reset({
      collectionName: item.name || "",
      isDisabled: String(item.isDisabled),
    });
    setOpen(true);
  };

  const handleToggleVisibility = async (item) => {
    const nextDisabled = item.isDisabled === 1 ? 0 : 1;

    try {
      await updateCollection(item.id, {
        collectionName: item.name,
        isDisabled: nextDisabled,
      });

      toast.success(
        nextDisabled === 1
          ? `Đã ẩn bộ sưu tập "${item.name}"`
          : `Đã hiện bộ sưu tập "${item.name}"`
      );

      await fetchCollectionList();
    } catch (error) {
      console.error("TOGGLE COLLECTION ERROR:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể cập nhật trạng thái bộ sưu tập"
      );
    }
  };

  const stats = [
    { label: "Tổng bộ sưu tập", value: collections.length },
    {
      label: "Đang hoạt động",
      value: collections.filter((item) => item.status === "Đang hoạt động").length,
    },
    {
      label: "Đang ẩn",
      value: collections.filter((item) => item.status === "Đang ẩn").length,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Trang bộ sưu tập</h1>

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
                setEditingCollection(null);
                form.reset(defaultValues);
                setOpen(true);
              }}
            >
              <Plus size={16} />
              Thêm bộ sưu tập
            </Button>
          </DialogTrigger>

          <DialogContent
            className="sm:max-w-[600px] rounded-2xl"
            aria-describedby="collection-dialog-description"
          >
            <DialogHeader>
              <DialogTitle>
                {editingCollection ? "Cập nhật bộ sưu tập" : "Thêm bộ sưu tập"}
              </DialogTitle>
            </DialogHeader>

            <p id="collection-dialog-description" className="sr-only">
              Form thêm hoặc cập nhật bộ sưu tập
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="collectionName"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Tên bộ sưu tập</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: Bộ sưu tập mùa hè" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {editingCollection && (
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
                      ? editingCollection
                        ? "Đang cập nhật..."
                        : "Đang lưu..."
                      : editingCollection
                        ? "Cập nhật"
                        : "Lưu bộ sưu tập"}
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
                <th className="px-6 py-4 font-medium">Tên bộ sưu tập</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 text-right font-medium">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {filteredCollections.map((item) => (
                <tr key={item.id} className="border-b last:border-b-0 hover:bg-muted/20">
                  <td className="px-6 py-4">{item.id}</td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <FolderKanban size={18} className="text-muted-foreground" />
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

          {filteredCollections.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Không có bộ sưu tập nào
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deletePopupOpen} onOpenChange={setDeletePopupOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bộ sưu tập</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bộ sưu tập{" "}
              <span className="font-semibold text-foreground">
                "{deletingCollection?.name}"
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