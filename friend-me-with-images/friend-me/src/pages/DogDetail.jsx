import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { getDogById, getAllDogs } from "../api/dogs";
import { createAdoptionRequest, getMyRequests, cancelMyRequest } from "../api/adoption";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { useToast } from "../components/ui/Toast";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getErrorMessage } from "../utils/error";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import FormField from "../components/ui/FormField";
import Skeleton from "../components/ui/Skeleton";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
  Heart,
  Share2,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Home as HomeIcon,
  Users,
  Smile,
  AlertCircle,
  Clock,
  Sparkles,
  Phone,
  MessageSquare
} from "lucide-react";
import "./DogDetail.css";

const INITIAL_APPLICATION = {
  housingType: "House",
  hasYard: true,
  ownsOrRents: "Own",
  otherPets: "",
  experience: "Some",
  hoursAlonePerDay: 4,
  phone: "",
  message: ""
};

export default function DogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();

  const [dog, setDog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [similarDogs, setSimilarDogs] = useState([]);

  // Existing user request for this dog (if any)
  const [userRequest, setUserRequest] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Adoption Application Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Housing, 2: Lifestyle, 3: Review
  const [appForm, setAppForm] = useState(INITIAL_APPLICATION);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useDocumentTitle(dog ? `${dog.name} - Adopt a Dog` : "Dog Details");

  useEffect(() => {
    setLoading(true);
    getDogById(id)
      .then((res) => {
        const d = res.data;
        setDog(d);
        setSelectedImage(d.images?.[0] || d.image || null);

        // Fetch similar dogs (same breed or size)
        getAllDogs({ limit: 4, status: "available" }).then((simRes) => {
          const list = Array.isArray(simRes.data) ? simRes.data : [];
          setSimilarDogs(list.filter((s) => s._id !== id).slice(0, 3));
        });
      })
      .catch((err) => {
        showToast(getErrorMessage(err, "Failed to load dog details"), "error");
        setDog(null);
      })
      .finally(() => setLoading(false));

    // Check if user has an existing request for this dog
    if (user) {
      getMyRequests()
        .then((res) => {
          const requests = Array.isArray(res.data) ? res.data : [];
          const match = requests.find((r) => (r.dog?._id || r.dog) === id);
          setUserRequest(match || null);
        })
        .catch(() => {});
    }
  }, [id, user]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard! Share with friends 🐶", "success");
    } else {
      showToast(window.location.href, "info");
    }
  };

  const handleOpenAdoptModal = () => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    setStep(1);
    setFormErrors({});
    setModalOpen(true);
  };

  const validateStep = (currentStep) => {
    const errors = {};
    if (currentStep === 1) {
      if (!appForm.housingType) errors.housingType = "Please select your housing type";
      if (!appForm.ownsOrRents) errors.ownsOrRents = "Please select own or rent";
    }
    if (currentStep === 2) {
      if (!appForm.phone || appForm.phone.trim().length < 7) {
        errors.phone = "Please enter a valid phone number (at least 7 digits)";
      }
      if (appForm.hoursAlonePerDay < 0 || appForm.hoursAlonePerDay > 24) {
        errors.hoursAlonePerDay = "Hours must be between 0 and 24";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handleSubmitApplication = async () => {
    setSubmitting(true);
    try {
      const res = await createAdoptionRequest(dog._id, appForm);
      showToast("Adoption application submitted! Our shelter will review it shortly. 🎉", "success");
      setUserRequest(res.data);
      setModalOpen(false);
      setAppForm(INITIAL_APPLICATION);
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to submit application."), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!userRequest) return;
    setCancelLoading(true);
    try {
      await cancelMyRequest(userRequest._id);
      showToast("Adoption request cancelled successfully.", "info");
      setUserRequest((prev) => ({ ...prev, status: "Cancelled" }));
      setCancelModalOpen(false);
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to cancel request."), "error");
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ padding: "40px 24px" }}>
        <Skeleton variant="text" width="120px" height="36px" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginTop: "24px" }}>
          <Skeleton variant="card" height="460px" />
          <div>
            <Skeleton variant="text" width="60%" height="40px" />
            <Skeleton variant="text" width="40%" height="24px" />
            <Skeleton variant="rect" height="120px" style={{ margin: "24px 0" }} />
            <Skeleton variant="rect" height="180px" />
          </div>
        </div>
      </div>
    );
  }

  if (!dog) {
    return (
      <div className="page-container" style={{ textAlign: "center", padding: "80px 24px" }}>
        <h2>Dog Not Found</h2>
        <p style={{ color: "var(--gray)", margin: "16px 0 24px 0" }}>
          The dog you are looking for is no longer in our sanctuary records.
        </p>
        <Link to="/adopt">
          <Button variant="primary">Browse Available Dogs</Button>
        </Link>
      </div>
    );
  }

  const galleryImages = dog.images && dog.images.length > 0 ? dog.images : [dog.image].filter(Boolean);
  const fav = isFavorite(dog._id);

  return (
    <div className="page-container dog-detail-page fade-up">
      {/* Back button */}
      <button className="back-link-btn" onClick={() => navigate(-1)} aria-label="Go Back">
        <ArrowLeft size={16} />
        <span>Back to Dogs</span>
      </button>

      <div className="detail-hero-layout">
        {/* Left Column: Gallery */}
        <div className="detail-gallery-col">
          <div className="detail-main-img-wrap card">
            {selectedImage ? (
              <img src={selectedImage} alt={dog.name} className="detail-main-img" />
            ) : (
              <div className="detail-img-placeholder">🐕</div>
            )}

            {dog.isAdopted && (
              <div className="detail-adopted-ribbon">
                <CheckCircle2 size={16} />
                <span>Adopted</span>
              </div>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="gallery-thumbnails">
              {galleryImages.map((imgUrl, i) => (
                <button
                  key={i}
                  className={`gallery-thumb-btn ${selectedImage === imgUrl ? "selected" : ""}`}
                  onClick={() => setSelectedImage(imgUrl)}
                  aria-label={`View photo ${i + 1}`}
                >
                  <img src={imgUrl} alt={`${dog.name} thumbnail ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Dog Details & Actions */}
        <div className="detail-info-col">
          <div className="detail-header">
            <div>
              <div className="detail-badge-pills">
                <Badge variant={dog.isAdopted ? "dark" : "green"}>
                  {dog.isAdopted ? "Adopted" : "Available for Adoption"}
                </Badge>
                <Badge variant="neutral">{dog.shelterLocation || "Rescue Sanctuary"}</Badge>
              </div>
              <h1 className="detail-dog-title">{dog.name}</h1>
              <p className="detail-dog-breed">
                {dog.breed} · {dog.age} {dog.age === 1 ? "year" : "years"} old
              </p>
            </div>

            <div className="detail-header-actions">
              <button
                className={`detail-icon-btn ${fav ? "active" : ""}`}
                onClick={() => toggleFavorite(dog)}
                aria-label={`Save ${dog.name} to favorites`}
                title="Save Favorite"
              >
                <Heart size={20} fill={fav ? "var(--primary)" : "none"} />
              </button>
              <button
                className="detail-icon-btn"
                onClick={handleShare}
                aria-label="Share dog link"
                title="Share link"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Quick Facts Grid with Icons */}
          <div className="quick-facts-card card">
            <h3>Quick Facts</h3>
            <div className="facts-grid">
              <div className="fact-item">
                <span className="fact-label">Gender</span>
                <strong className="fact-value">{dog.gender}</strong>
              </div>
              <div className="fact-item">
                <span className="fact-label">Size</span>
                <strong className="fact-value">{dog.size || "Medium"}</strong>
              </div>
              <div className="fact-item">
                <span className="fact-label">Energy Level</span>
                <strong className="fact-value">{dog.energyLevel || "Medium"}</strong>
              </div>
              <div className="fact-item">
                <span className="fact-label">Vaccinated</span>
                <strong className="fact-value">{dog.vaccinated ? "Yes ✓" : "No"}</strong>
              </div>
              <div className="fact-item">
                <span className="fact-label">Neutered / Spayed</span>
                <strong className="fact-value">{dog.neutered ? "Yes ✓" : "No"}</strong>
              </div>
              <div className="fact-item">
                <span className="fact-label">Kids Friendly</span>
                <strong className="fact-value">{dog.goodWithKids ? "Yes ✓" : "No"}</strong>
              </div>
              <div className="fact-item">
                <span className="fact-label">Dogs Friendly</span>
                <strong className="fact-value">{dog.goodWithDogs ? "Yes ✓" : "No"}</strong>
              </div>
              <div className="fact-item">
                <span className="fact-label">Cats Friendly</span>
                <strong className="fact-value">{dog.goodWithCats ? "Yes ✓" : "No"}</strong>
              </div>
            </div>
          </div>

          {/* Personality Tags */}
          {dog.personalityTags && dog.personalityTags.length > 0 && (
            <div className="detail-tags-section">
              <h4>Personality Traits</h4>
              <div className="tags-chip-list">
                {dog.personalityTags.map((tag, idx) => (
                  <span key={idx} className="personality-chip">
                    <Sparkles size={13} color="var(--primary)" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* About Section */}
          <div className="detail-about-section">
            <h4>About {dog.name}</h4>
            <p className="detail-description">{dog.description}</p>
            {dog.healthStatus && (
              <p className="detail-health">
                <strong>Medical Notes:</strong> {dog.healthStatus}
              </p>
            )}
          </div>

          {/* Adoption Action or Status Display */}
          <div className="detail-action-box card">
            {dog.isAdopted ? (
              <div className="adopted-status-box">
                <CheckCircle2 size={24} color="var(--primary)" />
                <div>
                  <strong>{dog.name} has found their forever home!</strong>
                  <p>Check out other dogs looking for loving families.</p>
                </div>
              </div>
            ) : userRequest && userRequest.status !== "Rejected" && userRequest.status !== "Cancelled" ? (
              <div className="existing-request-box">
                <div className="existing-req-header">
                  <div>
                    <span className="req-sub-label">Your Application Status:</span>
                    <Badge
                      variant={
                        userRequest.status === "Approved"
                          ? "green"
                          : userRequest.status === "Pending"
                          ? "yellow"
                          : "red"
                      }
                    >
                      {userRequest.status}
                    </Badge>
                  </div>
                  {userRequest.status === "Pending" && (
                    <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(true)}>
                      Cancel Application
                    </Button>
                  )}
                </div>
                <p className="req-info-note">
                  {userRequest.status === "Pending"
                    ? "Our adoption team is currently reviewing your home setup. We will email you with updates."
                    : "Congratulations! Your application has been approved. Please contact the shelter to schedule pickup."}
                </p>
                {userRequest.adminNote && (
                  <p className="admin-note-display">
                    <strong>Shelter Note:</strong> {userRequest.adminNote}
                  </p>
                )}
              </div>
            ) : (
              <div className="apply-cta-row">
                <div>
                  <h4>Ready to welcome {dog.name} home?</h4>
                  <p>Takes just 2 minutes to submit an adoption application.</p>
                </div>
                <Button variant="primary" size="lg" onClick={handleOpenAdoptModal}>
                  Request to Adopt
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Similar Dogs Row */}
      {similarDogs.length > 0 && (
        <section className="similar-dogs-section" aria-label="Similar Available Dogs">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">Other Furry Friends</span>
              <h2 className="section-title">Similar Dogs Looking for a Home</h2>
            </div>
            <Link to="/adopt" className="view-all-link">
              <span>View All Dogs →</span>
            </Link>
          </div>

          <div className="similar-dogs-grid">
            {similarDogs.map((simDog) => (
              <Link key={simDog._id} to={`/adopt/${simDog._id}`} className="similar-dog-card card">
                <div className="sim-img-wrap">
                  {simDog.image ? (
                    <img src={simDog.image} alt={simDog.name} loading="lazy" />
                  ) : (
                    <span>🐕</span>
                  )}
                </div>
                <div className="sim-info">
                  <h4>{simDog.name}</h4>
                  <p>{simDog.breed} · {simDog.age} yrs</p>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <Badge variant="pink">{simDog.gender}</Badge>
                    <Badge variant="neutral">{simDog.size}</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 2-STEP ADOPTION APPLICATION MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Adoption Application for ${dog.name}`}
        maxWidth="620px"
      >
        {/* Step Progress Indicator */}
        <div className="modal-steps-indicator">
          <div className={`step-item ${step >= 1 ? "active" : ""}`}>
            <span className="step-circle">1</span>
            <span>Home & Yard</span>
          </div>
          <div className="step-line" />
          <div className={`step-item ${step >= 2 ? "active" : ""}`}>
            <span className="step-circle">2</span>
            <span>Lifestyle & Care</span>
          </div>
          <div className="step-line" />
          <div className={`step-item ${step >= 3 ? "active" : ""}`}>
            <span className="step-circle">3</span>
            <span>Review & Submit</span>
          </div>
        </div>

        {/* STEP 1: HOUSING */}
        {step === 1 && (
          <div className="modal-step-body fade-up">
            <FormField id="m-housing" label="What type of home do you live in?" required error={formErrors.housingType}>
              <select
                id="m-housing"
                value={appForm.housingType}
                onChange={(e) => setAppForm({ ...appForm, housingType: e.target.value })}
              >
                <option value="House">Single Family House</option>
                <option value="Apartment">Apartment / Condo</option>
                <option value="Other">Other / Rural Farm</option>
              </select>
            </FormField>

            <FormField id="m-owns" label="Do you own or rent your home?" required error={formErrors.ownsOrRents}>
              <div className="radio-group-row">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="ownsOrRents"
                    value="Own"
                    checked={appForm.ownsOrRents === "Own"}
                    onChange={(e) => setAppForm({ ...appForm, ownsOrRents: e.target.value })}
                  />
                  <span>Own</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="ownsOrRents"
                    value="Rent"
                    checked={appForm.ownsOrRents === "Rent"}
                    onChange={(e) => setAppForm({ ...appForm, ownsOrRents: e.target.value })}
                  />
                  <span>Rent</span>
                </label>
              </div>
            </FormField>

            <FormField id="m-yard" label="Do you have a fenced yard?" required>
              <div className="radio-group-row">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="hasYard"
                    checked={appForm.hasYard === true}
                    onChange={() => setAppForm({ ...appForm, hasYard: true })}
                  />
                  <span>Yes, fenced yard</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="hasYard"
                    checked={appForm.hasYard === false}
                    onChange={() => setAppForm({ ...appForm, hasYard: false })}
                  />
                  <span>No yard / Shared park</span>
                </label>
              </div>
            </FormField>

            <FormField id="m-pets" label="Do you currently have other pets? (Optional)" hint="e.g. 1 cat, 1 senior golden retriever">
              <input
                id="m-pets"
                placeholder="Mention any dogs, cats, or other animals..."
                value={appForm.otherPets}
                onChange={(e) => setAppForm({ ...appForm, otherPets: e.target.value })}
              />
            </FormField>

            <div className="modal-btn-row">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleNextStep}>
                Continue to Step 2 →
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: EXPERIENCE & CONTACT */}
        {step === 2 && (
          <div className="modal-step-body fade-up">
            <FormField id="m-exp" label="Experience with dogs" required>
              <select
                id="m-exp"
                value={appForm.experience}
                onChange={(e) => setAppForm({ ...appForm, experience: e.target.value })}
              >
                <option value="None">First-time dog guardian</option>
                <option value="Some">Have lived with dogs before</option>
                <option value="Experienced">Experienced dog handler / trainer</option>
              </select>
            </FormField>

            <FormField
              id="m-hours"
              label="Estimated hours dog will be alone per day"
              required
              error={formErrors.hoursAlonePerDay}
            >
              <input
                id="m-hours"
                type="number"
                min="0"
                max="24"
                value={appForm.hoursAlonePerDay}
                onChange={(e) => setAppForm({ ...appForm, hoursAlonePerDay: Number(e.target.value) })}
              />
            </FormField>

            <FormField id="m-phone" label="Contact Phone Number" required error={formErrors.phone}>
              <input
                id="m-phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={appForm.phone}
                onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })}
                required
              />
            </FormField>

            <FormField id="m-message" label="Personal Message to Shelter (Optional, max 500 chars)">
              <textarea
                id="m-message"
                rows={3}
                maxLength={500}
                placeholder="Tell us why you would be a great fit for this dog..."
                value={appForm.message}
                onChange={(e) => setAppForm({ ...appForm, message: e.target.value })}
              />
            </FormField>

            <div className="modal-btn-row">
              <Button variant="outline" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <Button variant="primary" onClick={handleNextStep}>
                Review Application →
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & CONFIRM */}
        {step === 3 && (
          <div className="modal-step-body fade-up">
            <div className="review-summary-card card">
              <div className="review-row">
                <span>Dog:</span>
                <strong>{dog.name} ({dog.breed})</strong>
              </div>
              <div className="review-row">
                <span>Housing:</span>
                <strong>{appForm.housingType} ({appForm.ownsOrRents}) · {appForm.hasYard ? "Fenced Yard" : "No Yard"}</strong>
              </div>
              <div className="review-row">
                <span>Other Pets:</span>
                <strong>{appForm.otherPets || "None"}</strong>
              </div>
              <div className="review-row">
                <span>Experience:</span>
                <strong>{appForm.experience}</strong>
              </div>
              <div className="review-row">
                <span>Hours Alone:</span>
                <strong>{appForm.hoursAlonePerDay} hours/day</strong>
              </div>
              <div className="review-row">
                <span>Phone:</span>
                <strong>{appForm.phone}</strong>
              </div>
              {appForm.message && (
                <div className="review-row message-row">
                  <span>Note:</span>
                  <p>"{appForm.message}"</p>
                </div>
              )}
            </div>

            <p style={{ fontSize: "var(--font-xs)", color: "var(--gray)", margin: "16px 0", lineHeight: 1.5 }}>
              By submitting this application, you confirm that all provided details are true and accurate to the best of your knowledge.
            </p>

            <div className="modal-btn-row">
              <Button variant="outline" onClick={() => setStep(2)} disabled={submitting}>
                ← Back to Edit
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitApplication}
                loading={submitting}
              >
                Confirm & Submit Application
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Request Confirmation Dialog */}
      <ConfirmDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelRequest}
        title="Cancel Adoption Application?"
        message={`Are you sure you want to cancel your adoption request for ${dog.name}? You can re-apply in the future if your circumstances change.`}
        confirmLabel="Yes, Cancel Application"
        variant="danger"
        loading={cancelLoading}
      />
    </div>
  );
}
