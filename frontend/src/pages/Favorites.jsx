import { useState, useMemo } from "react";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";

import FavoriteCard from "@/components/favorites/FavoriteCard";
import FavoritesHeader from "@/components/favorites/FavoritesHeader";
import FavoritesEmpty from "@/components/favorites/FavoritesEmpty";

import useFavorites from "@/hooks/useFavorites";

export default function Favorites() {
  const {
    favorites = [],
    loading,
    error,
    removeFavorite,
    clearFavorites,
    addToCart,
  } = useFavorites();

  const [sort, setSort] = useState("default");

  const sortedFavorites = useMemo(() => {
    const list = [...favorites];

    if (sort === "low") {
      return list.sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    if (sort === "high") {
      return list.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return list;
  }, [favorites, sort]);

  if (loading) {
    return <div className="p-10 text-center">Đang tải...</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 bg-slate-50">
        <FavoritesHeader
          count={favorites.length}
          sort={sort}
          setSort={setSort}
          clearFavorites={clearFavorites}
        />

        <section className="pb-16">
          <div className="mx-auto max-w-7xl px-4">
            {sortedFavorites.length === 0 ? (
              <FavoritesEmpty />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {sortedFavorites.map((p) => (
                  <FavoriteCard
                    key={p.id}
                    product={p}
                    removeFavorite={removeFavorite}
                    addToCart={addToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}