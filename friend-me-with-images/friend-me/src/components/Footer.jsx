import React from "react";
import { Link } from "react-router-dom";
import { Heart, Mail, Phone, MapPin } from "lucide-react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container page-container">
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-brand">
              <span className="brand-dot">🐾</span>
              <span>friend.me</span>
            </Link>
            <p className="footer-blurb">
              Connecting rescue dogs with compassionate forever homes. Every dog deserves warmth, safety, and lifelong love.
            </p>
            <div className="footer-socials">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X / Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l11.733 16h4.267l-11.733 -16z"/>
                  <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>
                </svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="Github">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links-list">
              <li><Link to="/adopt">Adopt a Dog</Link></li>
              <li><Link to="/shop">Pet Supplies</Link></li>
              <li><a href="/#faq">Adoption FAQs</a></li>
              <li><a href="/#how-it-works">How It Works</a></li>
              <li><a href="/#contact">Contact Support</a></li>
            </ul>
          </div>

          {/* Adoption Categories */}
          <div className="footer-col">
            <h4>Find by Size</h4>
            <ul className="footer-links-list">
              <li><Link to="/adopt?size=Small">Small Dogs (Apartment Friendly)</Link></li>
              <li><Link to="/adopt?size=Medium">Medium Companions</Link></li>
              <li><Link to="/adopt?size=Large">Large & Gentle Giants</Link></li>
              <li><Link to="/adopt?goodWithKids=true">Family & Kid Friendly</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="footer-col">
            <h4>Rescue Sanctuary</h4>
            <div className="footer-contact-items">
              <div className="footer-contact-item">
                <MapPin size={16} />
                <span>104 Paw Haven Way, Downtown Shelter</span>
              </div>
              <div className="footer-contact-item">
                <Phone size={16} />
                <span>+1 (800) 555-PAWS</span>
              </div>
              <div className="footer-contact-item">
                <Mail size={16} />
                <span>hello@friend.me</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} friend.me — Built with love for rescued dogs everywhere.</p>
          <div className="footer-bottom-links">
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Terms of Adoption</span>
            <span>·</span>
            <span>Animal Welfare Commitment</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
