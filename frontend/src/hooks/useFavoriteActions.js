import { addFavorite, removeFavorite } from "@/lib/api";

export default function useFavoriteActions() {
  const toggleFavorite = async (productId, userId, liked) => {
    try {
      if (liked) {
        await removeFavorite(userId, productId);
      } else {
        await addFavorite(userId, productId);
      }
    } catch (err) {
      console.error("Favorite error", err);
    }
  };

  return { toggleFavorite };
}