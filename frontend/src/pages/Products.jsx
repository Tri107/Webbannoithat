import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { getProducts, getReviews } from "@/lib/api";
import { useCart } from "@/hooks/useCart";
import { useCartActions } from "@/hooks/useCartActions";

export default function Products() {
  const [searchParams] = useSearchParams();

  const selectedCategoryFromUrl = searchParams.get("category") || "";
  const selectedCollectionFromUrl = searchParams.get("collection") || "";
  const pageFromUrl = Number(searchParams.get("page")) || 1;

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");

  const [sort, setSort] = useState("default");

  const [selectedCategories, setSelectedCategories] = useState(
    selectedCategoryFromUrl ? [selectedCategoryFromUrl] : []
  );

  const [selectedBrands, setSelectedBrands] = useState([]);

  const [selectedCollections, setSelectedCollections] = useState(
    selectedCollectionFromUrl ? [selectedCollectionFromUrl] : []
  );

  const [priceRange, setPriceRange] = useState([0, 20000000]);

  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(pageFromUrl > 0 ? pageFromUrl : 1);

  const { refetch } = useCart();
  const { handleAddToCart } = useCartActions(refetch);

  const addToCart = (product) => {
    handleAddToCart(product.id, "FAST-BUY-SKU", product.price, "Mặc định");
  };

  useEffect(() => {
    if (selectedCategoryFromUrl) {
      setSelectedCategories([selectedCategoryFromUrl]);
    } else {
      setSelectedCategories([]);
    }
  }, [selectedCategoryFromUrl]);

  useEffect(() => {
    if (selectedCollectionFromUrl) {
      setSelectedCollections([selectedCollectionFromUrl]);
    } else {
      setSelectedCollections([]);
    }
  }, [selectedCollectionFromUrl]);

  useEffect(() => {
    const fetchProducts = async () => {
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
            categoryName: item.category_name || "",
            brandName: item.brand_name || "",
            collectionName: item.collection_name || "",
            tag: index % 3 === 0 ? "Mới" : index % 3 === 1 ? "Hot" : null,
            rating: avgRating,
            reviews: reviewData.totalReviews,
            img:
              item?.variants?.images?.[0] ||
              "https://via.placeholder.com/600x400?text=No+Image",
          };
        });

        setProducts(mappedProducts);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
        setProductError(error.message || "Không thể tải sản phẩm");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  function toggleCategory(categoryName) {
    if (selectedCategories.includes(categoryName)) {
      setSelectedCategories(
        selectedCategories.filter((item) => item !== categoryName)
      );
    } else {
      setSelectedCategories([...selectedCategories, categoryName]);
    }
  }

  function toggleBrand(brandName) {
    if (selectedBrands.includes(brandName)) {
      setSelectedBrands(selectedBrands.filter((item) => item !== brandName));
    } else {
      setSelectedBrands([...selectedBrands, brandName]);
    }
  }

  function toggleCollection(collectionName) {
    if (selectedCollections.includes(collectionName)) {
      setSelectedCollections(
        selectedCollections.filter((item) => item !== collectionName)
      );
    } else {
      setSelectedCollections([...selectedCollections, collectionName]);
    }
  }

  const categoryOptions = useMemo(() => {
    return [...new Set(products.map((p) => p.categoryName).filter(Boolean))];
  }, [products]);

  const brandOptions = useMemo(() => {
    return [...new Set(products.map((p) => p.brandName).filter(Boolean))];
  }, [products]);

  const collectionOptions = useMemo(() => {
    return [...new Set(products.map((p) => p.collectionName).filter(Boolean))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.categoryName));
    }

    if (selectedBrands.length > 0) {
      list = list.filter((p) => selectedBrands.includes(p.brandName));
    }

    if (selectedCollections.length > 0) {
      list = list.filter((p) =>
        selectedCollections.includes(p.collectionName)
      );
    }

    list = list.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    if (sort === "asc") list.sort((a, b) => a.price - b.price);
    if (sort === "desc") list.sort((a, b) => b.price - a.price);

    return list;
  }, [
    products,
    selectedCategories,
    selectedBrands,
    selectedCollections,
    priceRange,
    sort,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedBrands, selectedCollections, priceRange, sort]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
      return;
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startItem =
    filteredProducts.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length);

  const filterSummary = useMemo(() => {
    if (loadingProducts) return "Đang tải sản phẩm...";
    if (productError) return "Không thể tải sản phẩm";

    if (selectedCategoryFromUrl) {
      return `Danh mục: ${selectedCategoryFromUrl} • ${filteredProducts.length} sản phẩm`;
    }

    if (selectedCollectionFromUrl) {
      return `Collection: ${selectedCollectionFromUrl} • ${filteredProducts.length} sản phẩm`;
    }

    return `Hiển thị ${startItem}-${endItem} / ${filteredProducts.length} sản phẩm`;
  }, [
    loadingProducts,
    productError,
    selectedCategoryFromUrl,
    selectedCollectionFromUrl,
    filteredProducts.length,
    startItem,
    endItem,
  ]);

  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;

    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`min-w-10 h-10 px-3 rounded-lg border text-sm transition ${
            currentPage === i
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1 bg-slate-50 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-xl font-semibold">Tất Cả Sản Phẩm</h1>
              <p className="text-sm text-slate-500">{filterSummary}</p>
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="default">Mặc định</option>
              <option value="asc">Giá tăng dần</option>
              <option value="desc">Giá giảm dần</option>
            </select>
          </div>

          <div className="grid grid-cols-12 gap-8">
            <aside className="col-span-3">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Danh mục</h3>

                    <div className="space-y-2 text-sm">
                      {categoryOptions.map((categoryName) => (
                        <label key={categoryName} className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedCategories.includes(categoryName)}
                            onCheckedChange={() => toggleCategory(categoryName)}
                          />
                          {categoryName}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Thương hiệu</h3>

                    <div className="space-y-2 text-sm">
                      {brandOptions.map((brandName) => (
                        <label key={brandName} className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedBrands.includes(brandName)}
                            onCheckedChange={() => toggleBrand(brandName)}
                          />
                          {brandName}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Collection</h3>

                    <div className="space-y-2 text-sm">
                      {collectionOptions.map((collectionName) => (
                        <label key={collectionName} className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedCollections.includes(collectionName)}
                            onCheckedChange={() => toggleCollection(collectionName)}
                          />
                          {collectionName}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Khoảng giá</h3>

                    <Slider
                      min={0}
                      max={20000000}
                      step={500000}
                      value={priceRange}
                      onValueChange={(v) => setPriceRange(v)}
                    />

                    <p className="text-xs text-slate-500 mt-2">
                      {formatVND(priceRange[0])} - {formatVND(priceRange[1])}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Giá từ</label>
                        <input
                          type="number"
                          min={0}
                          max={priceRange[1]}
                          step={500000}
                          value={priceRange[0]}
                          onChange={(e) => {
                            const value = Number(e.target.value) || 0;
                            setPriceRange([Math.min(value, priceRange[1]), priceRange[1]]);
                          }}
                          className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Đến</label>
                        <input
                          type="number"
                          min={priceRange[0]}
                          max={20000000}
                          step={500000}
                          value={priceRange[1]}
                          onChange={(e) => {
                            const value = Number(e.target.value) || 0;
                            setPriceRange([priceRange[0], Math.max(value, priceRange[0])]);
                          }}
                          className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>

            <section className="col-span-9">
              {loadingProducts ? (
                <div className="bg-white border rounded-xl p-10 text-center text-slate-500">
                  Đang tải sản phẩm...
                </div>
              ) : productError ? (
                <div className="bg-white border rounded-xl p-10 text-center text-red-500">
                  {productError}
                </div>
              ) : (
                <>
                  {filteredProducts.length === 0 ? (
                    <div className="bg-white border rounded-xl p-10 text-center text-slate-500">
                      Không có sản phẩm phù hợp
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-6">
                        {paginatedProducts.map((p) => (
                          <div
                            key={p.id}
                            className="block rounded-xl bg-white border border-slate-200 overflow-hidden hover:shadow-lg transition"
                          >
                            <Link to={`/detailproduct/${p.id}`} className="block">
                              <div className="relative">
                                <div className="aspect-[4/3] bg-slate-100">
                                  <img
                                    src={p.img}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                {p.tag && (
                                  <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded">
                                    {p.tag}
                                  </span>
                                )}
                              </div>
                            </Link>

                            <div className="p-3">
                              <Link to={`/detailproduct/${p.id}`}>
                                <p className="text-sm font-semibold line-clamp-2 min-h-[40px]">
                                  {p.name}
                                </p>
                              </Link>

                              <p className="mt-2 text-xs text-slate-500 line-clamp-2 min-h-[36px]">
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
                                <span className="text-[11px] text-slate-500 ml-1">
                                  ({p.reviews ?? 0})
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
                          <button
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className="h-10 px-4 rounded-lg border bg-white text-sm text-slate-700 border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition"
                          >
                            Trước
                          </button>

                          {renderPaginationButtons()}

                          <button
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages)
                              )
                            }
                            disabled={currentPage === totalPages}
                            className="h-10 px-4 rounded-lg border bg-white text-sm text-slate-700 border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition"
                          >
                            Sau
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function formatVND(v) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "đ",
    maximumFractionDigits: 0,
  }).format(v || 0);
}