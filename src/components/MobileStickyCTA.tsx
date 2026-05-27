import { Phone, MessageCircle, Menu, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { config } from '../config/restaurantConfig';
import './MobileStickyCTA.css';

export default function MobileStickyCTA() {
  return (
    <div className="mobile-sticky-cta">
      <a href={`tel:${config.primaryPhone}`} className="cta-item">
        <Phone size={24} />
        <span>Call</span>
      </a>
      <a 
        href={`https://wa.me/91${config.whatsappNumber}?text=Hello, I want to know more about ${config.restaurantName}.`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="cta-item"
      >
        <MessageCircle size={24} />
        <span>WhatsApp</span>
      </a>
      <Link to="/menu" className="cta-item">
        <Menu size={24} />
        <span>Menu</span>
      </Link>
      <a 
        href={config.tasteOrderUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="cta-item cta-order"
      >
        <ExternalLink size={24} />
        <span>Order</span>
      </a>
    </div>
  );
}
