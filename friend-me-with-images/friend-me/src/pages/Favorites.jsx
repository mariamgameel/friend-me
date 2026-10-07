import React from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { Heart, Sparkles, ArrowRight } from "lucide-react";
import "./Favorites.css";

export default function Favorites() {
  useDocumentTitle("My Favorite Dogs");

  const { favorites, toggleFavorite, loading } = useFavorites();

  return (
    <div className="page-container favorites-page fade-up">
      <div className="favorites-header">
        <h1>Saved Favorites ({favorites.length})</h1>
        <p>Keep track of the rescue dogs that have stolen your heart.</p>
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          icon={<Heart size={44} color="var(--primary)" />}
          title="No Favorite Dogs Saved"
          description="You haven't saved any dogs to your favorites list yet. When browsing dogs, tap the heart icon to save them here!"
          actionLabel="Explore Dogs"
          onAction={() => (window.location.href = "/adopt")}
        />
      ) : (
        <div className="favorites-grid">
          {favorites.map((dog) => (
            <div key={dog._id} className="fav-dog-card card">
              <div className="fav-dog-img-box">
                {dog.image ? (
                  <img src={dog.image} alt={dog.name} />
                ) : (
                  <span>🐕</span>
                )}
                <button
                  className="fav-remove-btn"
                  onClick={() => toggleFavorite(dog)}
                  aria-label={`Remove ${dog.name} from favorites`}
                  title="Remove from favorites"
                >
                  <Heart size={18} fill="var(--primary)" color="var(--primary)" />
                </button>
              </div>

              <div className="fav-dog-body">
                <div className="fav-dog-top">
                  <h3>{dog.name}</h3>
                  <Badge variant="pink">{dog.gender}</Badge>
                </div>
                <p className="fav-dog-meta">{dog.breed} · {dog.age} yrs old</p>
                <div className="fav-dog-badges">
                  <Badge variant="neutral">{dog.size}</Badge>
                  <Badge variant="yellow">{dog.energyLevel} Energy</Badge>
                </div>
                <p className="fav-dog-desc">{dog.description?.slice(0, 75)}...</p>

                <div className="fav-dog-action">
                  <Link to={`/adopt/${dog._id}`} style={{ width: "100%" }}>
                    <Button variant="primary" size="sm" style={{ width: "100%", justifyContent: "center" }}>
                      View & Adopt
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
