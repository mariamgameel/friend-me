import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { getFavorites, addFavorite, removeFavorite } from "../api/users";
import { useToast } from "../components/ui/Toast";

const FavoritesContext = createContext(null);

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used within a FavoritesProvider");
  return context;
}

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getFavorites();
      const list = Array.isArray(res.data) ? res.data : [];
      setFavorites(list);
    } catch (err) {
      console.warn("Failed to fetch favorites:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback(
    (dogId) => {
      return favorites.some((d) => (d._id || d) === dogId);
    },
    [favorites]
  );

  const toggleFavorite = async (dog) => {
    if (!user) {
      showToast("Please log in to save favorites", "info");
      return false;
    }

    const dogId = dog._id || dog;
    const currentlyFav = isFavorite(dogId);

    try {
      if (currentlyFav) {
        await removeFavorite(dogId);
        setFavorites((prev) => prev.filter((d) => (d._id || d) !== dogId));
        showToast(`Removed ${dog.name || "dog"} from favorites`, "info");
      } else {
        await addFavorite(dogId);
        setFavorites((prev) => [...prev, dog]);
        showToast(`Added ${dog.name || "dog"} to favorites! ❤️`, "success");
      }
      return true;
    } catch (err) {
      showToast("Failed to update favorites", "error");
      return false;
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        isFavorite,
        toggleFavorite,
        refreshFavorites: fetchFavorites
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}
