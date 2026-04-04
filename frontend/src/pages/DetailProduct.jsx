import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Header from "../components/ui/header";
import Footer from "../components/ui/footer";
import ModelViewer3D from "../components/3D/ModelViewer3D";
import {
  getProductById,
  getReviews,
  getReviewPermission,
  createReview,
  getFavorites,
} from "../lib/api";
import { useCart } from "../hooks/useCart";
import { useCartActions } from "../hooks/useCartActions";
import useFavoriteActions from "../hooks/useFavoriteActions";
import {
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  ChevronRight,
  Star,
  Truck,
  RotateCcw,
  Wrench,
  ShieldCheck,
} from "lucide-react";

const REVIEW_DEFAULT = {
  canReview: false,
  purchased: false,
  alreadyReviewed: false,
};

const FALLBACK_COLOR = { hex: "#CCC", tailwind: "bg-gray-300" };

const COLORS = {
  Trắng: { hex: "#FFF", tailwind: "bg-white border-2 border-gray-200" },
  Nâu: { hex: "#8B4513", tailwind: "bg-[#8B4513]" },
  "Nâu đậm": { hex: "#C69B7B", tailwind: "bg-[#C69B7B]" },
  Đen: { hex: "#2A2A2A", tailwind: "bg-[#2A2A2A]" },
  "Đen nhám": { hex: "#2A2A2A", tailwind: "bg-[#2A2A2A]" },
  "Gỗ sồi": { hex: "#E5E4E0", tailwind: "bg-[#E5E4E0]" },
  Xám: { hex: "#808080", tailwind: "bg-gray-500" },
  "Xanh Navy": { hex: "#000080", tailwind: "bg-blue-900" },
  "Nâu da bò": { hex: "#A52A2A", tailwind: "bg-orange-800" },
  "Vân gỗ sáng": { hex: "#DEB887", tailwind: "bg-[#DEB887]" },
};

const dimStr = (v) =>
  `${v?.specs?.dimensions?.length || 0}x${v?.specs?.dimensions?.width || 0}x${v?.specs?.dimensions?.height || 0
  }`;

const avgRating = (list) =>
  list.length
    ? Number(
      (
        list.reduce((s, i) => s + Number(i.rating || 0), 0) / list.length
      ).toFixed(1)
    )
    : 0;

const formatDateTime = (date) =>
  date
    ? new Date(date).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    : "";

export default function ProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { refetch } = useCart();
  const { handleAddToCart } = useCartActions(refetch);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openIndex, setOpenIndex] = useState(0);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewPermission, setReviewPermission] = useState(REVIEW_DEFAULT);
  const [zoomImage, setZoomImage] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const { toggleFavorite } = useFavoriteActions();
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user || !id) return;

      try {
        const res = await getFavorites(user.id);
        const favoriteList = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : [];

        const isFavorite = favoriteList.some(
          (p) => Number(p.product_id) === Number(id)
        );

        setLiked(isFavorite);
      } catch (err) {
        console.error("Load favorite error", err);
      }
    };

    fetchFavorites();
  }, [id, user?.id]);

  const handleFavoriteClick = async () => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để thực hiện chức năng này");
      return;
    }

    try {
      await toggleFavorite(id, user.id, liked);
      setLiked((prev) => !prev);
      toast.success(liked ? "Đã bỏ lưu sản phẩm" : "Đã lưu sản phẩm");
    } catch (err) {
      console.error("Favorite error", err);
      toast.error("Có lỗi xảy ra khi thực hiện chức năng này");
    }
  };

  const mongo = product?.variants || {};
  const variantList = mongo.variants || [];
  const model3dUrl = mongo.model3d || null;

  const productImages = useMemo(
    () => (Array.isArray(mongo.images) ? mongo.images.filter(Boolean) : []),
    [mongo.images]
  );

  const availableVariants = useMemo(
    () =>
      variantList.map((v) => {
        const colorName = v.specs?.color || "Mặc định";
        return { ...v, colorName, ...(COLORS[colorName] || FALLBACK_COLOR) };
      }),
    [variantList]
  );

  const activeVariant = availableVariants[activeVariantIndex] || null;
  const activeDim = dimStr(activeVariant);
  const reviewCount = reviews.length;
  const averageRating = useMemo(() => avgRating(reviews), [reviews]);

  const uniqueDimensionsList = useMemo(
    () =>
      [
        ...new Map(
          availableVariants.map((v) => [
            dimStr(v),
            { ...v.specs?.dimensions, dimStr: dimStr(v) },
          ])
        ).values(),
      ],
    [availableVariants]
  );

  const uniqueColorsList = useMemo(
    () =>
      [
        ...new Map(
          availableVariants.map((v) => [
            v.colorName,
            { colorName: v.colorName, tailwind: v.tailwind, hex: v.hex },
          ])
        ).values(),
      ],
    [availableVariants]
  );

  const refreshReviews = async () => {
    try {
      const list = (await getReviews(id))?.data || [];
      setReviews(list);
    } catch (e) {
      console.error("Lỗi lấy danh sách đánh giá:", e);
      toast.error("Không thể tải danh sách đánh giá");
    }
  };

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        setError("");
        setProduct((await getProductById(id)).data);
      } catch (e) {
        const msg = e.message || "Không thể tải dữ liệu sản phẩm";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (id) refreshReviews();
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        if (!localStorage.getItem("accessToken") || !id) {
          return setReviewPermission(REVIEW_DEFAULT);
        }
        setReviewPermission(
          (await getReviewPermission(id))?.data || REVIEW_DEFAULT
        );
      } catch (e) {
        console.error("Lỗi kiểm tra quyền review:", e);
        setReviewPermission(REVIEW_DEFAULT);
        toast.error("Không thể kiểm tra quyền đánh giá");
      }
    })();
  }, [id]);

  const pickVariant = (matcher, fallback) => {
    let i = availableVariants.findIndex(matcher);
    if (i < 0 && fallback) i = availableVariants.findIndex(fallback);
    if (i >= 0) setActiveVariantIndex(i);
  };

  const handleSizeClick = (d) =>
    pickVariant(
      (v) => v.colorName === activeVariant?.colorName && dimStr(v) === d,
      (v) => dimStr(v) === d
    );

  const handleColorClick = (colorName) =>
    pickVariant(
      (v) => v.colorName === colorName && dimStr(v) === activeDim,
      (v) => v.colorName === colorName
    );

  const onAddToCart = () => {
    if (!activeVariant) return;
    handleAddToCart(
      id,
      activeVariant.sku || "N/A",
      activeVariant.price || product.price || 0,
      activeVariant.colorName || "N/A"
    );
  };

  const handleSubmitReview = async () => {
    try {
      if (!localStorage.getItem("accessToken")) {
        toast("Vui lòng đăng nhập để đánh giá sản phẩm");
        return navigate("/auth/login");
      }

      if (!reviewPermission.canReview) {
        return toast(
          reviewPermission.alreadyReviewed
            ? "Bạn đã đánh giá sản phẩm này rồi"
            : "Bạn chỉ có thể đánh giá sau khi đã mua và đơn hàng đã giao"
        );
      }

      if (!userRating) return toast("Vui lòng chọn số sao");

      setReviewLoading(true);

      await createReview({
        productId: Number(id),
        rating: userRating,
        reviewComment: reviewComment.trim(),
      });

      toast.success("Đánh giá thành công");
      setUserRating(0);
      setReviewComment("");
      await refreshReviews();
      setReviewPermission({
        canReview: false,
        purchased: true,
        alreadyReviewed: true,
      });
    } catch (e) {
      toast.error(e.message || "Gửi đánh giá thất bại");
    } finally {
      setReviewLoading(false);
    }
  };

  const specs = [
    {
      title: "Kích thước & chi tiết",
      content: `Dài: ${activeVariant?.specs?.dimensions?.length || "N/A"}cm • Rộng: ${activeVariant?.specs?.dimensions?.width || "N/A"
        }cm • Cao: ${activeVariant?.specs?.dimensions?.height || "N/A"}cm • Nặng: ${activeVariant?.specs?.weight || "N/A"
        }kg`,
    },
    {
      title: "Mô tả",
      content: product?.product_description || "Sản phẩm chưa có mô tả.",
    },
    {
      title: "Vật liệu",
      content: `Chất liệu: ${activeVariant?.specs?.material || "N/A"} • Màu sắc: ${activeVariant?.specs?.color || "N/A"
        } • Tồn kho: ${activeVariant?.stock ?? "N/A"}`,
    },
  ];

  const features = [
    {
      title: "Xếp hạng đánh giá được thu thập tại",
      subtitle: (
        <div className="mt-1">
          <div className="flex items-center gap-1 font-bold text-sm">
            {averageRating}/5
            <div className="flex text-black">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={12}
                  fill={s <= Math.round(averageRating) ? "currentColor" : "none"}
                />
              ))}
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Tổng {reviewCount} đánh giá
          </div>
        </div>
      ),
    },
    {
      icon: <Truck className="text-gray-600" size={24} />,
      title: "Sản xuất theo đơn đặt hàng",
    },
    {
      icon: <RotateCcw className="text-gray-600" size={24} />,
      title: "Đổi trả miễn phí trong vòng 100 ngày",
      hasArrow: true,
    },
    {
      icon: <Wrench className="text-gray-600" size={24} />,
      title: "Dịch vụ lắp ráp tùy chọn",
      hasArrow: true,
    },
    {
      icon: <ShieldCheck className="text-gray-600" size={24} />,
      title: "Bảo hành 10 năm",
      hasArrow: true,
    },
  ];

  if (loading || error || !product)
    return (
      <div className="min-h-screen bg-white text-gray-900 font-sans">
        <Header />
        <div
          className={`max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-lg font-medium ${error || !product ? "text-red-600" : "text-gray-500"
            }`}
        >
          {error || (!product && !loading)
            ? error || "Không tìm thấy sản phẩm"
            : "Đang tải dữ liệu sản phẩm..."}
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Header />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6">
          <h1 className="text-xl font-medium text-gray-500">
            {product.category_name} / {product.product_name}
          </h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 mb-16 h-full min-h-[700px]">
          <div className="flex-1 bg-[#F1F2F4] rounded-2xl relative border border-gray-200 overflow-hidden flex flex-col justify-between p-8">
            <div className="flex-1 flex items-center justify-center relative w-full mt-12 mb-16 min-h-[400px] bg-gray-50 rounded-xl overflow-hidden shadow-inner">
              {model3dUrl ? (
                <ModelViewer3D
                  src={model3dUrl}
                  colorHex={activeVariant?.hex || "#FFF"}
                  alt={product.product_name}
                />
              ) : (
                <img
                  src={productImages[0] || "https://via.placeholder.com/600"}
                  alt="Sản phẩm"
                  className="object-contain w-full h-full max-h-[500px]"
                />
              )}
            </div>
          </div>

          <div className="w-full lg:w-[420px] flex flex-col pt-4">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-[28px] font-bold text-red-600">
                {activeVariant?.price
                  ? `${Number(activeVariant.price).toLocaleString("vi-VN")} đ`
                  : "Liên hệ"}
              </span>
              <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-md uppercase">
                {activeVariant?.status || "AVAILABLE"}
              </span>
            </div>

            <p className="text-sm text-gray-500 mb-4 font-medium">
              Mã: {activeVariant?.sku || "N/A"} • Tồn kho:{" "}
              {activeVariant?.stock ?? "N/A"}
            </p>

            <div className="h-px bg-gray-200 mb-4" />

            <div className="space-y-4 mb-4">
              <div className="pt-2">
                <span className="text-sm font-bold text-gray-900 mb-3 block">
                  Kích thước (Dài x Rộng x Cao)
                </span>
                <div className="flex flex-wrap gap-2 mb-4">
                  {uniqueDimensionsList.map((dim, i) => {
                    const isActive = activeDim === dim.dimStr;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSizeClick(dim.dimStr)}
                        className={`px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all ${isActive
                          ? "bg-orange-50 text-orange-600 border-orange-500"
                          : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"
                          }`}
                      >
                        {dim.length} x {dim.width} x {dim.height} cm
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-900">Màu sắc</span>
                  <span className="text-sm font-medium text-gray-500">
                    {activeVariant?.colorName}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 mb-4">
                  {uniqueColorsList.map((c, i) => {
                    const isActive = activeVariant?.colorName === c.colorName;
                    return (
                      <button
                        key={i}
                        onClick={() => handleColorClick(c.colorName)}
                        title={c.colorName}
                        className={`w-9 h-9 rounded-full transition-all duration-200 ${c.tailwind} ${isActive
                          ? "ring-2 ring-offset-2 ring-orange-500 scale-110"
                          : "hover:scale-110 border border-gray-200 shadow-sm"
                          }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100">
              <div className="flex gap-4 mb-4">
                <button
  onClick={onAddToCart}
  disabled={!activeVariant || activeVariant.stock <= 0}
  className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full py-3.5 px-4 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-colors"
>
  <ShoppingCart size={19} />
  {activeVariant?.stock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
</button>

                <button
                  onClick={handleFavoriteClick}
                  className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 rounded-full py-3.5 px-6 font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Heart
                    size={20}
                    className={liked ? "fill-red-500 text-red-500" : "text-gray-400"}
                  />
                  {liked ? "Đã lưu" : "Lưu"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 border-t border-gray-100 pt-4">
                <div>
                  Hàng được giao trong vòng 8 tuần
                  <a
                    href="#"
                    className="font-bold text-gray-900 underline block mt-1"
                  >
                    Xem thông tin thanh toán
                  </a>
                </div>
                <div>
                  Được sản xuất tại Việt Nam
                  <a
                    href="#"
                    className="font-bold text-gray-900 underline block mt-1"
                  >
                    Giao hàng & trả hàng
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-b border-gray-200 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            {features.map((f, i) => (
              <React.Fragment key={i}>
                <div className="flex items-start gap-3 flex-1 px-4 cursor-pointer group">
                  {f.icon && <div className="mt-0.5">{f.icon}</div>}
                  <div>
                    <p className="text-sm font-medium text-gray-900 leading-tight group-hover:underline">
                      {f.title}
                    </p>
                    {f.subtitle}
                  </div>
                  {f.hasArrow && (
                    <ChevronRight
                      size={20}
                      className="text-gray-400 ml-auto mt-0.5"
                    />
                  )}
                </div>
                {i < features.length - 1 && (
                  <div className="w-px h-10 bg-gray-200 hidden lg:block" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-4 inline-block">
            Hình ảnh chi tiết sản phẩm
          </h3>
        </div>

        <div className="h-auto">
  {productImages.length ? (
    (() => {
      const detailImages = productImages.slice(0, 3);

      if (detailImages.length === 1) {
        return (
          <div className="h-[400px] md:h-[600px] group overflow-hidden rounded-xl relative bg-gray-100">
            <img
              src={detailImages[0]}
              alt={product.product_name}
              onClick={() => setZoomImage(detailImages[0])}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 cursor-zoom-in"
            />
          </div>
        );
      }

      if (detailImages.length === 2) {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-auto md:h-[600px]">
            {detailImages.map((img, i) => (
              <div
                key={i}
                className="h-[280px] md:h-full group overflow-hidden rounded-xl relative bg-gray-100"
              >
                <img
                  src={img}
                  alt={`${product.product_name} ${i + 1}`}
                  onClick={() => setZoomImage(img)}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 cursor-zoom-in"
                />
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[600px]">
          <div className="md:col-span-2 h-[400px] md:h-full group overflow-hidden rounded-xl relative bg-gray-100">
            <img
              src={detailImages[0]}
              alt={product.product_name}
              onClick={() => setZoomImage(detailImages[0])}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 cursor-zoom-in"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 h-auto md:h-full">
            {detailImages.slice(1).map((img, i) => (
              <div
                key={i}
                className="h-[220px] md:h-full group overflow-hidden rounded-xl relative bg-gray-100"
              >
                <img
                  src={img}
                  alt={`${product.product_name} ${i + 2}`}
                  onClick={() => setZoomImage(img)}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 cursor-zoom-in"
                />
              </div>
            ))}
          </div>
        </div>
      );
    })()
  ) : (
    <div className="h-[400px] flex items-center justify-center text-gray-400 bg-gray-100 rounded-xl">
      Không có ảnh chi tiết
    </div>
  )}
</div>

        {zoomImage && (
          <div
            className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
            onClick={() => setZoomImage(null)}
          >
            <button
              type="button"
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 text-white text-3xl font-bold leading-none hover:opacity-80"
            >
              ×
            </button>

            <img
              src={zoomImage}
              alt="Zoom ảnh sản phẩm"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-2">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/3 flex flex-col gap-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 pr-4">
              Thông số kỹ thuật đồ nội thất của bạn
            </h2>
          </div>

          <div className="md:w-2/3 border-t border-gray-200">
            {specs.map((spec, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={i} className="border-b border-gray-200">
                  <button
                    onClick={() => setOpenIndex(isOpen ? -1 : i)}
                    className="w-full py-5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="text-[15px] font-bold text-gray-900 leading-none">
                      {spec.title}
                    </span>
                    <span className="text-gray-400 ml-4">
                      {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="pb-5 text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                      {spec.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="border-t border-gray-200 pt-10">
          <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
            <h3 className="text-xl font-bold text-gray-900 leading-none">
              Đánh giá & Bình luận ({reviewCount})
            </h3>
            <div className="text-sm text-gray-500">
              Trung bình:{" "}
              <span className="font-semibold text-gray-900">
                {averageRating}/5
              </span>{" "}
              • Tổng {reviewCount} đánh giá
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/3 lg:shrink-0">
              <div className="p-5 border-2 border-gray-200 rounded-2xl bg-white shadow-sm h-full flex flex-col">
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700 block mb-2">
                    Đánh giá của bạn:
                  </span>
                  <div className="flex space-x-1 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setUserRating(s)}
                        disabled={!reviewPermission.canReview}
                        className="focus:outline-none"
                      >
                        <Star
                          size={24}
                          fill={s <= userRating ? "currentColor" : "none"}
                          className={`transition-colors ${s <= userRating
                            ? "text-yellow-400"
                            : "text-gray-300 hover:text-yellow-400"
                            }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {!reviewPermission.canReview && (
                  <div className="mb-3 text-sm text-gray-500">
                    {reviewPermission.alreadyReviewed
                      ? "Bạn đã đánh giá sản phẩm này rồi."
                      : "Bạn chỉ có thể đánh giá sau khi đã mua và đơn hàng đã giao."}
                  </div>
                )}

                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  disabled={!reviewPermission.canReview}
                  placeholder="Viết trải nghiệm của bạn về sản phẩm này."
                  className="flex-1 w-full p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 min-h-[100px] resize-none"
                />

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSubmitReview}
                    disabled={reviewLoading || !reviewPermission.canReview}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    {reviewLoading ? "Đang gửi..." : "Gửi đánh giá"}
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:w-2/3 border-2 border-gray-200 rounded-2xl p-4 sm:p-5 bg-white shadow-sm h-[310px]">
              <div
                className="flex flex-col overflow-y-auto gap-3 snap-y snap-mandatory h-full pr-2"
                style={{ scrollbarWidth: "thin" }}
              >
                {reviews.length ? (
                  reviews.map((r) => (
                    <div
                      key={r.review_id}
                      className="w-full shrink-0 h-auto p-4 snap-start border-2 border-gray-200 rounded-xl flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-sm text-gray-900">
                          {r.username || "Người dùng"}
                        </div>
                        <div className="flex space-x-0.5 text-yellow-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              fill={s <= r.rating ? "currentColor" : "none"}
                              className={s <= r.rating ? "" : "text-gray-300"}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {r.review_comment || "Không có nội dung bình luận."}
                      </p>
                      <span className="text-xs text-gray-400 mt-2 block">
                        {formatDateTime(r.review_date)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">
                    Chưa có đánh giá nào.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}