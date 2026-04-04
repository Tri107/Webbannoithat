import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function CartItem({ item, onUpdate, onUpdateColor, onRemove }) {
  const [selectedColor, setSelectedColor] = useState(item.color);
  const [isUpdatingColor, setIsUpdatingColor] = useState(false);

  // Tính giá dựa trên màu đã chọn
  const selectedVariant = item.variants?.find(v => v.specs?.color === selectedColor);
  const currentPrice = selectedVariant ? selectedVariant.price : item.price;
  const totalPrice = currentPrice * item.qty;

  const handleColorSelect = async (colorName) => {
    setSelectedColor(colorName);
    setIsUpdatingColor(true);

    try {
      await onUpdateColor(item.cart_item_id, colorName);
    } finally {
      setIsUpdatingColor(false);
    }
  };

  return (
    <div className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="p-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="aspect-[4/3] overflow-hidden rounded-sm bg-slate-100">
              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
            </div>
          </div>

          <div className="md:col-span-8">
            <div>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">{item.name}</h2>
                <button
                  onClick={() => onRemove(item.cart_item_id)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                  aria-label="Xóa sản phẩm"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-3 space-y-2 text-base text-slate-600">
                <p>
                  Màu sắc : <span className="text-slate-800">{item.color}</span>
                </p>

                <div>
                  <p className="text-sm font-medium text-slate-700">Chọn màu:</p>
                  <div className="flex items-center gap-2 mt-1">
                    {item.availableColors?.map((colorName) => {
                      const isSelected = colorName === selectedColor;
                      return (
                        <button
                          key={colorName}
                          type="button"
                          className={`w-8 h-8 rounded-full border ${isSelected ? 'border-red-500 ring-2 ring-offset-2 ring-red-300 scale-110' : 'border-gray-300'} transition-all duration-200 transform ${isUpdatingColor ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110'}`}
                          style={{
                            backgroundColor:
                              colorName === 'Trắng' ? '#FFFFFF' :
                              colorName === 'Nâu' ? '#8B4513' :
                              colorName === 'Nâu đậm' ? '#C69B7B' :
                              colorName === 'Đen' ? '#2A2A2A' :
                              colorName === 'Đen nhám' ? '#2A2A2A' :
                              colorName === 'Gỗ sồi' ? '#E5E4E0' :
                              colorName === 'Xám' ? '#808080' :
                              colorName === 'Xanh Navy' ? '#000080' :
                              colorName === 'Nâu da bò' ? '#A52A2A' :
                              colorName === 'Vân gỗ sáng' ? '#DEB887' : '#CCCCCC',
                          }}
                          onClick={() => handleColorSelect(colorName)}
                          disabled={isUpdatingColor}
                          title={colorName}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-[5px]">
                <button
                  onClick={() => onUpdate(item.cart_item_id, item.qty - 1)}
                  className="h-11 w-11 rounded-full border border-slate-300 bg-white flex items-center justify-center hover:bg-slate-50"
                  aria-label="Giảm số lượng"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span className="w-7 text-center text-base font-semibold text-slate-900">{item.qty}</span>

                <button
                  onClick={() => onUpdate(item.cart_item_id, item.qty + 1)}
                  className="h-11 w-11 rounded-full border border-slate-300 bg-white flex items-center justify-center hover:bg-slate-50"
                  aria-label="Tăng số lượng"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <p className="flex h-11 items-center text-[22px] font-normal text-red-600">
                {totalPrice.toLocaleString('vi-VN')}₫
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 h-px w-full bg-slate-200" />

        <div className="mt-3">
          <p className="text-sm md:text-[15px] text-slate-700">{item.deliveryText}</p>
        </div>
      </div>
    </div>
  );
}
