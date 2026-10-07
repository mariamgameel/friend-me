import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyRequests, cancelMyRequest } from "../api/adoption";
import { useToast } from "../components/ui/Toast";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getErrorMessage } from "../utils/error";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Calendar,
  Home,
  Phone,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import "./MyRequests.css";

export default function MyRequests() {
  useDocumentTitle("My Adoption Requests");

  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancel dialog state
  const [cancellingRequest, setCancellingRequest] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getMyRequests();
      const list = Array.isArray(res.data) ? res.data : [];
      setRequests(list);
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to load adoption applications."), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancel = async () => {
    if (!cancellingRequest) return;
    setCancelLoading(true);
    try {
      await cancelMyRequest(cancellingRequest._id);
      showToast("Application cancelled.", "info");
      setCancellingRequest(null);
      fetchRequests();
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to cancel request."), "error");
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return <Badge variant="green">Approved ✓</Badge>;
      case "Rejected":
        return <Badge variant="red">Rejected ✕</Badge>;
      case "Cancelled":
        return <Badge variant="neutral">Cancelled</Badge>;
      default:
        return <Badge variant="yellow">Pending Review</Badge>;
    }
  };

  return (
    <div className="page-container my-requests-page fade-up">
      <div className="my-requests-header">
        <h1>My Adoption Requests</h1>
        <p>Track the status of your applications and communicate with our shelter team.</p>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" height="180px" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<FileText size={44} color="var(--primary)" />}
          title="No Adoption Applications Yet"
          description="You haven't requested to adopt any dogs. Browse our available companions and submit an application today!"
          actionLabel="Browse Available Dogs"
          onAction={() => (window.location.href = "/adopt")}
        />
      ) : (
        <div className="requests-cards-list">
          {requests.map((req) => {
            const dog = req.dog || {};
            return (
              <div key={req._id} className="request-card card">
                <div className="request-card-left">
                  <div className="req-dog-thumb">
                    {dog.image ? (
                      <img src={dog.image} alt={dog.name} />
                    ) : (
                      <span>🐕</span>
                    )}
                  </div>
                  <div className="req-dog-info">
                    <div className="req-dog-title-row">
                      <h3>{dog.name || "Rescue Dog"}</h3>
                      {getStatusBadge(req.status)}
                    </div>
                    <p className="req-dog-meta">
                      {dog.breed} · {dog.gender} · {dog.age} {dog.age === 1 ? "yr" : "yrs"}
                    </p>
                    <p className="req-submitted-date">
                      Submitted on {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="request-card-details">
                  {/* Status Timeline */}
                  {req.statusHistory && req.statusHistory.length > 0 && (
                    <div className="timeline-box">
                      <span className="timeline-title">Application Timeline:</span>
                      <div className="timeline-track">
                        {req.statusHistory.map((h, idx) => (
                          <div key={idx} className="timeline-node">
                            <span className="node-dot" />
                            <div className="node-info">
                              <strong>{h.status}</strong>
                              <span>{new Date(h.at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Note if present */}
                  {req.adminNote && (
                    <div className="req-admin-note">
                      <strong>Shelter Note:</strong>
                      <p>{req.adminNote}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="req-action-bar">
                    {dog._id && (
                      <Link to={`/adopt/${dog._id}`}>
                        <Button variant="outline" size="sm">
                          View Dog Profile
                        </Button>
                      </Link>
                    )}
                    {req.status === "Pending" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        style={{ color: "var(--red)" }}
                        onClick={() => setCancellingRequest(req)}
                      >
                        Cancel Application
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Cancel Dialog */}
      <ConfirmDialog
        isOpen={Boolean(cancellingRequest)}
        onClose={() => setCancellingRequest(null)}
        onConfirm={handleCancel}
        title="Cancel Adoption Request?"
        message={`Are you sure you want to cancel your adoption application for ${
          cancellingRequest?.dog?.name || "this dog"
        }?`}
        confirmLabel="Cancel Request"
        variant="danger"
        loading={cancelLoading}
      />
    </div>
  );
}
