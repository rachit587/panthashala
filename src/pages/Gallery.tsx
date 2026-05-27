import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, Images } from 'lucide-react';
import { config } from '../config/restaurantConfig';
import './Gallery.css';

const ALL_IMAGES = [
  // Dining
  'diningarea14.webp','dininfarea5.webp','diningarea3.webp','diningarea2.webp',
  'diningarea4.webp','diningarea10.webp','diningarea12.webp','diningarea16.webp',
  'dinningarea1.webp','diningarea6.webp','diningarea7.webp','diningarea8.webp','diningarea9.webp',
  // Interior
  'interior1.webp','interior2.webp','interior3.webp','interior4.webp','interior5.webp',
  'interior7.webp','interior8.webp','interior9.webp','interior10.webp','interior11.webp',
  'interior12.webp','interior13.webp','interior14.webp','interior15.webp','interior16.webp',
  // Exterior
  'exteriorbuilding.webp','exteriorbuilding2.webp','exterior1.webp','pext.webp',
  // Food
  '20260525_112458.webp','20260525_112517.webp','20260525_112606.webp',
  '20260525_112751.webp','20260525_112924.webp','20260525_113108.webp',
  '20260525_113133.webp','20260525_113223.webp','20260525_113314(1).webp','20260525_113322.webp',
  // Misc
  'Staircase1.webp','pint.webp','p.webp',
];

const CATEGORIES = [
  { label: 'All', filter: () => true },
  { label: 'Dining Area', filter: (f: string) => f.includes('dining') || f.includes('dinning') || f.includes('dininfarea') },
  { label: 'Interior', filter: (f: string) => f.includes('interior') || f.includes('pint') || f.includes('Staircase') },
  { label: 'Exterior', filter: (f: string) => f.includes('exterior') || f.includes('pext') || f === 'p.webp' },
  { label: 'Food', filter: (f: string) => f.startsWith('2026') },
];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return ALL_IMAGES.filter(CATEGORIES[activeCategory].filter);
  }, [activeCategory]);

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  };

  const goPrev = () => setLightboxIndex(i => i === null ? null : (i - 1 + filtered.length) % filtered.length);
  const goNext = () => setLightboxIndex(i => i === null ? null : (i + 1) % filtered.length);

  return (
    <>
      <div className="gallery-page">
        {/* Page Hero */}
        <div className="gallery-hero">
          <div className="gallery-hero-overlay" />
          <img
            src={`${config.galleryImagesPath}interior2.webp`}
            alt="Gallery hero"
            className="gallery-hero-bg"
            loading="eager"
          />
          <div className="container gallery-hero-content">
            <span className="gallery-hero-label">
              <Images size={14} /> Our Space
            </span>
            <h1 className="gallery-hero-title">Gallery</h1>
            <p className="gallery-hero-sub">Experience the warmth &amp; elegance of Panthashala</p>
          </div>
        </div>

        <div className="gallery-body container">
          {/* Category tabs */}
          <div className="gallery-tabs" role="tablist" aria-label="Gallery categories">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                role="tab"
                aria-selected={activeCategory === i}
                className={`gallery-tab ${activeCategory === i ? 'gallery-tab--active' : ''}`}
                onClick={() => setActiveCategory(i)}
              >
                {cat.label}
                <span className="gallery-tab-count">
                  {ALL_IMAGES.filter(cat.filter).length}
                </span>
              </button>
            ))}
          </div>

          {/* Grid */}
          <motion.div
            layout
            className="gallery-grid"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((img, idx) => (
                <motion.button
                  key={img}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.4) }}
                  className="gallery-card"
                  onClick={() => openLightbox(idx)}
                  aria-label={`Open image ${idx + 1}`}
                >
                  <img
                    src={`${config.galleryImagesPath}${img}`}
                    alt={`Panthashala gallery ${idx + 1}`}
                    loading="lazy"
                    className="gallery-card-img"
                  />
                  <div className="gallery-card-overlay">
                    <ZoomIn size={28} className="gallery-zoom-icon" />
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
            onClick={closeLightbox}
          >
            <button className="lightbox-close" onClick={closeLightbox} aria-label="Close lightbox">
              <X size={26} />
            </button>

            <button
              className="lightbox-nav lightbox-prev"
              onClick={e => { e.stopPropagation(); goPrev(); }}
              aria-label="Previous image"
            >
              <ChevronLeft size={32} />
            </button>

            <motion.img
              key={lightboxIndex}
              src={`${config.galleryImagesPath}${filtered[lightboxIndex]}`}
              alt={`Gallery image ${lightboxIndex + 1}`}
              className="lightbox-img"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
            />

            <button
              className="lightbox-nav lightbox-next"
              onClick={e => { e.stopPropagation(); goNext(); }}
              aria-label="Next image"
            >
              <ChevronRight size={32} />
            </button>

            <div className="lightbox-counter">
              {lightboxIndex + 1} / {filtered.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
