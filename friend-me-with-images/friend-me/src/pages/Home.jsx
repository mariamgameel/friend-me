import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllDogs } from "../api/dogs";
import "./Home.css";

export default function Home() {
  const [stats, setStats] = useState({ total: 0, adopted: 0 });
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    getAllDogs().then(res => {
      const dogs = res.data;
      setStats({ total: dogs.length, adopted: dogs.filter(d => d.isAdopted).length });
      const available = dogs.filter(d => !d.isAdopted);
      if (available.length) setFeatured(available[0]);
    }).catch(() => {});
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-left">
          {featured && (
            <div className="featured-dog-pill">
              <div className="featured-avatar">🐕</div>
              <div>
                <strong>{featured.name}</strong>
                <span>{featured.age} years old</span>
              </div>
            </div>
          )}
          <h1 className="hero-title">
            My name is {featured?.name || "Max"} and<br />
            I love to chase the toys.<br />
            <span className="hero-bold">I'm looking for<br />a new home.</span>
          </h1>
          <Link to={featured ? `/adopt/${featured._id}` : "/adopt"}>
            <button className="btn-primary">Check my story</button>
          </Link>
        </div>

        <div className="hero-right">
          <div className="hero-img-wrap">
            <div className="circle circle-yellow large"></div>
            <div className="circle circle-pink small"></div>
            <div className="circle circle-white tiny"></div>
            <div className="hero-dog-placeholder">
              {featured?.image
                ? <img className="img_dog" src={featured.image} alt={featured.name}
                    style={{objectFit:"contain", opacity:1 }}
                    onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="block"; }}
                  />
                : null}
              <span style={{ display: featured?.image ? "none" : "block" }}>🐕</span>
            </div>
            <button className="hero-arrow">›</button>
          </div>

          <div className="stats-bar">
            <div className="stat">
              <strong>{stats.total - stats.adopted || 236}</strong>
              <span>waiting for home</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <strong>{stats.adopted || 128}</strong>
              <span>adopted last year</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <strong>5</strong>
              <span>vaccinated</span>
            </div>
          </div>
        </div>
      </section>

      
      <section className="cta-section page-container">
        <div className="cta-card dark">
          <h2>Give a dog a forever home</h2>
          <p>Hundreds of dogs are waiting for someone like you. Browse available dogs and start the adoption process today.</p>
          <Link to="/adopt"><button className="btn-primary">Browse Dogs</button></Link>
        </div>
        <div className="cta-card light">
          <h2>Shop for your furry friend</h2>
          <p>Find everything your dog needs — from food to toys — in our curated pet store.</p>
          <Link to="/shop"><button className="btn-dark">Visit Shop</button></Link>
        </div>
      </section>
    </div>
  );
}
