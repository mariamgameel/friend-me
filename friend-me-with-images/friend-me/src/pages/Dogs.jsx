import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllDogs } from "../api/dogs";
import "./Dogs.css";

export default function Dogs() {
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getAllDogs().then(res => setDogs(res.data)).finally(() => setLoading(false));
  }, []);

  const filtered = dogs.filter(d => {
    if (filter === "available") return !d.isAdopted;
    if (filter === "adopted") return d.isAdopted;
    return true;
  });

  return (
    <div className="page-container">
      <div className="dogs-header fade-up">
        <div>
          <h1>Find Your Best Friend</h1>
          <p>Every dog deserves a loving home. Browse our available dogs and find your perfect match.</p>
        </div>
        <div className="filter-tabs">
          {["all","available","adopted"].map(f => (
            <button key={f} className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="dogs-grid">
          {filtered.map(dog => (
            <Link key={dog._id} to={`/adopt/${dog._id}`} className="dog-card card">
              <div className="dog-img-area" style={{ background: dog.isAdopted ? "#e8e8e8" : "var(--pink)" }}>
                {dog.image
                  ? <img src={dog.image} alt={dog.name} onError={e=>{e.target.style.display="none"; e.target.parentNode.querySelector(".dog-emoji").style.display="flex";}} />
                  : null}
                <span className="dog-emoji" style={{display: dog.image ? "none" : "flex"}}>🐕</span>
                {dog.isAdopted && <div className="adopted-overlay">Adopted</div>}
              </div>
              <div className="dog-info">
                <div className="dog-info-top">
                  <h3>{dog.name}</h3>
                  <span className="badge badge-pink">{dog.gender}</span>
                </div>
                <p className="dog-breed">{dog.breed} · {dog.age} yrs</p>
                <p className="dog-desc">{dog.description?.slice(0, 70)}...</p>
                <div className="dog-footer">
                  <span className="badge badge-yellow">{dog.healthStatus || "Healthy"}</span>
                  {!dog.isAdopted && <span className="adopt-cta">Adopt →</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <span>🐾</span>
          <p>No dogs found in this category.</p>
        </div>
      )}
    </div>
  );
}
