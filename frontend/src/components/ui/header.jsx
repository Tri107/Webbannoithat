import { useMemo, useRef, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, X } from "lucide-react";
import { getCategories, getCollections, getProducts } from "@/lib/api";
import { useCart } from "@/hooks/useCart";

function formatVND(v) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v || 0);
}

function getProductImage(product) {
  return (
    product?.variants?.images?.[0] ||
    "https://via.placeholder.com/400x300?text=No+Image"
  );
}

function getProductPrice(product) {
  return (
    Number(product?.variants?.variants?.[0]?.price) ||
    Number(product?.variants?.price) ||
    0
  );
}

function getProductSoldCount(product) {
  return (
    Number(product?.sold) ||
    Number(product?.sold_count) ||
    Number(product?.total_sold) ||
    Number(product?.purchase_count) ||
    Number(product?.order_count) ||
    Number(product?.quantity_sold) ||
    0
  );
}

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);

  const [headerLoading, setHeaderLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setIsLoggedIn(true);
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing user data", err);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        setHeaderLoading(true);

        const [categoriesRes, collectionsRes, productsRes] = await Promise.all([
          getCategories(),
          getCollections(),
          getProducts(),
        ]);

        setCategories(categoriesRes?.data || []);
        setCollections(collectionsRes?.data || []);
        setProducts(productsRes?.data || []);
      } catch (error) {
        console.error("Lỗi load dữ liệu header:", error);
      } finally {
        setHeaderLoading(false);
      }
    };

    fetchHeaderData();
  }, []);

  const { cartItems: rawCartItems } = useCart();

  const cartItems = useMemo(() => {
    return (rawCartItems || []).map((it) => {
      let snapshot = {};
      try {
        snapshot =
          typeof it.snapshot === "string"
            ? JSON.parse(it.snapshot || "{}")
            : it.snapshot || {};
      } catch (e) {
        console.error("Error parsing snapshot", e);
      }

      const imageArray = it.variants?.images;
      const img =
        Array.isArray(imageArray) && imageArray.length > 0
          ? imageArray[0]
          : typeof imageArray === "string"
          ? imageArray
          : "https://via.placeholder.com/400x300?text=No+Image";

      return {
        cartItemId: it.cart_item_id,
        id: it.product_id,
        name: it.product_name,
        price: snapshot.price || 0,
        sku: it.sku || "N/A",
        qty: it.quantity,
        img: img,
      };
    });
  }, [rawCartItems]);

  const cartCount = cartItems.reduce((s, it) => s + it.qty, 0);
  const cartTotal = cartItems.reduce((s, it) => s + it.price * it.qty, 0);

  const productByCategory = useMemo(() => {
    const grouped = {};

    products.forEach((p) => {
      const categoryName = p.category_name || "Khác";
      if (!grouped[categoryName]) grouped[categoryName] = [];
      grouped[categoryName].push(p);
    });

    return grouped;
  }, [products]);

  const productByCollection = useMemo(() => {
    const grouped = {};

    products.forEach((p) => {
      const collectionName = p.collection_name || "Khác";
      if (!grouped[collectionName]) grouped[collectionName] = [];
      grouped[collectionName].push(p);
    });

    return grouped;
  }, [products]);

  const [activeType, setActiveType] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [openMega, setOpenMega] = useState(false);
  const megaCloseTimer = useRef(null);

  const showMega = (type, key) => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
    setActiveType(type);
    setActiveKey(key);
    setOpenMega(true);
    setOpenRight(null);
    setSearchOpen(false);
  };

  const showCollectionMega = () => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
    setActiveType("collection");
    setActiveKey((prev) => {
      if (prev && productByCollection[prev]) return prev;
      return collections[0]?.collection_name || null;
    });
    setOpenMega(true);
    setOpenRight(null);
    setSearchOpen(false);
  };

  const scheduleCloseMega = () => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
    megaCloseTimer.current = setTimeout(() => {
      setOpenMega(false);
      setActiveType(null);
      setActiveKey(null);
    }, 140);
  };

  const cancelCloseMega = () => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
  };

  const closeMega = () => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current);
    setOpenMega(false);
    setActiveType(null);
    setActiveKey(null);
  };

  const goToCategoryProducts = (categoryName) => {
    closeMega();
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  const goToCollectionProducts = (collectionName) => {
    closeMega();
    navigate(`/products?collection=${encodeURIComponent(collectionName)}`);
  };

  const goToActiveMegaProducts = () => {
    if (activeType === "category" && activeKey) {
      navigate(`/products?category=${encodeURIComponent(activeKey)}`);
    } else if (activeType === "collection" && activeKey) {
      navigate(`/products?collection=${encodeURIComponent(activeKey)}`);
    } else {
      navigate("/products");
    }
    closeMega();
  };

  const activeCategoryProducts =
    activeType === "category" ? productByCategory[activeKey] || [] : [];

  const activeCollectionProducts =
    activeType === "collection" ? productByCollection[activeKey] || [] : [];

  const megaProducts = useMemo(() => {
    const list =
      activeType === "category" ? activeCategoryProducts : activeCollectionProducts;

    return [...list].sort(
      (a, b) => getProductSoldCount(b) - getProductSoldCount(a)
    );
  }, [activeType, activeCategoryProducts, activeCollectionProducts]);

  const rightWrapRef = useRef(null);
  const [openRight, setOpenRight] = useState(null);

  const toggleRight = (k) => {
    closeMega();
    setSearchOpen(false);
    setOpenRight((prev) => (prev === k ? null : k));
  };

  const closeRight = () => setOpenRight(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef(null);

  const openSearch = () => {
    closeMega();
    setOpenRight(null);
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };

  useEffect(() => {
    const onDoc = (e) => {
      if (!rightWrapRef.current) return;
      if (!rightWrapRef.current.contains(e.target)) {
        setOpenRight(null);
        if (searchOpen) closeSearch();
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [searchOpen]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();

    return products
      .filter((p) => (p.product_name || "").toLowerCase().includes(q))
      .slice(0, 6)
      .map((p) => ({
        id: p.product_id,
        name: p.product_name,
        price: getProductPrice(p),
        href: `/detailproduct/${p.product_id}`,
        img: getProductImage(p),
      }));
  }, [query, products]);

  useEffect(() => {
    closeMega();
    closeRight();
    if (searchOpen) closeSearch();
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        closeMega();
        closeRight();
        if (searchOpen) closeSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  const onSubmitSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
  };

  return (
    <header className="w-full bg-[#0B1E3A] text-white shadow-sm sticky top-0 z-[80]">
      <div className="mx-auto max-w-7xl px-3 lg:px-10 h-20 flex items-center">
        <Link to="/" className="font-bold text-2xl !text-orange-500 tracking-wide">
          B2VT
        </Link>

        <nav className="hidden md:flex flex-1 justify-center gap-10 text-base font-medium">
          <Link to="/products" className="hover:text-orange-400 transition">
            Sản Phẩm
          </Link>

          {!headerLoading &&
            categories.map((category) => (
              <button
                key={category.category_id}
                type="button"
                onMouseEnter={() => showMega("category", category.category_name)}
                onMouseLeave={scheduleCloseMega}
                className={[
                  "relative hover:text-orange-400 transition",
                  activeType === "category" &&
                  activeKey === category.category_name &&
                  openMega
                    ? "text-orange-400"
                    : "",
                ].join(" ")}
              >
                {category.category_name}
                <span
                  className={[
                    "absolute -bottom-2 left-0 h-[2px] w-full bg-orange-500 transition-opacity",
                    activeType === "category" &&
                    activeKey === category.category_name &&
                    openMega
                      ? "opacity-100"
                      : "opacity-0",
                  ].join(" ")}
                />
              </button>
            ))}

          <button
            type="button"
            onMouseEnter={showCollectionMega}
            onMouseLeave={scheduleCloseMega}
            className={[
              "relative hover:text-orange-400 transition",
              activeType === "collection" && openMega ? "text-orange-400" : "",
            ].join(" ")}
          >
            Bộ Sưu Tập
            <span
              className={[
                "absolute -bottom-2 left-0 h-[2px] w-full bg-orange-500 transition-opacity",
                activeType === "collection" && openMega ? "opacity-100" : "opacity-0",
              ].join(" ")}
            />
          </button>
        </nav>

        <div ref={rightWrapRef} className="ml-auto flex items-center gap-3 relative">
          <form
            onSubmit={onSubmitSearch}
            className={[
              "flex items-center gap-2 rounded-full bg-white/10 border border-white/15",
              "transition-all duration-200 ease-out overflow-hidden",
              searchOpen ? "w-[240px] px-2.5 py-1.5" : "w-9 px-1.5 py-1.5",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={() => {
                if (!searchOpen) openSearch();
                else searchInputRef.current?.focus();
              }}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition"
              aria-label="Search"
            >
              <Search className="h-[18px] w-[18px] text-white/90" />
            </button>

            <input
              ref={searchInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập từ khóa cần tìm..."
              className={[
                "bg-transparent text-sm outline-none placeholder:text-white/60",
                "transition-opacity duration-150",
                searchOpen ? "opacity-100 w-full" : "opacity-0 w-0 pointer-events-none",
              ].join(" ")}
            />

            {searchOpen && (
              <button
                type="button"
                onClick={closeSearch}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-white/80" />
              </button>
            )}
          </form>

          {searchOpen && query.trim() && (
            <div className="absolute right-0 top-[56px] z-[90] w-[360px] rounded-2xl border border-white/10 bg-[#06162d]/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden">
              <div className="p-2">
                {searchResults.length === 0 ? (
                  <p className="p-3 text-sm text-white/70">
                    Không tìm thấy sản phẩm phù hợp.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((r) => (
                      <Link
                        key={r.id}
                        to={r.href}
                        onClick={() => {
                          closeSearch();
                          closeRight();
                        }}
                        className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/5 transition"
                      >
                        <img
                          src={r.img}
                          alt={r.name}
                          className="h-10 w-10 rounded-lg object-cover border border-white/10"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate">
                            {r.name}
                          </p>
                          <p className="text-xs text-white/70">{formatVND(r.price)}</p>
                        </div>
                        <span className="text-white/50 text-sm">→</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => toggleRight("cart")}
            className={[
              "relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:text-orange-400 transition",
              openRight === "cart" ? "text-orange-400 border-orange-400/30" : "text-white",
            ].join(" ")}
            aria-label="Cart"
          >
            <ShoppingCart className="h-[19px] w-[19px]" />
            <span className="absolute -top-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-orange-500 text-[10px] font-semibold text-white">
              {cartCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => toggleRight("account")}
            className={[
              "flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:text-orange-400 transition",
              openRight === "account" ? "text-orange-400 border-orange-400/30" : "text-white",
            ].join(" ")}
            aria-label="Account"
          >
            <User className="h-[19px] w-[19px]" />
          </button>

          {openRight && (
            <div className="absolute right-0 top-[56px] z-[90]">
              {openRight === "cart" && (
                <div className="w-[380px] rounded-2xl border border-white/10 bg-[#06162d]/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div>
                      <p className="text-sm font-semibold">Giỏ hàng</p>
                      <p className="text-xs text-white/60">{cartCount} món</p>
                    </div>
                    <button
                      type="button"
                      onClick={closeRight}
                      className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition"
                      aria-label="Close"
                    >
                      <X className="h-[18px] w-[18px] text-white/70" />
                    </button>
                  </div>

                  <div className="max-h-[320px] overflow-auto p-3 space-y-2">
                    {cartItems.map((it) => (
                      <Link to={`/detailproduct/${it.id}`} onClick={closeRight} key={it.id}>
                        <div className="flex items-center gap-3 rounded-xl p-2 bg-white/5 border border-white/10">
                          <img
                            src={it.img}
                            alt={it.name}
                            className="h-14 w-14 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white truncate">
                              {it.name}
                            </p>
                            <p className="text-[10px] text-white/50 truncate">
                              {it.sku}
                            </p>
                            <p className="text-xs text-white/70 mt-0.5">
                              {formatVND(it.price)} • SL:{" "}
                              <span className="text-white">{it.qty}</span>
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-white">
                            {formatVND(it.price * it.qty)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="p-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Tạm tính</span>
                      <span className="font-semibold text-white">
                        {formatVND(cartTotal)}
                      </span>
                    </div>

                    <div className="mt-4">
                      {cartItems.length === 0 ? (
                        <Link
                          to="/products"
                          onClick={closeRight}
                          className="flex items-center justify-center w-full rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-400 transition"
                        >
                          Tiếp tục mua sắm
                        </Link>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            to="/cart"
                            onClick={closeRight}
                            className="text-center rounded-xl border border-white/15 bg-white/5 py-2.5 text-sm font-semibold hover:bg-white/10 transition"
                          >
                            Xem giỏ hàng
                          </Link>
                          <Link
                            to="/checkout"
                            onClick={closeRight}
                            className="text-center rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-400 transition"
                          >
                            Thanh toán
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {openRight === "account" && (
                <div className="w-[300px] relative rounded-2xl border border-white/10 bg-[#06162d]/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden">
                  <button
                    type="button"
                    onClick={closeRight}
                    className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition"
                    aria-label="Close"
                  >
                    <X className="h-[18px] w-[18px] text-white/70" />
                  </button>

                  {!isLoggedIn ? (
                    <div className="p-3 space-y-2">
                      <Link
                        to="/login"
                        onClick={closeRight}
                        className="block rounded-xl bg-orange-500 text-center py-2 text-sm font-semibold text-white hover:bg-orange-400 transition"
                      >
                        Đăng nhập
                      </Link>
                      <Link
                        to="/register"
                        onClick={closeRight}
                        className="block rounded-xl border border-white/15 bg-white/5 text-center py-2 text-sm font-semibold hover:bg-white/10 transition"
                      >
                        Đăng ký
                      </Link>
                    </div>
                  ) : (
                    <div className="p-3 space-y-1">
                      <div className="px-3 py-2 mb-2 border-b border-white/5 pr-10">
                        <p className="text-xs text-white/50 uppercase tracking-wider">
                          Tài khoản
                        </p>
                        <p
                          className="text-sm font-medium text-white truncate"
                          title={user?.email}
                        >
                          {user?.email || "Người dùng"}
                        </p>
                      </div>
                      <Link
                        to="/userprofile"
                        onClick={closeRight}
                        className="block rounded-xl px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition"
                      >
                        Thông tin cá nhân
                      </Link>
                      <Link
                        to="/history"
                        onClick={closeRight}
                        className="block rounded-xl px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition"
                      >
                        Lịch sử đơn hàng
                      </Link>
                      <Link
                        to="/favorites"
                        onClick={closeRight}
                        className="block rounded-xl px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition"
                      >
                        Yêu thích
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem("accessToken");
                          localStorage.removeItem("user");
                          setIsLoggedIn(false);
                          setUser(null);
                          closeRight();
                        }}
                        className="w-full text-left rounded-xl px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className={[
          "fixed inset-x-0 top-20 bottom-0 z-[50] transition-opacity duration-200",
          openMega ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onMouseEnter={cancelCloseMega}
        onMouseLeave={scheduleCloseMega}
        onClick={closeMega}
      >
        <div className="absolute inset-0 bg-black/25" />
      </div>

      <div
        className={[
          "fixed left-0 top-20 w-full z-[55]",
          "transition-all duration-200 ease-out",
          openMega
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none",
        ].join(" ")}
        onMouseEnter={cancelCloseMega}
        onMouseLeave={scheduleCloseMega}
      >
        <div className="bg-[#06162d]/92 backdrop-blur-xl border-t border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="mx-auto max-w-7xl px-3 lg:px-10 py-8">
            {!activeKey ? null : (
              <div className="grid grid-cols-12 gap-10">
                <div className="col-span-12 lg:col-span-3">
                  <p className="text-xs tracking-[0.28em] text-white/60 uppercase">
                    {activeType === "category" ? "DANH MỤC" : "COLLECTION"}
                  </p>

                  <h3 className="mt-3 text-2xl font-bold">{activeKey}</h3>

                  <p className="mt-2 text-sm text-white/70 leading-6">
                    {activeType === "category"
                      ? `Khám phá các sản phẩm thuộc danh mục ${activeKey}.`
                      : `Khám phá các sản phẩm thuộc collection ${activeKey}.`}
                  </p>

                  <button
                    type="button"
                    onClick={goToActiveMegaProducts}
                    className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-orange-400 hover:text-orange-300 transition"
                  >
                    Xem tất cả <span className="translate-y-[1px]">→</span>
                  </button>

                  <div className="mt-6 h-px bg-white/10" />

                  {activeType === "collection" && (
                    <div className="mt-6 space-y-2">
                      {collections.map((collection) => (
                        <button
                          key={collection.collection_id}
                          type="button"
                          onMouseEnter={() => setActiveKey(collection.collection_name)}
                          onClick={() =>
                            goToCollectionProducts(collection.collection_name)
                          }
                          className={[
                            "w-full text-left rounded-lg px-3 py-2 text-sm transition",
                            activeKey === collection.collection_name
                              ? "bg-white/10 text-orange-400"
                              : "text-white/75 hover:text-white hover:bg-white/5",
                          ].join(" ")}
                        >
                          {collection.collection_name}
                        </button>
                      ))}
                    </div>
                  )}

                  {activeType === "category" && (
                    <div className="mt-6 space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category.category_id}
                          type="button"
                          onMouseEnter={() => setActiveKey(category.category_name)}
                          onClick={() =>
                            goToCategoryProducts(category.category_name)
                          }
                          className={[
                            "w-full text-left rounded-lg px-3 py-2 text-sm transition",
                            activeKey === category.category_name
                              ? "bg-white/10 text-orange-400"
                              : "text-white/75 hover:text-white hover:bg-white/5",
                          ].join(" ")}
                        >
                          {category.category_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="col-span-12 lg:col-span-6">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    {megaProducts.slice(0, 6).map((product) => (
                      <Link
                        key={product.product_id}
                        to={`/detailproduct/${product.product_id}`}
                        onClick={closeMega}
                        className="group flex items-center gap-3 rounded-xl p-3 bg-white/5 hover:bg-white/10 transition border border-white/10"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate">
                            {product.product_name}
                          </p>
                        </div>
                        <span className="opacity-0 group-hover:opacity-100 transition text-white/60">
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-3">
                  <p className="text-sm font-semibold text-white mb-3">
                    Gợi ý nổi bật
                  </p>

                  <div className="space-y-4">
                    {megaProducts.slice(0, 2).map((product) => (
                      <Link
                        key={product.product_id}
                        to={`/detailproduct/${product.product_id}`}
                        onClick={closeMega}
                        className="group block rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition"
                      >
                        <div className="relative h-28">
                          <img
                            src={getProductImage(product)}
                            alt={product.product_name}
                            className="absolute inset-0 h-full w-full object-cover opacity-90 group-hover:opacity-100 transition"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-semibold text-white">
                            {product.product_name}
                          </p>
                          <p className="text-xs text-white/70 mt-1">
                            {formatVND(getProductPrice(product))}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-white/10" />
        </div>
      </div>
    </header>
  );
}