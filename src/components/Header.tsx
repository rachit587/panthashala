import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, X, Phone, MessageCircle } from 'lucide-react';
import { config } from '../config/restaurantConfig';
import { LiquidMetalButton } from './ui/liquid-metal-button';
import './Header.css';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Gallery', path: '/#gallery' },
    { name: 'About', path: '/#about' },
    { name: 'Contact', path: '/#contact' },
  ];

  return (
    <header className={`header ${isScrolled ? 'scrolled liquid-glass' : ''}`}>
      <div className="container header-container">
        <Link to="/" className="logo-link">
          <img src={config.logoPath} alt={config.restaurantName} className="logo-img" />
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-nav">
          <ul className="nav-list">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link to={link.path} className="nav-item">{link.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Hamburger */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open Menu"
        >
          <MenuIcon size={28} />
        </button>

        {/* Mobile Menu Overlay */}
        <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-header">
            <img src={config.logoPath} alt="Logo" className="mobile-logo" />
            <button 
              className="close-menu-btn"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close Menu"
            >
              <X size={28} />
            </button>
          </div>
          <nav className="mobile-nav">
            <ul>
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="mobile-nav-item">{link.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mobile-menu-actions">
            <LiquidMetalButton href={`tel:${config.primaryPhone}`} className="action-btn call-btn" variant="wood">
              <Phone size={20} /> Call Now
            </LiquidMetalButton>
            <LiquidMetalButton href={`https://wa.me/91${config.whatsappNumber}?text=Hello, I want to know more about ${config.restaurantName}.`} target="_blank" rel="noopener noreferrer" className="action-btn whatsapp-btn" variant="whatsapp">
              <MessageCircle size={20} /> WhatsApp
            </LiquidMetalButton>
            <LiquidMetalButton href={config.tasteOrderUrl} target="_blank" rel="noopener noreferrer" className="action-btn taste-btn" variant="orange">
              Order from Taste
            </LiquidMetalButton>
          </div>
        </div>
      </div>
    </header>
  );
}
