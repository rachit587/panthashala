import { MapPin, Clock, Phone, MessageCircle, ExternalLink, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import { config } from '../config/restaurantConfig';
import { LiquidMetalButton } from '../components/ui/liquid-metal-button';
import './Contact.css';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1 }
  }),
};

export default function Contact() {
  const contactItems = [
    {
      icon: <MapPin size={22} />,
      label: 'Address',
      value: config.location,
      link: config.googleMapsUrl,
      linkLabel: 'Open in Maps',
      external: true,
    },
    {
      icon: <Clock size={22} />,
      label: 'Opening Hours',
      value: config.openingHours,
    },
    {
      icon: <Phone size={22} />,
      label: 'Phone',
      value: config.primaryPhone,
      link: `tel:${config.primaryPhone}`,
      linkLabel: 'Call Now',
      external: false,
    },
    {
      icon: <MessageCircle size={22} />,
      label: 'WhatsApp',
      value: config.whatsappNumber,
      link: `https://wa.me/91${config.whatsappNumber}?text=Hello%2C%20I%20want%20to%20know%20more%20about%20Panthashala%20Restaurant.`,
      linkLabel: 'Chat on WhatsApp',
      external: true,
    },
    {
      icon: <ExternalLink size={22} />,
      label: 'Order Online',
      value: 'Order via Taste Food App',
      link: config.tasteOrderUrl,
      linkLabel: 'Order Now',
      external: true,
    },
  ];

  return (
    <div className="contact-page">
      {/* Hero */}
      <div className="contact-hero">
        <div className="contact-hero-overlay" />
        <img
          src={`${config.galleryImagesPath}exteriorbuilding.webp`}
          alt="Panthashala exterior"
          className="contact-hero-bg"
          loading="eager"
        />
        <div className="container contact-hero-content">
          <span className="contact-hero-label">
            <Navigation size={13} /> Find Us
          </span>
          <h1 className="contact-hero-title">Contact Us</h1>
          <p className="contact-hero-sub">We're open every day · Rampurhat, West Bengal</p>
        </div>
      </div>

      {/* Body */}
      <div className="contact-body container">
        <div className="contact-grid">
          {/* Info Panel */}
          <div className="contact-info-panel">
            <div className="contact-panel-header">
              <h2 className="contact-panel-title">Get in Touch</h2>
              <p className="contact-panel-sub">
                Visit us, call us, or place an order online — we're always happy to serve you.
              </p>
            </div>

            <ul className="contact-list">
              {contactItems.map((item, i) => (
                <motion.li
                  key={item.label}
                  className="contact-item"
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={fadeUp}
                >
                  <div className="contact-item-icon">{item.icon}</div>
                  <div className="contact-item-body">
                    <span className="contact-item-label">{item.label}</span>
                    <span className="contact-item-value">{item.value}</span>
                    {item.link && (
                      <a
                        href={item.link}
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                        className="contact-item-link"
                      >
                        {item.linkLabel} →
                      </a>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>

            {/* Social links */}
            <div className="contact-socials">
              <LiquidMetalButton
                href={config.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social-btn"
                variant="white"
              >
                Facebook Page ↗
              </LiquidMetalButton>
              <LiquidMetalButton
                href={config.googleBusinessProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social-btn"
                variant="white"
              >
                Google Business ↗
              </LiquidMetalButton>
            </div>
          </div>

          {/* Map Panel */}
          <motion.div
            className="contact-map-panel"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="map-embed-wrapper">
              <iframe
                title="Panthashala Restaurant location on Google Maps"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3645.48!2d87.78!3d24.17!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f9e41b0f9a5b9d%3A0x0!2sPanthashala+Restaurant!5e0!3m2!1sen!2sin!4v1716730000000!5m2!1sen!2sin"
                className="map-embed"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <LiquidMetalButton
              href={config.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="map-directions-btn"
              variant="wood"
            >
              <Navigation size={16} />
              Get Directions on Google Maps
            </LiquidMetalButton>
          </motion.div>
        </div>

        {/* Quick action strip */}
        <div className="contact-action-strip">
          <LiquidMetalButton href={`tel:${config.primaryPhone}`} className="action-strip-btn action-strip-call" variant="wood">
            <Phone size={18} />
            Call Now
          </LiquidMetalButton>
          <LiquidMetalButton
            href={`https://wa.me/91${config.whatsappNumber}?text=Hello%2C%20I%20want%20to%20reserve%20a%20table%20at%20Panthashala%20Restaurant.`}
            target="_blank"
            rel="noopener noreferrer"
            className="action-strip-btn action-strip-wa"
            variant="whatsapp"
          >
            <MessageCircle size={18} />
            WhatsApp Us
          </LiquidMetalButton>
          <LiquidMetalButton
            href={config.tasteOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="action-strip-btn action-strip-order"
            variant="orange"
          >
            <ExternalLink size={18} />
            Order Online
          </LiquidMetalButton>
        </div>
      </div>
    </div>
  );
}
