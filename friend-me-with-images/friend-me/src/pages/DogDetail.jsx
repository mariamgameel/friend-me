import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDogById } from "../api/dogs";
import { createAdoptionRequest } from "../api/adoption";
import { useAuth } from "../context/AuthContext";
import "./DogDetail.css";

export default function DogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dog, setDog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reqLoading, setReqLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getDogById(id).then(res => setDog(res.data)).finally(() => setLoading(false));
  }, [id]);

  const handleAdopt = async () => {
    if (!user) return navigate("/login");
    setReqLoading(true);
    setMsg("");
    try {
      await createAdoptionRequest(id);
      setMsg("🎉 Adoption request sent! We'll get back to you soon.");
    } catch (err) {
      setMsg(err.response?.data?.msg || "Something went wrong.");
    } finally {
      setReqLoading(false);
    }
  };

  if (loading) return <div className="spinner" />;
  if (!dog) return <div className="page-container"><p>Dog not found.</p></div>;

  return (
    <div className="page-container dog-detail fade-up">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="detail-grid">
        <div className="detail-img-wrap" style={{ background: dog.isAdopted ? "#e8e8e8" : "var(--pink)" }}>
          {dog.image
            ? <img src={dog.image} alt={dog.name} onError={e=>{e.target.style.display="none"; e.target.parentNode.querySelector(".detail-emoji").style.display="flex";}} />
            : null}
          <span className="detail-emoji" style={{display: dog.image ? "none" : "flex"}}>🐕</span>
          <div className="circle circle-yellow large detail-circle-1"></div>
          <div className="circle detail-circle-2"></div>
        </div>
        <div className="detail-info">
          <div className="detail-badges">
            <span className="badge badge-pink">{dog.gender}</span>
            <span className="badge badge-yellow">{dog.healthStatus || "Healthy"}</span>
            {dog.isAdopted && <span className="badge badge-dark">Adopted</span>}
          </div>
          <h1>{dog.name}</h1>
          <p className="detail-meta">{dog.breed} · {dog.age} years old</p>
          <div className="detail-desc">
            <h3>About {dog.name}</h3>
            <p>{dog.description}</p>
          </div>
          {!dog.isAdopted && (
            <>
              {msg && <div className={`msg-box ${msg.startsWith("🎉") ? "success" : "error"}`}>{msg}</div>}
              <button className="btn-primary adopt-btn" onClick={handleAdopt} disabled={reqLoading}>
                {reqLoading ? "Sending..." : "Request to Adopt"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
