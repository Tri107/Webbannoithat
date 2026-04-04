import { useNavigate } from "react-router-dom";
import { formatVND } from "../../lib/utils";

export default function FavoriteCard({ product, removeFavorite, addToCart }) {
  const navigate = useNavigate();

  const rating = Math.round(product.rating ?? 0);
  const reviews = product.reviews ?? 0;
  const image = product.img || "https://picsum.photos/400/300";

  return (
    <div className="rounded-xl bg-white border border-slate-200 overflow-hidden hover:shadow-md transition">
      {/* IMAGE */}
      <div className="relative">
        <div className="aspect-[4/3] bg-slate-100">
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover cursor-pointer"
            onClick={() => navigate(`/detailproduct/${product.id}`)}
          />
        </div>

        {product.tag && (
          <span className="absolute top-2 left-2 rounded bg-black/70 px-2 py-1 text-[10px] text-white">
            {product.tag}
          </span>
        )}

        <button
          onClick={() => removeFavorite(product.id)}
          className="absolute top-2 right-2 bg-white/90 rounded-full w-6 h-6 text-xs hover:bg-red-100"
        >
          ✕
        </button>
      </div>

      {/* INFO */}
      <div className="p-3">
        <p
          onClick={() => navigate(`/detailproduct/${product.id}`)}
          className="text-[12px] font-semibold text-slate-900 line-clamp-2 min-h-[32px] cursor-pointer hover:text-blue-600"
        >
          {product.name}
        </p>

        {product.description && (
          <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 min-h-[30px]">
            {product.description}
          </p>
        )}

        {/* RATING */}
        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={
                i < rating
                  ? "text-yellow-400 text-[10px]"
                  : "text-slate-300 text-[10px]"
              }
            >
              ★
            </span>
          ))}

          <span className="ml-1 text-[11px] text-slate-500">
            {Number(product.rating ?? 0).toFixed(1)} ({reviews} đánh giá)
          </span>
        </div>
      </div>
    </div>
  );
}