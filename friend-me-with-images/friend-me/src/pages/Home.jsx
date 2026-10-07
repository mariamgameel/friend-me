import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAllDogs } from "../api/dogs";
import { getProducts } from "../api/products";
import { sendContactMessage } from "../api/contact";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useToast } from "../components/ui/Toast";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getErrorMessage } from "../utils/error";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Skeleton from "../components/ui/Skeleton";
import FormField from "../components/ui/FormField";
import {
  Heart,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Send,
  HelpCircle,
  ShieldCheck,
  Smile
} from "lucide-react";
import "./Home.css";

const FAQS = [
  {
    q: "What is the adoption process at friend.me?",
    a: "Our process has three easy steps: browse our dogs online, fill out an adoption application detailing your home setup, and schedule a meet-and-greet at the shelter before finalizing the paperwork."
  },
  {
    q: "Are all dogs vaccinated and health checked?",
    a: "Yes! Every single dog in our sanctuary receives a comprehensive veterinary checkup, core vaccinations, preventative deworming, microchipping, and spay/neuter surgery before adoption."
  },
  {
    q: "Is there an adoption fee?",
    a: "We do not charge profit-driven fees. A nominal rescue contribution covers medical exams, vaccinations, and microchipping, ensuring our sanctuary can keep rescuing future dogs in need."
  },
  {
    q: "Can I adopt if I live in an apartment?",
    a: "Absolutely! Many of our dogs have low-to-medium energy levels or are compact breeds well-suited for apartment life. You can filter for 'Apartment Friendly' dogs on our Adopt page."
  },
  {
    q: "What if the dog isn't the right fit for my family?",
    a: "We offer a 2-week trial period with support from our animal behaviorist. If things do not work out, the dog is always welcomed back into our sanctuary with zero penalty."
  },
  {
    q: "How does the pet shop support rescue operations?",
    a: "100% of proceeds from our curated pet supplies go directly toward food, emergency veterinary care, and sanctuary maintenance for dogs awaiting forever families."
  }
];

export default function Home() {
  useDocumentTitle("Adopt a Dog & Pet Shop");

  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();

  const [availableDogs, setAvailableDogs] = useState([]);
  const [adoptedDogs, setAdoptedDogs] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [currentHeroIdx, setCurrentHeroIdx] = useState(0);

  const [stats, setStats] = useState({ total: 0, adopted: 0, vaccinated: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState(0);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: user?.username || "",
    email: user?.email || "",
    subject: "",
    body: ""
  });
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    // Fetch all dogs for hero, stats, and sections
    getAllDogs({ all: "true" })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        const total = list.length;
        const adopted = list.filter((d) => d.isAdopted);
        const available = list.filter((d) => !d.isAdopted);
        const vaccinated = list.filter(
          (d) => d.vaccinated || (d.healthStatus && /vaccin/i.test(d.healthStatus))
        ).length;

        setStats({ total, adopted: adopted.length, vaccinated });
        setAvailableDogs(available);
        setAdoptedDogs(adopted);
        setStatsLoading(false);
      })
      .catch(() => {
        setStatsError(true);
        setStatsLoading(false);
      });

    // Fetch featured products
    getProducts({ limit: 4 })
      .then((res) => {
        const prods = Array.isArray(res.data) ? res.data : [];
        setFeaturedProducts(prods.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  // Update contact form when user logs in
  useEffect(() => {
    if (user) {
      setContactForm((prev) => ({
        ...prev,
        name: prev.name || user.username,
        email: prev.email || user.email
      }));
    }
  }, [user]);

  // Cycle hero dog
  const handleNextHeroDog = useCallback(() => {
    if (availableDogs.length <= 1) return;
    setCurrentHeroIdx((prev) => (prev + 1) % availableDogs.length);
  }, [availableDogs.length]);

  const heroDog = availableDogs[currentHeroIdx] || null;

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      await sendContactMessage(contactForm);
      showToast("Thank you! Your message has been sent to our rescue team.", "success");
      setContactForm({
        name: user?.username || "",
        email: user?.email || "",
        subject: "",
        body: ""
      });
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to send message."), "error");
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* 1. HERO SECTION */}
      <section className="hero-section" aria-label="Hero Spotlight">
        <div className="hero-left">
          {heroDog ? (
            <div className="featured-dog-pill fade-up" key={heroDog._id}>
              <div className="featured-avatar">🐾</div>
              <div>
                <strong>{heroDog.name}</strong>
                <span>{heroDog.breed} · {heroDog.age} yrs</span>
              </div>
            </div>
          ) : (
            <div style={{ height: "42px" }} />
          )}

          <h1 className="hero-title">
            My name is <span className="hero-highlight">{heroDog?.name || "Max"}</span> and<br />
            I love to chase the toys.<br />
            <span className="hero-bold">I'm looking for<br />a new home.</span>
          </h1>

          <p className="hero-subtitle">
            Every rescued friend has a unique story, boundless affection, and a heart waiting for someone special like you.
          </p>

          <div className="hero-cta-group">
            <Link to={heroDog ? `/adopt/${heroDog._id}` : "/adopt"}>
              <Button variant="primary" size="lg" icon={<Sparkles size={18} />}>
                Check My Story
              </Button>
            </Link>
            <Link to="/adopt">
              <Button variant="outline" size="lg" style={{ color: "var(--white)", borderColor: "rgba(255,255,255,0.3)" }}>
                View All Dogs
              </Button>
            </Link>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-img-wrap">
            <div className="circle circle-amber large"></div>
            <div className="circle circle-neutral small"></div>
            <div className="circle circle-white tiny"></div>

            <div className="hero-dog-stage" key={heroDog?._id || "placeholder"}>
              {heroDog?.image ? (
                <img
                  className="img-dog-hero fade-up"
                  src={heroDog.image}
                  alt={heroDog.name}
                  loading="eager"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                />
              ) : null}
              <span className="dog-emoji-hero" style={{ display: heroDog?.image ? "none" : "block" }}>
                🐕
              </span>
            </div>

            {availableDogs.length > 1 && (
              <button
                className="hero-arrow-btn"
                onClick={handleNextHeroDog}
                aria-label="Cycle to next dog"
                title="Meet another dog"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Stats Bar */}
          <div className="stats-bar" aria-label="Key Sanctuary Statistics">
            <div className="stat">
              {statsLoading ? (
                <div className="stat-skeleton" />
              ) : (
                <strong>{statsError ? "—" : stats.total - stats.adopted}</strong>
              )}
              <span>waiting for home</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              {statsLoading ? (
                <div className="stat-skeleton" />
              ) : (
                <strong>{statsError ? "—" : stats.adopted}</strong>
              )}
              <span>adopted friends</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              {statsLoading ? (
                <div className="stat-skeleton" />
              ) : (
                <strong>{statsError ? "—" : stats.vaccinated}</strong>
              )}
              <span>vaccinated & healthy</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MEET OUR FRIENDS (4 available dogs) */}
      <section className="section-padded page-container" aria-label="Featured Dogs">
        <div className="section-header">
          <div>
            <span className="section-eyebrow">Ready for Adoption</span>
            <h2 className="section-title">Meet Our Rescued Friends</h2>
          </div>
          <Link to="/adopt" className="view-all-link">
            <span>Browse All {availableDogs.length} Dogs</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="dogs-home-grid">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" />)
          ) : (
            availableDogs.slice(0, 4).map((dog) => (
              <div key={dog._id} className="home-dog-card card">
                <div className="home-dog-img-box">
                  {dog.image ? (
                    <img src={dog.image} alt={dog.name} loading="lazy" />
                  ) : (
                    <span>🐕</span>
                  )}
                  <button
                    className={`fav-heart-btn ${isFavorite(dog._id) ? "active" : ""}`}
                    onClick={() => toggleFavorite(dog)}
                    aria-label={`Favorite ${dog.name}`}
                  >
                    <Heart size={18} fill={isFavorite(dog._id) ? "var(--primary)" : "none"} />
                  </button>
                </div>
                <div className="home-dog-body">
                  <div className="home-dog-tags">
                    <Badge variant="pink">{dog.gender}</Badge>
                    <Badge variant="neutral">{dog.size}</Badge>
                    <Badge variant="yellow">{dog.energyLevel} Energy</Badge>
                  </div>
                  <h3>{dog.name}</h3>
                  <p className="home-dog-sub">
                    {dog.breed} · {dog.age} {dog.age === 1 ? "year" : "years"} old
                  </p>
                  <p className="home-dog-desc">{dog.description?.slice(0, 80)}...</p>
                  <div className="home-dog-action">
                    <Link to={`/adopt/${dog._id}`} style={{ width: "100%" }}>
                      <Button variant="outline" size="sm" style={{ width: "100%", justifyContent: "center" }}>
                        Meet {dog.name}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 3. HOW ADOPTION WORKS (3 Steps) */}
      <section id="how-it-works" className="how-it-works-section" aria-label="How Adoption Works">
        <div className="page-container">
          <div className="section-header center">
            <span className="section-eyebrow">The Journey Home</span>
            <h2 className="section-title">How Adoption Works</h2>
            <p className="section-subtitle">
              We guide you every step of the way to ensure a seamless transition for both you and your new furry family member.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card card">
              <div className="step-number">01</div>
              <div className="step-icon">
                <Smile size={28} />
              </div>
              <h3>Browse & Match</h3>
              <p>
                Filter by size, energy, and kid compatibility to discover dogs that match your lifestyle and household rhythm.
              </p>
            </div>

            <div className="step-card card">
              <div className="step-number">02</div>
              <div className="step-icon">
                <ShieldCheck size={28} />
              </div>
              <h3>Submit Application</h3>
              <p>
                Complete our straightforward adoption form detailing your home, yard, and experience with pets.
              </p>
            </div>

            <div className="step-card card">
              <div className="step-number">03</div>
              <div className="step-icon">
                <Heart size={28} />
              </div>
              <h3>Meet & Welcome Home</h3>
              <p>
                Visit the sanctuary for an affectionate meet-and-greet, finalize simple paperwork, and bring your best friend home!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SUCCESS STORIES (Adopted Dogs Row) */}
      {adoptedDogs.length > 0 && (
        <section className="section-padded page-container" aria-label="Success Stories">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">Forever Homes</span>
              <h2 className="section-title">Happy Success Stories</h2>
            </div>
          </div>

          <div className="success-stories-grid">
            {adoptedDogs.slice(0, 3).map((dog) => (
              <div key={dog._id} className="success-story-card card">
                <div className="story-img-wrap">
                  <img src={dog.image} alt={dog.name} loading="lazy" />
                  <div className="story-badge">
                    <CheckCircle2 size={14} />
                    <span>Happily Adopted</span>
                  </div>
                </div>
                <div className="story-content">
                  <h3>{dog.name}'s Journey</h3>
                  <p className="story-breed">{dog.breed} · {dog.shelterLocation || "Rescue Sanctuary"}</p>
                  <p className="story-quote">"{dog.description}"</p>
                  <div className="story-footer">
                    <Calendar size={14} color="var(--gray)" />
                    <span>Adopted {dog.adoptedAt ? new Date(dog.adoptedAt).toLocaleDateString() : "Recently"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. PET SHOP TEASER (4 Featured Products) */}
      <section className="shop-teaser-section" aria-label="Pet Supplies Shop">
        <div className="page-container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">Curated Pet Supplies</span>
              <h2 className="section-title">Support Our Rescue Store</h2>
            </div>
            <Link to="/shop" className="view-all-link">
              <span>Visit Complete Shop</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="shop-teaser-grid">
            {featuredProducts.map((product) => (
              <div key={product._id} className="teaser-product-card card">
                <div className="product-img-box">
                  {product.image ? (
                    <img src={product.image} alt={product.name} loading="lazy" />
                  ) : (
                    <span>🦴</span>
                  )}
                  <span className="product-cat-pill">{product.category || "Supplies"}</span>
                </div>
                <div className="product-info-box">
                  <h4>{product.name}</h4>
                  <div className="product-price-row">
                    <span className="product-price-val">${Number(product.price).toFixed(2)}</span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        addToCart(product, 1);
                        showToast(`Added ${product.name} to cart!`, "success");
                      }}
                      icon={<ShoppingBag size={14} />}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section id="faq" className="section-padded page-container" aria-label="Frequently Asked Questions">
        <div className="section-header center">
          <span className="section-eyebrow">Got Questions?</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Everything you need to know about adopting, preparing your home, and joining the friend.me community.
          </p>
        </div>

        <div className="faq-container">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className={`faq-card card ${isOpen ? "open" : ""}`}>
                <button
                  className="faq-question-btn"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-q-text">{faq.q}</span>
                  <ChevronDown size={18} className={`faq-chevron ${isOpen ? "rotated" : ""}`} />
                </button>
                {isOpen && (
                  <div className="faq-answer fade-up">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. CONTACT SECTION */}
      <section id="contact" className="contact-section" aria-label="Contact Rescue Team">
        <div className="page-container">
          <div className="contact-grid">
            <div className="contact-info-panel">
              <span className="section-eyebrow" style={{ color: "var(--primary)" }}>We're Here for You</span>
              <h2>Have Questions or Want to Volunteer?</h2>
              <p>
                Whether you want to learn more about a specific dog, volunteer at our shelter, or donate supplies, our team would love to hear from you.
              </p>
              <div className="contact-highlights">
                <div className="contact-highlight-item">
                  <div className="highlight-icon"><ShieldCheck size={20} /></div>
                  <div>
                    <strong>Responsive Rescue Team</strong>
                    <span>We reply to all inquiries within 24 hours.</span>
                  </div>
                </div>
                <div className="contact-highlight-item">
                  <div className="highlight-icon"><Heart size={20} /></div>
                  <div>
                    <strong>Sanctuary Visits</strong>
                    <span>Schedule an in-person tour or volunteer day.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-card card">
              <h3>Send Us a Message</h3>
              <form onSubmit={handleContactSubmit}>
                <FormField id="c-name" label="Your Name" required>
                  <input
                    id="c-name"
                    placeholder="Jane Doe"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                  />
                </FormField>

                <FormField id="c-email" label="Your Email" required>
                  <input
                    id="c-email"
                    type="email"
                    placeholder="jane@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                  />
                </FormField>

                <FormField id="c-subject" label="Subject" required>
                  <input
                    id="c-subject"
                    placeholder="Adoption inquiry about Max..."
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    required
                  />
                </FormField>

                <FormField id="c-body" label="Message" required>
                  <textarea
                    id="c-body"
                    rows={4}
                    placeholder="Tell us what's on your mind..."
                    value={contactForm.body}
                    onChange={(e) => setContactForm({ ...contactForm, body: e.target.value })}
                    required
                  />
                </FormField>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={contactLoading}
                  icon={<Send size={16} />}
                  style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
