import { Phone, MessageCircle } from 'lucide-react';
import { config } from '../config/restaurantConfig';
import { LiquidMetalButton } from './ui/liquid-metal-button';
import './ConnectSection.css';

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);



export default function ConnectSection() {
  return (
    <section className="connect-section">
      <div className="container connect-container">
        <span className="connect-stay-updated">STAY UPDATED</span>
        <h2 className="connect-heading">
          Follow & <span className="text-gold">Connect</span>
        </h2>

        <div className="connect-buttons-row">

          <LiquidMetalButton href={config.facebookUrl} target="_blank" rel="noopener noreferrer" variant="facebook">
            <FacebookIcon /> Facebook
          </LiquidMetalButton>

          <LiquidMetalButton href={`https://wa.me/91${config.whatsappNumber}?text=Hello`} target="_blank" rel="noopener noreferrer" variant="whatsapp">
            <MessageCircle size={18} /> WhatsApp
          </LiquidMetalButton>

          <LiquidMetalButton href={`tel:${config.primaryPhone}`} variant="wood">
            <Phone size={18} /> Call Restaurant
          </LiquidMetalButton>
        </div>
      </div>
    </section>
  );
}
