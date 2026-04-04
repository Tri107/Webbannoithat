import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
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
  uploadProductImages,
  uploadProductModel3d,
  createVariant,
  createProduct,
} from "../../lib/api";

import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AddProductModal({ open, onClose, onProductAdded }) {
  const [form, setForm] = useState({
    product_name: "",
    product_description: "",
    product_status: "AVAILABLE",
    is_disabled: true,
    brand_id: "",
    category_id: "",
    collection_id: "",
  });

  const parsePrice = (val) => {
    if (!val) return 0;
    return Number(String(val).replace(/,/g, ''));
  };

  const [specFile, setSpecFile] = useState(null);
  const [model3dFile, setModel3dFile] = useState(null);
  const [images, setImages] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [specPreview, setSpecPreview] = useState([]);
  const [variantData, setVariantData] = useState(null);
  const [imagePreview, setImagePreview] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const parseDimensions = (dimStr) => {
    if (!dimStr) return { length: 0, width: 0, height: 0 };
    const parts = String(dimStr).split(/[xX* ]+/).filter(Boolean);
    return {
      length: Number(parts[0]) || 0,
      width: Number(parts[1]) || 0,
      height: Number(parts[2]) || 0
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const brandsData = await getBrands();
        const categoriesData = await getCategories();
        const collectionsData = await getCollections();

        setBrands(brandsData.data);
        setCategories(categoriesData.data);
        setCollections(collectionsData.data);

        console.log("Fetched brands:", brandsData);
        console.log("Fetched categories:", categoriesData);
        console.log("Fetched collections:", collectionsData);
      } catch (err) {
        console.error("Load data failed", err);
      }
    };

    fetchData();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length > 3) {
      alert("Chỉ được upload tối đa 3 ảnh");
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const previews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSpecFile(file);

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === "xlsx" || ext === "csv" || ext === "xls") {
      try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const rawRows = XLSX.utils.sheet_to_json(sheet);

        const rawData = rawRows.map(row => {
          const item = {};
          for (const key in row) {
            const k = key.toLowerCase().trim();
            if (k.includes('sku')) item.sku = row[key];
            else if (k.includes('price') || k.includes('giá')) item.price = row[key];
            else if (k.includes('stock') || k.includes('tồn')) item.stock = row[key];
            else if (k.includes('material') || k.includes('chất liệu')) item.material = row[key];
            else if (k.includes('color') || k.includes('màu')) item.color = row[key];
            else if (k.includes('weight') || k.includes('cân nặng') || k.includes('khối lượng')) item.weight = row[key];
            else if (k.includes('dimension') || k.includes('kích thước')) item.dimensions = row[key];
            else if (k.includes('status') || k.includes('trạng thái')) item.status = row[key];
            else if (k.includes('model 3d') || k.includes('model3d')) item.model3d = row[key];
            else if (k.includes('image') || k.includes('ảnh')) item.images = row[key];
          }
          return item;
        });

        if (rawData.length > 0) {
          const formatted = {
            model3d: rawData[0].model3d || null,
            images: rawData[0].images ? String(rawData[0].images).split(',').map(s => s.trim()) : [],
            variants: rawData.map(row => ({
              sku: String(row.sku || ""),
              price: parsePrice(row.price),
              stock: Number(row.stock) || 0,
              specs: {
                dimensions: parseDimensions(row.dimensions),
                weight: Number(row.weight) || 0,
                material: row.material || "",
                color: row.color || ""
              },
              status: row.status || "available"
            }))
          };
          setVariantData(formatted);
        }

        const filteredRows = data.filter((r) => r.length >= 2);
        setSpecPreview(filteredRows);
      } catch (err) {
        console.error("Parse file failed", err);
        toast.error("Không thể đọc file. Vui lòng kiểm tra định dạng.");
      }
    }
  };

  // Convert specPreview rows to JSON (dynamic key-value)
  const specPreviewToJson = () => {
    const specs = {};
    specPreview.forEach(([key, val]) => {
      if (key && val) specs[String(key).trim()] = String(val).trim();
    });
    return specs;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // === Bước 1: Upload images → lấy URLs ===
      let imageUrls = [];
      if (images.length > 0) {
        const uploadRes = await uploadProductImages(images);
        console.log("Upload response:", uploadRes);
        // Trích xuất URLs linh hoạt (phòng trường hợp cấu trúc data thay đổi)
        imageUrls = uploadRes.data?.urls || uploadRes.urls || (Array.isArray(uploadRes.data) ? uploadRes.data : []);
        console.log("Extracted imageUrls:", imageUrls);
      }

      // === Bước 1.5: Upload 3d model ===
      let model3dUrl = null;
      if (model3dFile) {
        const uploadModelRes = await uploadProductModel3d(model3dFile);
        console.log("Upload model response:", uploadModelRes);
        model3dUrl = uploadModelRes.data?.url || uploadModelRes.url;
      }

      // === Bước 2: Tạo Variant (MongoDB) → lấy ObjectId ===
      let variantRes;
      if (variantData) {
        // Nếu có data từ file, ưu tiên dùng variantData nhưng CẦN merge thêm ảnh đã upload và model
        const finalVariantData = {
          ...variantData,
          images: imageUrls.length > 0 ? imageUrls : (variantData.images || []),
          model3d: model3dUrl || variantData.model3d || null,
        };
        console.log("Sending finalVariantData to Mongo:", finalVariantData);
        variantRes = await createVariant(finalVariantData);
      } else {
        // Fallback cho manual hoặc legacy preview: bọc vào mảng variants để khớp schema mới
        const specs = specPreview.length > 0 ? specPreviewToJson() : {};
        const manualVariantData = {
          images: imageUrls, // Ảnh từ manual upload
          model3d: model3dUrl || null,
          variants: [
            {
              sku: `V-${Date.now()}`,
              price: 0,
              stock: 0,
              specs,
              status: "available",
            },
          ],
        };
        console.log("Sending manualVariantData to Mongo:", manualVariantData);
        variantRes = await createVariant(manualVariantData);
      }

      const variantRef = variantRes.data.variant_id;

      // === Bước 3: Tạo Product (MySQL) ===
      await createProduct({
        product_name: form.product_name,
        product_description: form.product_description,
        category_id: form.category_id,
        brand_id: form.brand_id,
        collection_id: form.collection_id,
        variant_ref: variantRef,
      });

      onClose();
      resetForm();
      toast.success("Thêm sản phẩm thành công!");
      if (onProductAdded) onProductAdded();
    } catch (err) {
      console.error("Thêm sản phẩm thất bại:", err);
      toast.error(err.message || "Có lỗi xảy ra khi thêm sản phẩm");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      product_name: "",
      product_description: "",
      product_status: "AVAILABLE",
      is_disabled: false,
      brand_id: "",
      category_id: "",
      collection_id: "",
    });

    setImages([]);
    setImagePreview([]);
    setSpecFile(null);
    setModel3dFile(null);
    setSpecPreview([]);
    setVariantData(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Thêm sản phẩm</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Product name */}
            <div className="col-span-2">
              <Label className="mb-2 block">Tên sản phẩm</Label>
              <Input
                placeholder="Tên sản phẩm"
                onChange={(e) =>
                  setForm({ ...form, product_name: e.target.value })
                }
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <Label className="mb-2 block">Mô tả sản phẩm</Label>
              <Textarea
                placeholder="Mô tả sản phẩm"
                className="resize-none h-28"
                onChange={(e) =>
                  setForm({ ...form, product_description: e.target.value })
                }
              />
            </div>

            {/* Dropdowns row */}
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
                      <SelectItem
                        key={c.category_id}
                        value={String(c.category_id)}>
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
                      <SelectItem
                        key={c.collection_id}
                        value={String(c.collection_id)}>
                        {c.collection_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>



            {/* Spec upload */}
            <div className="col-span-2">
              <Label className="mb-2 block">File đặc tả</Label>

              <Input
                type="file"
                accept=".txt,.csv,.xlsx"
                onChange={handleFileChange}
              />

              <p className="text-sm text-muted-foreground">
                Upload file specs (.csv, .txt, .xlsx)
              </p>
            </div>

            {/* Image upload */}
            <div className="col-span-2">
              <Label className="mb-2 block">Hình ảnh sản phẩm</Label>

              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />

              <p className="text-sm text-muted-foreground">
                Upload product images (.jpg, .jpeg, .png)
              </p>
            </div>

            {/* Model 3D upload */}
            <div className="col-span-2">
              <Label className="mb-2 block">File 3D Model (Không bắt buộc)</Label>

              <Input
                type="file"
                accept=".glb"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setModel3dFile(e.target.files[0]);
                  } else {
                    setModel3dFile(null);
                  }
                }}
              />

              <p className="text-sm text-muted-foreground">
                Upload file Model 3D định dạng .glb để hiển thị trên web
              </p>
            </div>

            {/* Image preview */}
            {imagePreview.length > 0 && (
              <div className="col-span-2 flex gap-3 flex-wrap">
                {imagePreview.map((src, i) => (
                  <div key={i} className="relative">
                    <img
                      src={src}
                      className="w-24 h-24 object-cover rounded border"
                    />

                    <button
                      className="absolute top-0 right-0 bg-black text-white text-xs px-1"
                      onClick={() => {
                        const newImages = images.filter((_, idx) => idx !== i);
                        const newPreview = imagePreview.filter(
                          (_, idx) => idx !== i,
                        );

                        setImages(newImages);
                        setImagePreview(newPreview);
                      }}>
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Status row */}
            <div className="col-span-2 flex items-center gap-6 py-2">
              <div className="flex items-center gap-3">
                <Label className="cursor-pointer">Trạng thái hiển thị</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Switch
                          checked={form.is_disabled}
                          onCheckedChange={(v) =>
                            setForm({ ...form, is_disabled: v })
                          }
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {form.is_disabled ? "Product active" : "Product disabled"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Spec preview - Table representation */}
            {variantData && variantData.variants.length > 0 && (
              <div className="col-span-2 border rounded-lg p-0 overflow-hidden bg-white shadow-sm">
                <div className="flex justify-between items-center p-3 bg-slate-50 border-b">
                  <p className="font-semibold text-slate-700">Dữ liệu biến thể ({variantData.variants.length})</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setSpecFile(null);
                      setSpecPreview([]);
                      setVariantData(null);
                    }}>
                    Hủy bỏ
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-medium border-b">
                      <tr>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Giá (VNĐ)</th>
                        <th className="p-3 text-center">Tồn kho</th>
                        <th className="p-3">Kích thước</th>
                        <th className="p-3">khối lượng </th>
                        <th className="p-3">Chất liệu / Màu</th>
                        <th className="p-3">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {variantData.variants.map((v, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-medium text-slate-900">{v.sku}</td>
                          <td className="p-3 text-orange-600 font-bold whitespace-nowrap text-center">{v.price?.toLocaleString()}</td>
                          <td className="p-3 text-center">{v.stock}</td>
                          <td className="p-3 text-slate-500 whitespace-nowrap">
                            {v.specs.dimensions.length} x {v.specs.dimensions.width} x {v.specs.dimensions.height}
                          </td>
                          <td className="p-3 text-slate-500">{v.specs.weight} kg</td>
                          <td className="p-3 text-slate-500">
                            {v.specs.material} / {v.specs.color}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap ${v.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                              }`}>
                              {v.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Legacy preview fallback */}
            {!variantData && specPreview.length > 0 && (
              <div className="col-span-2 border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">Xem trước File</p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSpecFile(null);
                      setSpecPreview([]);
                    }}>
                    Clear
                  </Button>
                </div>
                <table className="w-full text-sm border">
                  <tbody>
                    {specPreview.map((row, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2 font-medium">{row[0]}</td>
                        <td className="p-2 whitespace-pre-wrap">{row[1]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Submit */}
            <div className="col-span-2">
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Lưu sản phẩm"
                )}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
