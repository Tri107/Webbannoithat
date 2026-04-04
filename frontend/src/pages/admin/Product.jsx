import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, Search, Eye } from "lucide-react";
import { useEffect, useState } from "react";

import AddProductModal from "../../components/ui/AddProductModal";
import ViewProductModal from "../../components/ui/ViewProductModal";
import EditProductModal from "../../components/ui/EditProductModal";

import { getProducts } from "../../lib/api";

export default function Product() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewProductId, setViewProductId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();

      const formatted = res.data.map((item) => {
        const variantsArr = item.variants?.variants || [];
        const totalStock = variantsArr.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
        // Lấy status của variant đầu tiên làm đại diện hoặc 'N/A'
        const status = variantsArr[0]?.status || "unknown";

        return {
          id: item.product_id,
          name: item.product_name,
          status,
          stock: totalStock,
          image: item.variants?.images?.[0], // Sử dụng ảnh đầu tiên từ variantData
        };
      });

      setProducts(formatted);
    } catch (err) {
      console.error("Load products failed", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-3xl font-bold text-slate-800">Quản lý sản phẩm</h1>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 px-6 shadow-sm transition-all"
          onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Thêm sản phẩm mới
        </Button>

        <div className="relative w-72">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            className="pl-10 bg-white border-slate-200 focus:ring-indigo-500 rounded-lg"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 font-semibold text-slate-600">ID</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Sản phẩm</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Tồn kho</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-600">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {products.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-slate-400 font-mono">#{item.id}</td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                          <Search size={16} />
                        </div>
                      )}
                      <span className="font-semibold text-slate-700">{item.name}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${item.status === "available"
                          ? "bg-green-100 text-green-700"
                          : item.status === "out_of_stock"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`text-sm font-bold ${item.stock <= 5 ? 'text-red-500' : 'text-slate-700'}`}>
                        {item.stock}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium flex items-center gap-1.5"
                        onClick={() => {
                          setViewProductId(item.id);
                          setIsViewModalOpen(true);
                        }}
                      >
                        <Eye size={16} />
                        Chi tiết
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 text-amber-600 hover:text-amber-700 hover:bg-amber-50 font-medium flex items-center gap-1.5"
                        onClick={() => {
                          setEditProductId(item.id);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Pencil size={16} />
                        Chỉnh sửa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <AddProductModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProductAdded={fetchProducts}
      />
      <ViewProductModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewProductId(null);
        }}
        productId={viewProductId}
      />
      <EditProductModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditProductId(null);
        }}
        productId={editProductId}
        onProductUpdated={fetchProducts}
      />
    </div>
  );
}
