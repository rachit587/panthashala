import { MapPin, Clock, Phone, MessageCircle } from 'lucide-react';
import { config } from '../config/restaurantConfig';
import { LiquidMetalButton } from './ui/liquid-metal-button';
import './ContactSection.css';

export default function ContactSection() {
  return (
    <section id="contact" className="contact-section">
      <div className="container contact-container">
        <div className="contact-info">
          <h2 className="section-heading" style={{ left: 0, transform: 'none' }}>Visit Us</h2>
          
          <div className="info-group">
            <MapPin className="info-icon" />
            <div>
              <h3>Location</h3>
              <p>{config.location}</p>
            </div>
          </div>
          
          <div className="info-group">
            <Clock className="info-icon" />
            <div>
              <h3>Hours</h3>
              <p>
                {config.openingHours.split(/(\d+:\d+)/).map((part, i) => 
                  /\d+:\d+/.test(part) ? <span key={i} className="contact-number">{part}</span> : part
                )}
              </p>
            </div>
          </div>
          
          <div className="info-group">
            <Phone className="info-icon" />
            <div>
              <h3>Call</h3>
              <p><a href={`tel:${config.primaryPhone}`} className="contact-number">{config.primaryPhone}</a></p>
            </div>
          </div>
          
          <div className="info-group">
            <MessageCircle className="info-icon" />
            <div>
              <h3>WhatsApp</h3>
              <p><a href={`https://wa.me/91${config.whatsappNumber}`} className="contact-number">{config.whatsappNumber}</a></p>
            </div>
          </div>

          <LiquidMetalButton
            href={config.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            className="mt-4"
          >
            Get Directions
          </LiquidMetalButton>
        </div>
        
        <div className="contact-map">
          <iframe 
            src="https://maps.google.com/maps?q=Panthashala%20Restaurant,%20Rampurhat,%20West%20Bengal&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Panthashala Restaurant Map"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
