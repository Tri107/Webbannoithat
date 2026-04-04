import CartItem from "../../components/carts/CartItem";

export default function CartList({ items, onUpdate, onUpdateColor, onRemove }) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border-slate-200 bg-white p-10 text-center text-slate-600">
        Giỏ hàng đang trống.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {items.map((item) => (
        <CartItem key={item.id} item={item} onUpdate={onUpdate} onUpdateColor={onUpdateColor} onRemove={onRemove} />
      ))}
    </div>
  );
}
