import { useState, useEffect } from "react";
import {
  getFavorites,
  removeFavorite as removeFavoriteAPI,
  getReviews,
} from "@/lib/api";
import { useCart } from "@/hooks/useCart";
import { useCartActions } from "@/hooks/useCartActions";

export default function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { refetch } = useCart();
  const { handleAddToCart } = useCartActions(refetch);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
          setFavorites([]);
          setLoading(false);
          return;
        }

        const data = await getFavorites(user.id);

        const favoriteList = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];

        const mapped = await Promise.all(
          favoriteList.map(async (p) => {
            const firstImage =
              p?.variants?.images?.[0] || "https://picsum.photos/400/300";

            const firstVariant = p?.variants?.variants?.[0];
            const price = firstVariant?.price || 0;

            let rating = 0;
            let reviews = 0;

            try {
              const reviewRes = await getReviews(p.product_id);
              const reviewList = Array.isArray(reviewRes)
                ? reviewRes
                : Array.isArray(reviewRes?.data)
                ? reviewRes.data
                : [];

              reviews = reviewList.length;

              if (reviewList.length > 0) {
                rating =
                  reviewList.reduce(
                    (sum, item) => sum + (Number(item.rating) || 0),
                    0
                  ) / reviewList.length;
              }
            } catch (reviewErr) {
              console.error("Load review error", reviewErr);
            }

            return {
              id: p.product_id,
              name: p.product_name,
              description: p.product_description,
              price,
              oldPrice: null,
              rating: Number(rating.toFixed(1)),
              reviews,
              img: firstImage,
            };
          })
        );

        setFavorites(mapped);
      } catch (err) {
        console.error("Load favorite error", err);
        setError(err.message || "Không thể tải danh sách yêu thích");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const removeFavorite = async (productId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;

      await removeFavoriteAPI(user.id, productId);
      setFavorites((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error("Remove favorite error", err);
    }
  };

  const clearFavorites = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;

      await Promise.all(favorites.map((p) => removeFavoriteAPI(user.id, p.id)));
      setFavorites([]);
    } catch (err) {
      console.error("Clear favorites error", err);
    }
  };

  const addToCart = (product) => {
    const sku = product?.sku || "FAST-BUY-SKU";
    handleAddToCart(product.id, sku, product.price || 0, "Mặc định");
    alert(`Đã thêm "${product.name}" vào giỏ hàng`);
  };

  return {
    favorites,
    loading,
    error,
    removeFavorite,
    clearFavorites,
    addToCart,
  };
}