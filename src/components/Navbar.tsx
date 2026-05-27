import { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Phone, MapPin } from 'lucide-react';
import { config } from '../config/restaurantConfig';
import { LiquidMetalButton } from './ui/liquid-metal-button';
import './Navbar.css';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/#testimonials', label: 'Reviews' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const toggleMenu = useCallback(() => setIsOpen(prev => !prev), []);

  const isHome = location.pathname === '/';

  return (
    <>
      {/* Top bar */}
      <div className="navbar-topbar">
        <div className="container navbar-topbar-inner">
          <a href={`tel:${config.primaryPhone}`} className="topbar-link">
            <Phone size={13} />
            <span>{config.primaryPhone}</span>
          </a>
          <span className="topbar-sep">|</span>
          <span className="topbar-hours">Open {config.openingHours}</span>
          <LiquidMetalButton
            href={config.tasteOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="topbar-order-btn"
            variant="orange"
          >
            Order Online
          </LiquidMetalButton>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`navbar ${scrolled || !isHome ? 'navbar--scrolled' : ''} ${isOpen ? 'navbar--open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container navbar-inner">
          {/* Logo */}
          <NavLink to="/" className="navbar-logo" aria-label="Panthashala Restaurant home">
            <img
              src={config.logoPath}
              alt="Panthashala Restaurant logo"
              width={52}
              height={52}
              loading="eager"
            />
            <div className="navbar-logo-text">
              <span className="navbar-logo-name">Panthashala</span>
              <span className="navbar-logo-tagline">Restaurant · Since 1996</span>
            </div>
          </NavLink>

          {/* Desktop links */}
          <ul className="navbar-links" role="list">
            {navLinks.map(link => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `navbar-link ${isActive ? 'navbar-link--active' : ''}`
                  }
                  end={link.to === '/'}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* CTA + Hamburger */}
          <div className="navbar-actions">
            <LiquidMetalButton
              href={config.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-map-btn"
              variant="primary"
              aria-label="Find us on Google Maps"
            >
              <MapPin size={15} />
              <span>Find Us</span>
            </LiquidMetalButton>
            <button
              className="navbar-hamburger"
              onClick={toggleMenu}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          id="mobile-menu"
          className={`navbar-mobile ${isOpen ? 'navbar-mobile--open' : ''}`}
          aria-hidden={!isOpen}
        >
          <ul className="navbar-mobile-links" role="list">
            {navLinks.map(link => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `navbar-mobile-link ${isActive ? 'navbar-mobile-link--active' : ''}`
                  }
                  end={link.to === '/'}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="navbar-mobile-footer">
            <a href={`tel:${config.primaryPhone}`} className="navbar-mobile-tel">
              <Phone size={16} />
              {config.primaryPhone}
            </a>
            <LiquidMetalButton
              href={config.tasteOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-mobile-order"
              variant="orange"
            >
              Order Online →
            </LiquidMetalButton>
          </div>
        </div>
      </nav>
    </>
  );
}
