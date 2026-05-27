import { Link } from 'react-router-dom';
import { Phone, MessageCircle, MapPin, ExternalLink, Share2 } from 'lucide-react';
import { config } from '../config/restaurantConfig';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src={config.logoPath} alt={config.restaurantName} className="footer-logo" />
          <p className="footer-tagline">Serving Rampurhat since {config.foundedYear}</p>
        </div>

        <div className="footer-links">
          <h3 className="footer-title">Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/menu">Menu</Link></li>
            <li><Link to="/#gallery">Gallery</Link></li>
            <li><Link to="/#about">About</Link></li>
            <li><Link to="/#contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h3 className="footer-title">Connect with us</h3>
          <ul>
            <li>
              <a href={`tel:${config.primaryPhone}`}>
                <Phone size={18} /> {config.primaryPhone}
              </a>
            </li>
            <li>
              <a href={`https://wa.me/91${config.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={18} /> WhatsApp
              </a>
            </li>
            <li>
              <a href={config.facebookUrl} target="_blank" rel="noopener noreferrer">
                <Share2 size={18} /> Facebook
              </a>
            </li>
            <li>
              <a href={config.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <MapPin size={18} /> Get Directions
              </a>
            </li>
            <li>
              <a href={config.tasteOrderUrl} target="_blank" rel="noopener noreferrer" className="text-orange">
                <ExternalLink size={18} /> Order from Taste
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} {config.restaurantName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
