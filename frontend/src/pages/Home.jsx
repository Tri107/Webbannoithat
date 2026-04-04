import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { getProducts, getReviews } from "@/lib/api";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import { useCart } from "@/hooks/useCart";
import { useCartActions } from "@/hooks/useCartActions";

const defaultCategoryImages = {
  Bàn: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=1200&q=80&auto=format&fit=crop",
  Ghế: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80&auto=format&fit=crop",
  Tủ: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1200&q=80&auto=format&fit=crop",
};

export default function Home() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState("best");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");

  const { refetch } = useCart();
  const { handleAddToCart } = useCartActions(refetch);

  const addToCart = (product) => {
    handleAddToCart(product.id, "FAST-BUY-SKU", product.price, "Mặc định");
  };

  const heroImages = useMemo(
    () => [
      "https://www.lanha.vn/wp-content/uploads/2024/06/thiet-ke-noi-that-nha-pho-117.jpg.webp",
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=1600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1600&q=80&auto=format&fit=crop",
    ],
    []
  );

  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(t);
  }, [heroImages.length]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoadingProducts(true);
        setProductError("");

        const [productRes, reviewRes] = await Promise.all([
          getProducts(),
          getReviews(),
        ]);

        const rawProducts = productRes?.data || [];
        const rawReviews = reviewRes?.data || [];

        const reviewMap = rawReviews.reduce((acc, review) => {
          const productId = review.product_id;

          if (!acc[productId]) {
            acc[productId] = {
              totalRating: 0,
              totalReviews: 0,
            };
          }

          acc[productId].totalRating += Number(review.rating) || 0;
          acc[productId].totalReviews += 1;

          return acc;
        }, {});

        const mappedProducts = rawProducts.map((item, index) => {
          const reviewData = reviewMap[item.product_id] || {
            totalRating: 0,
            totalReviews: 0,
          };

          const avgRating =
            reviewData.totalReviews > 0
              ? reviewData.totalRating / reviewData.totalReviews
              : 0;

          return {
            id: item.product_id,
            name: item.product_name,
            description: item.product_description || "",
            price:
              Number(item?.variants?.variants?.[0]?.price) ||
              Number(item?.variants?.price) ||
              0,
            oldPrice: null,
            tag: index % 3 === 0 ? "Mới" : index % 3 === 1 ? "Hot" : null,
            type: index % 2 === 0 ? "best" : "new",
            rating: avgRating,
            reviews: reviewData.totalReviews,
            img:
              item?.variants?.images?.[0] ||
              "https://via.placeholder.com/600x400?text=No+Image",
            categoryName: item.category_name || "",
          };
        });

        setProducts(mappedProducts);

        const categoryCountMap = {};
        rawProducts.forEach((item) => {
          const name = item.category_name;
          if (!name) return;
          categoryCountMap[name] = (categoryCountMap[name] || 0) + 1;
        });

        const mappedCategories = Object.keys(categoryCountMap).map((name) => ({
          id: name,
          name,
          count: `${categoryCountMap[name]}+ sản phẩm`,
          img:
            defaultCategoryImages[name] ||
            "https://via.placeholder.com/600x800?text=Category",
        }));

        setCategories(mappedCategories);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu homepage:", error);
        setProductError(error.message || "Không thể tải dữ liệu");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchHomeData();
  }, []);

  const filtered = useMemo(() => {
    if (tab === "best") return products.filter((p) => p.type === "best").slice(0, 8);
    return products.filter((p) => p.type === "new").slice(0, 10);
  }, [tab, products]);

  const goToProducts = () => {
    navigate("/products");
  };

  const goToCollections = () => {
    navigate("/products");
  };

  const goToCategoryProducts = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="w-full bg-[#0B1E3A]">
          <div className="relative w-full h-[360px] md:h-[420px] overflow-hidden">
            {heroImages.map((img, index) => (
              <div
                key={index}
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-300 ${
                  index === heroIndex ? "opacity-100" : "opacity-0"
                }`}
                style={{ backgroundImage: `url(${img})` }}
              />
            ))}

            <div className="absolute inset-0 bg-black/55" />

            <div className="absolute inset-0">
              <div className="mx-auto max-w-7xl px-4 h-full flex items-center">
                <div className="max-w-xl text-white">
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                    Nâng tầm không <br /> gian sống của bạn
                  </h1>

                  <p className="mt-4 text-sm md:text-base text-white/80 leading-6">
                    Khám phá các thiết kế nội thất hiện đại, tinh tế và tiện dụng,
                    dành riêng cho ngôi nhà của bạn.
                  </p>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={goToProducts}
                      className="bg-white text-slate-900 px-4 py-2 text-sm font-semibold rounded-md hover:bg-white/90"
                    >
                      Mua Ngay →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* <section className="py-16 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Danh Mục Sản Phẩm
                </h2>
                <p className="mt-1 text-xs text-slate-500 max-w-xl">
                  Khám phá các danh mục sản phẩm được yêu thích nhất của chúng tôi,
                  từ nội thất cơ bản đến những món đồ trang trí tinh tế.
                </p>
              </div>

              <button
                onClick={goToProducts}
                className="text-xs font-medium text-orange-500 hover:text-orange-600"
              >
                Xem tất cả danh mục →
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-5">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => goToCategoryProducts(c.name)}
                  className="relative overflow-hidden rounded-lg text-left"
                >
                  <div className="aspect-[3/4] bg-slate-100">
                    <img
                      src={c.img}
                      alt={c.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="absolute inset-0 bg-black/25" />
                  <div className="absolute bottom-3 left-3">
                    <p className="text-white text-sm font-semibold leading-none">
                      {c.name}
                    </p>
                    <p className="mt-1 text-[10px] text-white/80">{c.count}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section> */}

        <section className="bg-slate-50 mt-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="bg-yellow-50 border border-slate-100 rounded-xl shadow-lg grid md:grid-cols-2 items-center overflow-hidden">
              <div className="p-10">
                <p className="text-xs font-semibold text-orange-500 tracking-wide">
                  NEW COLLECTION
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  Bộ sưu tập nội thất mới
                </h2>

                <p className="mt-3 text-sm text-slate-500 max-w-md">
                  Khám phá những thiết kế mới nhất dành riêng cho không gian sống hiện đại.
                </p>

                <button
                  onClick={goToCollections}
                  className="mt-6 bg-orange-500 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-orange-600"
                >
                  Khám phá ngay
                </button>
              </div>

              <div className="h-full">
                <img
                  src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1600&q=80&auto=format&fit=crop"
                  alt="New collection"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-900">
                Sản Phẩm Nổi Bật
              </h2>

              <div className="mt-3 flex justify-center">
                <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
                  <button
                    onClick={() => setTab("best")}
                    className={
                      tab === "best"
                        ? "px-4 py-2 text-xs rounded-full bg-slate-900 text-white"
                        : "px-4 py-2 text-xs rounded-full text-slate-500 hover:text-slate-900"
                    }
                  >
                    Bán chạy
                  </button>
                  <button
                    onClick={() => setTab("new")}
                    className={
                      tab === "new"
                        ? "px-4 py-2 text-xs rounded-full bg-slate-900 text-white"
                        : "px-4 py-2 text-xs rounded-full text-slate-500 hover:text-slate-900"
                    }
                  >
                    Mới về
                  </button>
                </div>
              </div>
            </div>

            {loadingProducts ? (
              <div className="mt-8 text-center text-slate-500">
                Đang tải sản phẩm...
              </div>
            ) : productError ? (
              <div className="mt-8 text-center text-red-500">{productError}</div>
            ) : (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                {filtered.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl bg-white border border-slate-200 overflow-hidden hover:shadow-md transition"
                  >
                    <div className="relative">
                      <FavoriteButton productId={p.id} />
                      <Link to={`/detailproduct/${p.id}`} className="block">
                        <div className="aspect-[4/3] bg-slate-100">
                          <img
                            src={p.img}
                            alt={p.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {p.tag && (
                          <span className="absolute top-2 left-2 rounded bg-black/70 px-2 py-1 text-[10px] text-white">
                            {p.tag}
                          </span>
                        )}
                      </Link>
                    </div>

                    <div className="p-3">
                      <Link to={`/detailproduct/${p.id}`} className="block hover:underline">
                        <p className="text-[12px] font-semibold text-slate-900 line-clamp-2 min-h-[32px]">
                          {p.name}
                        </p>
                      </Link>

                      <p className="mt-2 text-[11px] text-slate-500 line-clamp-2 min-h-[34px]">
                        {p.description || "Chưa có mô tả sản phẩm"}
                      </p>

                      <div className="mt-2 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < Math.round(p.rating ?? 0)
                                ? "text-yellow-400 text-[10px]"
                                : "text-slate-300 text-[10px]"
                            }
                          >
                            ★
                          </span>
                        ))}
                        <span className="ml-1 text-[11px] text-slate-500">
                          {Number(p.rating ?? 0).toFixed(1)} ({p.reviews ?? 0} đánh giá)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-10 flex justify-center">
              <button
                onClick={goToProducts}
                className="border border-slate-300 bg-white px-6 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 rounded-md"
              >
                XEM TẤT CẢ SẢN PHẨM
              </button>
            </div>
          </div>
        </section>

        <section className="pb-20 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-semibold text-slate-900">
                Vì Sao Chọn Chúng Tôi
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Trải nghiệm mua sắm nội thất nhanh chóng, an tâm và tiện lợi.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: "🚚", title: "Giao hàng nhanh", desc: "Toàn quốc trong 3-5 ngày" },
                { icon: "💳", title: "Thanh toán an toàn", desc: "Nhiều phương thức tiện lợi" },
                { icon: "⭐", title: "Chất lượng cao", desc: "Kiểm định kỹ lưỡng trước khi giao" },
                { icon: "🔄", title: "Đổi trả dễ dàng", desc: "Hỗ trợ đổi trả trong 7 ngày" },
              ].map((f, i) => (
                <div
                  key={i}
                  className="bg-grey-50 shadow-mdborder border-slate-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition "
                >
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h3 className="font-semibold text-slate-900">{f.title}</h3>
                  <p className="text-sm text-slate-500 mt-2">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function formatVND(v) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v || 0);
}