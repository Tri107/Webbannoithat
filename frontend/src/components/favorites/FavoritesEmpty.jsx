/* UI khi chưa có sản phẩm */

export default function FavoritesEmpty() {
  return (
    <div className="text-center py-24">

      <div className="text-5xl mb-4">
        ❤️
      </div>

      <p className="text-slate-500 mb-5">
        Bạn chưa có sản phẩm yêu thích
      </p>

      <button
        onClick={() => window.location.href = "/products"}
        className="bg-slate-900 text-white px-5 py-2 rounded-md text-sm hover:bg-slate-800">
        Khám phá sản phẩm
      </button>

    </div>
  );
}