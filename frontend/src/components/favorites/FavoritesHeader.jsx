/* Header quản lý wishlist*/

export default function FavoritesHeader({
  count,
  sort,
  setSort,
  clearFavorites,
}) {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Sản phẩm yêu thích ({count})
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Các sản phẩm bạn đã lưu để xem hoặc mua sau.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-slate-200 text-xs px-3 py-1.5 rounded-md bg-white"
            >
              <option value="default">Mặc định</option>
              <option value="low">Giá thấp → cao</option>
              <option value="high">Giá cao → thấp</option>
            </select>

            {count > 0 && (
              <button
                onClick={clearFavorites}
                className="text-xs text-red-500 hover:underline"
              >
                Xóa tất cả
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
