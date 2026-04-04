import { useState, useEffect } from "react";

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  getProductById,
} from "../../lib/api";

import { Loader2, FileBox, ExternalLink } from "lucide-react";

export default function ViewProductModal({ open, onClose, productId }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch product detail when modal opens
  useEffect(() => {
    if (!open || !productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await getProductById(productId);
        setProduct(res.data);
      } catch (err) {
        console.error("Load product failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [open, productId]);

  // Reset on close
  const handleClose = () => {
    setProduct(null);
    setPreviewImage(null);
    onClose();
  };

  const getStatusBadge = (status) => {
    const s = String(status).toLowerCase();
    if (s === "available") return "bg-green-100 text-green-700";
    if (s === "out_of_stock") return "bg-red-100 text-red-700";
    if (s === "reserved") return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-700";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl flex items-center justify-between">
              <span>Chi tiết sản phẩm</span>
              {product && (
                <span className="text-xs font-normal text-slate-400">
                  ID: #{product.product_id} | Variant Ref: {product.variant_ref || "N/A"}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
          ) : product ? (
            <ScrollArea className="h-[75vh] pr-4 mt-4">
              <div className="space-y-8">
                {/* ========== SECTION 1: Thông tin cơ bản ========== */}
                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-8 space-y-6">
                    <div>
                      <Label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        Tên sản phẩm
                      </Label>
                      <h2 className="text-2xl font-bold text-slate-800 mt-1">
                        {product.product_name}
                      </h2>
                    </div>

                    <div>
                      <Label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        Mô tả
                      </Label>
                      <p className="mt-2 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {product.product_description || "Không có mô tả cho sản phẩm này."}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-4 bg-slate-50/50 rounded-2xl p-6 border border-slate-100 h-fit space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                          Nhãn hàng
                        </Label>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {product.brand_name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                          Danh mục
                        </Label>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {product.category_name || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-200/50">
                      <div>
                        <Label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                          Bộ sưu tập
                        </Label>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {product.collection_name || "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                          Trạng thái
                        </Label>
                        <Badge
                          className={`shadow-none ${
                            product.is_disabled ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"
                          }`}
                          variant="outline">
                          {product.is_disabled ? "Đã ẩn" : "Đang hiển thị"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="opacity-50" />

                {/* ========== SECTION 2: Bảng biến thể ========== */}
                {product.variants?.variants && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                      Dữ liệu biến thể ({product.variants.variants.length})
                    </h3>
                    <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 text-slate-500 uppercase font-medium border-b">
                            <tr>
                              <th className="p-4">SKU</th>
                              <th className="p-4">Giá (VNĐ)</th>
                              <th className="p-4 text-center">Tồn kho</th>
                              <th className="p-4">Kích thước (LxWxH)</th>
                              <th className="p-4">Khối lượng</th>
                              <th className="p-4">Chất liệu / Màu</th>
                              <th className="p-4">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {product.variants.variants.map((v, i) => (
                              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 font-bold text-slate-900">{v.sku}</td>
                                <td className="p-4 text-orange-600 font-bold whitespace-nowrap">
                                  {Number(v.price).toLocaleString("vi-VN")} đ
                                </td>
                                <td className="p-4 text-center font-medium">{v.stock}</td>
                                <td className="p-4 text-slate-500">
                                  {v.specs?.dimensions?.length || 0} x {v.specs?.dimensions?.width || 0} x {v.specs?.dimensions?.height || 0} cm
                                </td>
                                <td className="p-4 text-slate-500">{v.specs?.weight || 0} kg</td>
                                <td className="p-4 text-slate-500 font-medium">
                                  {v.specs?.material || "N/A"} / {v.specs?.color || "N/A"}
                                </td>
                                <td className="p-4">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase ${getStatusBadge(v.status)}`}>
                                    {v.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                <Separator className="opacity-50" />

                {/* ========== SECTION 3: Hình ảnh ========== */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                      Hình ảnh sản phẩm
                    </h3>
                    {product.variants?.images && product.variants.images.length > 0 ? (
                      <div className="flex gap-4 flex-wrap">
                        {product.variants.images.map((src, i) => (
                          <div
                            key={i}
                            className="group relative cursor-pointer rounded-xl overflow-hidden border-2 border-slate-100 hover:border-indigo-500 transition-all shadow-sm"
                            onClick={() => setPreviewImage(src)}>
                            <img
                              src={src}
                              alt={`Product image ${i + 1}`}
                              className="w-32 h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <ExternalLink className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic">Không có hình ảnh.</p>
                    )}
                  </div>

                  {/* ========== SECTION 4: Model 3D ========== */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                      Model 3D
                    </h3>
                    {product.variants?.model3d ? (
                      <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                        <div className="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-200">
                          <FileBox size={24} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-indigo-900 truncate">
                            {product.variants.model3d.split("/").pop()}
                          </p>
                          <p className="text-xs text-indigo-400 font-medium">Đã upload lên hệ thống</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic">Sản phẩm này không có Model 3D.</p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Không tìm thấy thông tin sản phẩm.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Preview Popup */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="sm:max-w-3xl p-0 bg-transparent border-none shadow-none flex items-center justify-center">
          {previewImage && (
            <div className="relative group bg-white/10 backdrop-blur-md p-2 rounded-2xl">
              <img
                src={previewImage}
                alt="Full preview"
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
