import { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  getBrands,
  getCategories,
  getCollections,
  getProductById,
  updateProduct,
  updateVariant,
  updateProductImages,
  updateProductModel3d,
} from "../../lib/api";

import { Loader2, X, Upload, FileBox, ImagePlus, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function EditProductModal({ open, onClose, productId, onProductUpdated }) {
  // === State: Basic Info ===
  const [form, setForm] = useState({
    product_name: "",
    product_description: "",
    product_status: "AVAILABLE",
    is_disabled: false,
    brand_id: "",
    category_id: "",
    collection_id: "",
  });

  // === State: Variant Table ===
  const [variantRows, setVariantRows] = useState([]);
  const [variantRef, setVariantRef] = useState(null);

  // === State: Images ===
  const [existingImages, setExistingImages] = useState([]); // URLs from DB
  const [newImageFiles, setNewImageFiles] = useState([]); // New File objects
  const [newImagePreviews, setNewImagePreviews] = useState([]); // Blob URLs for preview
  const [imagesChanged, setImagesChanged] = useState(false);

  // === State: Model 3D ===
  const [existingModel, setExistingModel] = useState(null); // URL from DB
  const [newModelFile, setNewModelFile] = useState(null);
  const [modelChanged, setModelChanged] = useState(false);

  // === State: Lookups ===
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);

  // === State: Loading ===
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch lookup data
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [brandsRes, categoriesRes, collectionsRes] = await Promise.all([
          getBrands(),
          getCategories(),
          getCollections(),
        ]);
        setBrands(brandsRes.data);
        setCategories(categoriesRes.data);
        setCollections(collectionsRes.data);
      } catch (err) {
        console.error("Load lookup data failed", err);
      }
    };
    fetchLookups();
  }, []);

  // Fetch product data when modal opens
  useEffect(() => {
    if (!open || !productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await getProductById(productId);
        const p = res.data;

        // Fill basic info
        setForm({
          product_name: p.product_name || "",
          product_description: p.product_description || "",
          product_status: p.product_status || "AVAILABLE",
          is_disabled: !!p.is_disabled,
          brand_id: String(p.brand_id || ""),
          category_id: String(p.category_id || ""),
          collection_id: String(p.collection_id || ""),
          variant_ref: p.variant_ref,
        });

        // Fill variant ref
        setVariantRef(p.variant_ref || null);

        // Fill variant rows
        if (p.variants?.variants && Array.isArray(p.variants.variants)) {
          setVariantRows(
            p.variants.variants.map((v) => ({
              sku: v.sku || "",
              price: v.price || 0,
              stock: v.stock || 0,
              dimensions: v.specs?.dimensions
                ? `${v.specs.dimensions.length || 0}x${v.specs.dimensions.width || 0}x${v.specs.dimensions.height || 0}`
                : "",
              weight: v.specs?.weight || 0,
              material: v.specs?.material || "",
              color: v.specs?.color || "",
              status: v.status || "available",
              _id: v._id || undefined,
            }))
          );
        } else {
          setVariantRows([]);
        }

        // Fill images
        setExistingImages(p.variants?.images || []);
        setNewImageFiles([]);
        setNewImagePreviews([]);
        setImagesChanged(false);

        // Fill model
        setExistingModel(p.variants?.model3d || null);
        setNewModelFile(null);
        setModelChanged(false);
      } catch (err) {
        console.error("Load product failed", err);
        toast.error("Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [open, productId]);

  // === Handlers: Variant Table (inline edit) ===
  const handleVariantCellChange = (rowIndex, field, value) => {
    setVariantRows((prev) =>
      prev.map((row, i) =>
        i === rowIndex ? { ...row, [field]: value } : row
      )
    );
  };

  const handleAddNewVariant = () => {
    setVariantRows((prev) => [
      ...prev,
      {
        sku: "",
        price: 0,
        stock: 0,
        dimensions: "",
        weight: 0,
        material: "",
        color: "",
        status: "available",
      },
    ]);
  };

  const handleRemoveVariant = (rowIndex) => {
    setVariantRows((prev) => prev.filter((_, i) => i !== rowIndex));
  };

  // Parse dimensions back to object
  const parseDimensions = (dimStr) => {
    if (!dimStr) return { length: 0, width: 0, height: 0 };
    const parts = String(dimStr).split(/[xX* ]+/).filter(Boolean);
    return {
      length: Number(parts[0]) || 0,
      width: Number(parts[1]) || 0,
      height: Number(parts[2]) || 0,
    };
  };

  // === Handlers: Images ===
  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    setImagesChanged(true);
  };

  const handleAddNewImages = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + newImageFiles.length + files.length;

    if (totalImages > 3) {
      toast.error("Tối đa 3 ảnh cho mỗi sản phẩm");
      return;
    }

    const updatedFiles = [...newImageFiles, ...files];
    setNewImageFiles(updatedFiles);
    setNewImagePreviews(updatedFiles.map((f) => URL.createObjectURL(f)));
    setImagesChanged(true);
  };

  const handleRemoveNewImage = (index) => {
    const updatedFiles = newImageFiles.filter((_, i) => i !== index);
    setNewImageFiles(updatedFiles);
    setNewImagePreviews(updatedFiles.map((f) => URL.createObjectURL(f)));
    if (updatedFiles.length === 0 && existingImages.length === 0) {
      setImagesChanged(false);
    }
  };

  // === Handlers: Model 3D ===
  const handleModelChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewModelFile(e.target.files[0]);
      setModelChanged(true);
    }
  };

  const handleRemoveModel = () => {
    setNewModelFile(null);
    setModelChanged(false);
  };

  // === Submit ===
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const promises = [];
      const labels = [];

      // Validation: variant_ref is required by DB
      if (!form.variant_ref) {
        toast.error("Lỗi: Không tìm thấy Variant Ref cho sản phẩm này.");
        setSubmitting(false);
        return;
      }

      // 1. Update product basic info (MySQL)
      promises.push(
        updateProduct(productId, {
          product_name: form.product_name,
          product_description: form.product_description,
          product_status: form.product_status,
          is_disabled: form.is_disabled,
          category_id: form.category_id,
          brand_id: form.brand_id,
          collection_id: form.collection_id,
          variant_ref: form.variant_ref,
        })
      );
      labels.push("Thông tin cơ bản");

      // 2. Update variant data (MongoDB)
      if (variantRef && variantRows.length > 0) {
        const variantsPayload = variantRows.map((row) => ({
          sku: row.sku,
          price: Number(row.price) || 0,
          stock: Number(row.stock) || 0,
          specs: {
            dimensions: parseDimensions(row.dimensions),
            weight: Number(row.weight) || 0,
            material: row.material || "",
            color: row.color || "",
          },
          status: row.status || "available",
          ...(row._id ? { _id: row._id } : {}),
        }));

        promises.push(updateVariant(variantRef, { variants: variantsPayload }));
        labels.push("Biến thể");
      }

      // 3. Update images (R2 + MongoDB) — only if changed
      if (imagesChanged && variantRef) {
        // If user removed all existing images and added new ones,
        // or modified the image set in any way
        if (newImageFiles.length > 0) {
          // Upload new files + remaining existing handled by backend (overwrite)
          promises.push(updateProductImages(variantRef, newImageFiles));
          labels.push("Hình ảnh");
        } else if (existingImages.length === 0) {
          // All images removed — we need a way to clear images
          // For now, skip if no new files (backend requires files)
          console.warn("All images removed but no new images to upload");
        }
      }

      // 4. Update model 3D (R2 + MongoDB) — only if changed
      if (modelChanged && variantRef && newModelFile) {
        promises.push(updateProductModel3d(variantRef, newModelFile));
        labels.push("Model 3D");
      }

      // Execute all in parallel
      const results = await Promise.allSettled(promises);

      // Check results
      const failed = results
        .map((r, i) => (r.status === "rejected" ? labels[i] : null))
        .filter(Boolean);

      if (failed.length > 0) {
        toast.error(`Lỗi cập nhật: ${failed.join(", ")}`);
      } else {
        toast.success("Cập nhật sản phẩm thành công!");
        onClose();
        if (onProductUpdated) onProductUpdated();
      }
    } catch (err) {
      console.error("Update product failed:", err);
      toast.error(err.message || "Có lỗi xảy ra khi cập nhật sản phẩm");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const totalImages = existingImages.length + newImageFiles.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl">Chỉnh sửa sản phẩm</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <ScrollArea className="h-[75vh] pr-4">
            <div className="space-y-6">
              {/* ========== SECTION 1: Thông tin cơ bản ========== */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Product name */}
                  <div className="col-span-2">
                    <Label className="mb-2 block">Tên sản phẩm</Label>
                    <Input
                      value={form.product_name}
                      onChange={(e) =>
                        setForm({ ...form, product_name: e.target.value })
                      }
                    />
                  </div>

                  {/* Description */}
                  <div className="col-span-2">
                    <Label className="mb-2 block">Mô tả sản phẩm</Label>
                    <Textarea
                      value={form.product_description}
                      className="resize-none h-28"
                      onChange={(e) =>
                        setForm({ ...form, product_description: e.target.value })
                      }
                    />
                  </div>

                  {/* Dropdowns */}
                  <div className="col-span-2 grid grid-cols-3 gap-4">
                    {/* Brand */}
                    <div>
                      <Label className="mb-2 block">Nhãn hàng</Label>
                      <Select
                        value={form.brand_id}
                        onValueChange={(v) => setForm({ ...form, brand_id: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn nhãn hàng" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((b) => (
                            <SelectItem key={b.brand_id} value={String(b.brand_id)}>
                              {b.brand_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Category */}
                    <div>
                      <Label className="mb-2 block">Danh mục</Label>
                      <Select
                        value={form.category_id}
                        onValueChange={(v) => setForm({ ...form, category_id: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.category_id} value={String(c.category_id)}>
                              {c.category_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Collection */}
                    <div>
                      <Label className="mb-2 block">Bộ sưu tập</Label>
                      <Select
                        value={form.collection_id}
                        onValueChange={(v) => setForm({ ...form, collection_id: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn bộ sưu tập" />
                        </SelectTrigger>
                        <SelectContent>
                          {collections.map((c) => (
                            <SelectItem key={c.collection_id} value={String(c.collection_id)}>
                              {c.collection_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Status toggle */}
                  <div className="col-span-2 flex items-center gap-6 py-2">
                    <div className="flex items-center gap-3">
                      <Label className="cursor-pointer">Trạng thái hiển thị</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Switch
                                checked={!form.is_disabled}
                                onCheckedChange={(v) =>
                                  setForm({ ...form, is_disabled: !v })
                                }
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {form.is_disabled ? "Sản phẩm đang ẩn" : "Sản phẩm đang hiển thị"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        form.is_disabled 
                          ? "bg-red-100 text-red-700" 
                          : "bg-green-100 text-green-700"
                      }`}>
                        {form.is_disabled ? "Đang ẩn" : "Đang hiển thị"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 ml-auto min-w-[300px]">
                      <Label className="text-[10px] uppercase font-bold text-slate-400">Variant Reference (MongoDB ID)</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={form.variant_ref || ""} 
                          placeholder="Nhập Variant Ref nếu thiếu"
                          className="h-9 text-xs font-mono bg-slate-50 border-dashed"
                          onChange={(e) => setForm({ ...form, variant_ref: e.target.value })}
                        />
                        <Badge variant="outline" className="h-9 px-3 whitespace-nowrap bg-indigo-50 text-indigo-600 border-indigo-100">
                          {form.variant_ref ? "Linked" : "Missing"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* ========== SECTION 2: Bảng biến thể (Editable) ========== */}
              {variantRows.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Biến thể sản phẩm ({variantRows.length})
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                      onClick={handleAddNewVariant}
                    >
                      <Plus size={14} />
                      Thêm biến thể
                    </Button>
                  </div>
                  <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-medium border-b">
                          <tr>
                            <th className="p-3 min-w-[120px]">SKU</th>
                            <th className="p-3 min-w-[120px]">Giá (VNĐ)</th>
                            <th className="p-3 min-w-[80px] text-center">Tồn kho</th>
                            <th className="p-3 min-w-[140px]">Kích thước (LxWxH)</th>
                            <th className="p-3 min-w-[80px]">Khối lượng</th>
                            <th className="p-3 min-w-[100px]">Chất liệu</th>
                            <th className="p-3 min-w-[90px]">Màu sắc</th>
                            <th className="p-3 min-w-[110px]">Trạng thái</th>
                            <th className="p-3 w-10 text-center"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {variantRows.map((v, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-2">
                                <Input
                                  value={v.sku}
                                  onChange={(e) => handleVariantCellChange(i, "sku", e.target.value)}
                                  className="h-8 text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  value={v.price}
                                  onChange={(e) => handleVariantCellChange(i, "price", e.target.value)}
                                  className="h-8 text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  value={v.stock}
                                  onChange={(e) => handleVariantCellChange(i, "stock", e.target.value)}
                                  className="h-8 text-xs text-center"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  value={v.dimensions}
                                  placeholder="LxWxH"
                                  onChange={(e) => handleVariantCellChange(i, "dimensions", e.target.value)}
                                  className="h-8 text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  value={v.weight}
                                  onChange={(e) => handleVariantCellChange(i, "weight", e.target.value)}
                                  className="h-8 text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  value={v.material}
                                  onChange={(e) => handleVariantCellChange(i, "material", e.target.value)}
                                  className="h-8 text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  value={v.color}
                                  onChange={(e) => handleVariantCellChange(i, "color", e.target.value)}
                                  className="h-8 text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <Select
                                  value={v.status}
                                  onValueChange={(val) => handleVariantCellChange(i, "status", val)}>
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="reserved">Reserved</SelectItem>
                                    <SelectItem value="out_of_stock">Out of stock</SelectItem>
                                    <SelectItem value="hidden">Hidden</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="p-2 text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                  onClick={() => handleRemoveVariant(i)}
                                  title="Xóa biến thể"
                                  type="button"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* ========== SECTION 3: Hình ảnh ========== */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                  Hình ảnh sản phẩm
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    ({totalImages}/3)
                  </span>
                </h3>

                <div className="flex gap-3 flex-wrap mb-4">
                  {/* Existing images */}
                  {existingImages.map((src, i) => (
                    <div key={`existing-${i}`} className="relative group">
                      <img
                        src={src}
                        alt={`Product image ${i + 1}`}
                        className="w-28 h-28 object-cover rounded-lg border border-slate-200 shadow-sm"
                      />
                      <button
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        onClick={() => handleRemoveExistingImage(i)}
                        type="button">
                        <X size={14} />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                        Hiện tại
                      </span>
                    </div>
                  ))}

                  {/* New image previews */}
                  {newImagePreviews.map((src, i) => (
                    <div key={`new-${i}`} className="relative group">
                      <img
                        src={src}
                        alt={`New image ${i + 1}`}
                        className="w-28 h-28 object-cover rounded-lg border-2 border-indigo-300 shadow-sm"
                      />
                      <button
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        onClick={() => handleRemoveNewImage(i)}
                        type="button">
                        <X size={14} />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-indigo-600/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                        Mới
                      </span>
                    </div>
                  ))}

                  {/* Add image button */}
                  {totalImages < 3 && (
                    <label className="w-28 h-28 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors">
                      <ImagePlus size={24} className="text-slate-400 mb-1" />
                      <span className="text-[10px] text-slate-400">Thêm ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleAddNewImages}
                      />
                    </label>
                  )}
                </div>

                {totalImages === 0 && (
                  <p className="text-xs text-slate-400 italic">Chưa có hình ảnh nào</p>
                )}
              </div>

              <Separator />

              {/* ========== SECTION 4: Model 3D ========== */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                  Model 3D
                </h3>

                {existingModel && !modelChanged ? (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
                    <FileBox size={24} className="text-indigo-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {existingModel.split("/").pop()}
                      </p>
                      <p className="text-xs text-slate-400">Model hiện tại</p>
                    </div>
                    <label className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span className="flex items-center gap-1.5">
                          <Upload size={14} />
                          Thay thế
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept=".glb"
                        className="hidden"
                        onChange={handleModelChange}
                      />
                    </label>
                  </div>
                ) : modelChanged && newModelFile ? (
                  <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <FileBox size={24} className="text-indigo-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-indigo-700 truncate">
                        {newModelFile.name}
                      </p>
                      <p className="text-xs text-indigo-400">File mới (chưa upload)</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={handleRemoveModel}>
                      <X size={16} />
                    </Button>
                  </div>
                ) : (
                  <div className="p-4">
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors">
                      <Upload size={24} className="text-slate-400 mb-2" />
                      <span className="text-sm text-slate-500">Upload file .glb</span>
                      <span className="text-[10px] text-slate-400 mt-1">Kéo thả hoặc click để chọn file</span>
                      <input
                        type="file"
                        accept=".glb"
                        className="hidden"
                        onChange={handleModelChange}
                      />
                    </label>
                  </div>
                )}
              </div>

              <Separator />

              {/* ========== Submit Button ========== */}
              <div className="pb-4">
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11"
                  onClick={handleSubmit}
                  disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
