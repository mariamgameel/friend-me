import React, { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAllDogs, getBreeds } from "../api/dogs";
import { useFavorites } from "../context/FavoritesContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useDebounce } from "../hooks/useDebounce";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import {
  Search,
  Filter,
  X,
  Heart,
  SlidersHorizontal,
  RotateCcw,
  Sparkles
} from "lucide-react";
import "./Dogs.css";

export default function Dogs() {
  useDocumentTitle("Adopt a Dog");

  const [searchParams, setSearchParams] = useSearchParams();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Search input state
  const initialSearch = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Filter values from URL query parameters
  const page = parseInt(searchParams.get("page") || "1", 10);
  const gender = searchParams.get("gender") || "";
  const size = searchParams.get("size") || "";
  const energyLevel = searchParams.get("energyLevel") || "";
  const breed = searchParams.get("breed") || "";
  const minAge = searchParams.get("minAge") || "";
  const maxAge = searchParams.get("maxAge") || "";
  const goodWithKids = searchParams.get("goodWithKids") || "";
  const status = searchParams.get("status") || "all";
  const sort = searchParams.get("sort") || "newest";

  const [dogs, setDogs] = useState([]);
  const [breedsList, setBreedsList] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1, limit: 12 });
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync debounced search to searchParams
  useEffect(() => {
    if (debouncedSearch !== (searchParams.get("q") || "")) {
      updateFilter("q", debouncedSearch, true);
    }
  }, [debouncedSearch]);

  // Load distinct breeds once
  useEffect(() => {
    getBreeds()
      .then((res) => {
        setBreedsList(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {});
  }, []);

  // Fetch dogs whenever URL parameters change
  useEffect(() => {
    setLoading(true);
    const params = {
      page,
      limit: 12,
      sort,
      status: status || "all"
    };

    if (debouncedSearch) params.q = debouncedSearch;
    if (gender) params.gender = gender;
    if (size) params.size = size;
    if (energyLevel) params.energyLevel = energyLevel;
    if (breed) params.breed = breed;
    if (minAge) params.minAge = minAge;
    if (maxAge) params.maxAge = maxAge;
    if (goodWithKids === "true") params.goodWithKids = "true";

    getAllDogs(params)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setDogs(list);
        if (res.meta || res.data?.meta) {
          setMeta(res.meta || res.data.meta);
        } else {
          setMeta({ total: list.length, page, pages: 1, limit: 12 });
        }
      })
      .catch(() => {
        setDogs([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams]);

  // Helper to update a search param
  const updateFilter = (key, value, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    if (resetPage) {
      next.set("page", "1");
    }
    setSearchParams(next);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams());
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (debouncedSearch) count++;
    if (gender) count++;
    if (size) count++;
    if (energyLevel) count++;
    if (breed) count++;
    if (minAge || maxAge) count++;
    if (goodWithKids === "true") count++;
    if (status && status !== "all") count++;
    return count;
  }, [debouncedSearch, gender, size, energyLevel, breed, minAge, maxAge, goodWithKids, status]);

  return (
    <div className="page-container adopt-page">
      {/* Page Header */}
      <div className="adopt-header fade-up">
        <div className="adopt-header-left">
          <h1>Find Your Best Friend</h1>
          <p>
            {loading ? "Searching through available rescue dogs..." : `${meta.total} wonderful companions waiting for a loving home.`}
          </p>
        </div>

        {/* Quick status tabs */}
        <div className="status-tabs-pill">
          {["all", "available", "adopted"].map((s) => (
            <button
              key={s}
              className={`status-tab ${status === s ? "active" : ""}`}
              onClick={() => updateFilter("status", s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Mobile Filter Toggle */}
      <div className="search-bar-row">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, breed, or personality..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search dogs"
          />
          {searchInput && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchInput("")}
              aria-label="Clear search text"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          className="mobile-filter-trigger"
          onClick={() => setMobileFiltersOpen(true)}
          aria-label="Open filter panel"
        >
          <SlidersHorizontal size={18} />
          <span>Filters</span>
          {activeFiltersCount > 0 && <span className="active-pill">{activeFiltersCount}</span>}
        </button>

        <div className="sort-select-wrap">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => updateFilter("sort", e.target.value, false)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="ageAsc">Age: Youngest to Oldest</option>
            <option value="ageDesc">Age: Senior to Youngest</option>
            <option value="nameAsc">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Main Content: Sidebar + Grid */}
      <div className="adopt-layout">
        {/* Desktop Filter Sidebar */}
        <aside className="filters-sidebar card">
          <div className="filters-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Filter size={18} color="var(--primary)" />
              <h3>Refine Search</h3>
            </div>
            {activeFiltersCount > 0 && (
              <button className="reset-filters-btn" onClick={handleClearFilters}>
                <RotateCcw size={14} />
                <span>Reset ({activeFiltersCount})</span>
              </button>
            )}
          </div>

          <div className="filter-group">
            <label>Breed</label>
            <select
              value={breed}
              onChange={(e) => updateFilter("breed", e.target.value)}
            >
              <option value="">All Breeds</option>
              {breedsList.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Size</label>
            <div className="chip-group">
              {["All", "Small", "Medium", "Large"].map((sz) => {
                const val = sz === "All" ? "" : sz;
                const isSelected = size === val;
                return (
                  <button
                    key={sz}
                    type="button"
                    className={`filter-chip ${isSelected ? "selected" : ""}`}
                    onClick={() => updateFilter("size", val)}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="filter-group">
            <label>Gender</label>
            <div className="chip-group">
              {["All", "Male", "Female"].map((g) => {
                const val = g === "All" ? "" : g;
                const isSelected = gender === val;
                return (
                  <button
                    key={g}
                    type="button"
                    className={`filter-chip ${isSelected ? "selected" : ""}`}
                    onClick={() => updateFilter("gender", val)}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="filter-group">
            <label>Energy Level</label>
            <div className="chip-group">
              {["All", "Low", "Medium", "High"].map((el) => {
                const val = el === "All" ? "" : el;
                const isSelected = energyLevel === val;
                return (
                  <button
                    key={el}
                    type="button"
                    className={`filter-chip ${isSelected ? "selected" : ""}`}
                    onClick={() => updateFilter("energyLevel", val)}
                  >
                    {el}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="filter-group">
            <label>Age Range (Years)</label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="number"
                placeholder="Min"
                min="0"
                max="20"
                value={minAge}
                onChange={(e) => updateFilter("minAge", e.target.value)}
                style={{ padding: "8px 12px" }}
              />
              <span style={{ color: "var(--gray)" }}>to</span>
              <input
                type="number"
                placeholder="Max"
                min="0"
                max="20"
                value={maxAge}
                onChange={(e) => updateFilter("maxAge", e.target.value)}
                style={{ padding: "8px 12px" }}
              />
            </div>
          </div>

          <div className="filter-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={goodWithKids === "true"}
                onChange={(e) => updateFilter("goodWithKids", e.target.checked ? "true" : "")}
              />
              <span>Good with Children</span>
            </label>
          </div>
        </aside>

        {/* Dogs Grid */}
        <main className="dogs-results-area">
          {loading ? (
            <div className="dogs-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} variant="card" />
              ))}
            </div>
          ) : dogs.length === 0 ? (
            <EmptyState
              title="No Dogs Match Your Search"
              description="Try loosening your filters or resetting the search to see all of our wonderful available friends."
              actionLabel="Clear All Filters"
              onAction={handleClearFilters}
            />
          ) : (
            <>
              <div className="dogs-grid">
                {dogs.map((dog) => {
                  const fav = isFavorite(dog._id);
                  return (
                    <div key={dog._id} className="dog-card card">
                      <div className="dog-img-box">
                        {dog.image ? (
                          <img
                            src={dog.image}
                            alt={dog.name}
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : null}
                        <span className="dog-placeholder-icon" style={{ display: dog.image ? "none" : "flex" }}>
                          🐕
                        </span>

                        {dog.isAdopted && (
                          <div className="adopted-overlay-badge">
                            <span>Adopted</span>
                          </div>
                        )}

                        <button
                          className={`dog-fav-btn ${fav ? "active" : ""}`}
                          onClick={() => toggleFavorite(dog)}
                          aria-label={`Save ${dog.name} to favorites`}
                        >
                          <Heart size={18} fill={fav ? "var(--primary)" : "none"} />
                        </button>
                      </div>

                      <div className="dog-card-body">
                        <div className="dog-card-header">
                          <h3 className="dog-name">{dog.name}</h3>
                          <Badge variant="pink">{dog.gender}</Badge>
                        </div>

                        <p className="dog-meta">
                          {dog.breed} · {dog.age} {dog.age === 1 ? "year" : "years"} old
                        </p>

                        <div className="dog-badge-row">
                          <Badge variant="neutral">{dog.size}</Badge>
                          <Badge variant="yellow">{dog.energyLevel} Energy</Badge>
                          {dog.vaccinated && <Badge variant="green">Vaccinated</Badge>}
                        </div>

                        {dog.personalityTags && dog.personalityTags.length > 0 && (
                          <div className="dog-tags-row">
                            {dog.personalityTags.slice(0, 2).map((tag, idx) => (
                              <span key={idx} className="personality-tag">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="dog-excerpt">
                          {dog.description?.slice(0, 75)}...
                        </p>

                        <div className="dog-card-footer">
                          <Link to={`/adopt/${dog._id}`} style={{ width: "100%" }}>
                            <Button
                              variant={dog.isAdopted ? "dark" : "primary"}
                              size="sm"
                              style={{ width: "100%", justifyContent: "center" }}
                            >
                              {dog.isAdopted ? "View Story" : "Meet & Adopt →"}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <Pagination
                page={meta.page || 1}
                pages={meta.pages || 1}
                onPageChange={(newPage) => updateFilter("page", String(newPage), false)}
              />
            </>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div
          className="mobile-filters-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileFiltersOpen(false);
          }}
        >
          <div className="mobile-filters-drawer" role="dialog" aria-modal="true" aria-label="Filters">
            <div className="mobile-filters-drawer-header">
              <h3>Filter Dogs</h3>
              <button
                className="btn-ghost"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mobile-filters-drawer-body">
              <div className="filter-group">
                <label>Breed</label>
                <select
                  value={breed}
                  onChange={(e) => updateFilter("breed", e.target.value)}
                >
                  <option value="">All Breeds</option>
                  {breedsList.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Size</label>
                <div className="chip-group">
                  {["All", "Small", "Medium", "Large"].map((sz) => {
                    const val = sz === "All" ? "" : sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        className={`filter-chip ${size === val ? "selected" : ""}`}
                        onClick={() => updateFilter("size", val)}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="filter-group">
                <label>Gender</label>
                <div className="chip-group">
                  {["All", "Male", "Female"].map((g) => {
                    const val = g === "All" ? "" : g;
                    return (
                      <button
                        key={g}
                        type="button"
                        className={`filter-chip ${gender === val ? "selected" : ""}`}
                        onClick={() => updateFilter("gender", val)}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="filter-group">
                <label>Energy Level</label>
                <div className="chip-group">
                  {["All", "Low", "Medium", "High"].map((el) => {
                    const val = el === "All" ? "" : el;
                    return (
                      <button
                        key={el}
                        type="button"
                        className={`filter-chip ${energyLevel === val ? "selected" : ""}`}
                        onClick={() => updateFilter("energyLevel", val)}
                      >
                        {el}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="filter-group">
                <label>Age Range</label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minAge}
                    onChange={(e) => updateFilter("minAge", e.target.value)}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxAge}
                    onChange={(e) => updateFilter("maxAge", e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={goodWithKids === "true"}
                    onChange={(e) => updateFilter("goodWithKids", e.target.checked ? "true" : "")}
                  />
                  <span>Good with Children</span>
                </label>
              </div>
            </div>

            <div className="mobile-filters-drawer-footer">
              <Button variant="outline" onClick={handleClearFilters}>
                Reset
              </Button>
              <Button variant="primary" onClick={() => setMobileFiltersOpen(false)}>
                Apply Filters ({meta.total})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
