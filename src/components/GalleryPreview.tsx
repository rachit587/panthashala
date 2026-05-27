import { useState, useEffect, useCallback } from 'react';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { config } from '../config/restaurantConfig';
import ImageLightbox from './ImageLightbox';
import { LiquidMetalButton } from './ui/liquid-metal-button';
import './GalleryPreview.css';

// 15 curated high-quality images from the gallery
const SOURCE_IMAGES = [
  'diningarea14.webp',
  'exteriorbuilding2.webp',
  'interior12.webp',
  '20260525_113314(1).webp',
  'diningarea2.webp',
  'interior2.webp',
  '20260525_112751.webp',
  'Staircase1.webp',
  'dinningarea1.webp',
  'interior10.webp',
  'interior14.webp',
  'interior7.webp',
  'pext.webp',
  'pint.webp',
  'diningarea4.webp'
];

export default function GalleryPreview() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [isHovered, setIsHovered] = useState(false);

  // Shuffle images on mount and set responsive items per page
  useEffect(() => {
    const shuffled = [...SOURCE_IMAGES].sort(() => 0.5 - Math.random());
    setImages(shuffled);

    const handleResize = () => {
      setItemsPerPage(window.innerWidth >= 768 ? 3 : 1);
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fullImagePaths = images.map(img => `${config.galleryImagesPath}${img}`);
  const maxIndex = Math.max(0, images.length - itemsPerPage);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Auto-scroll every 3 seconds if not hovered
  useEffect(() => {
    if (isHovered || images.length === 0) return;
    const timer = setInterval(nextSlide, 3000);
    return () => clearInterval(timer);
  }, [nextSlide, isHovered, images.length]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextLightboxImage = () => {
    setLightboxIndex((prev) => (prev + 1) % fullImagePaths.length);
  };

  const prevLightboxImage = () => {
    setLightboxIndex((prev) => (prev - 1 + fullImagePaths.length) % fullImagePaths.length);
  };

  if (images.length === 0) return null;

  return (
    <section id="gallery" className="gallery-preview-section">
      <div className="container">
        <h2 className="section-heading">Our Ambience</h2>
        <p className="section-subtitle">Experience the warmth and elegance of Panthashala</p>
        
        <div 
          className="carousel-wrapper"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button className="carousel-btn prev-btn" onClick={prevSlide} aria-label="Previous image">
            <ChevronLeft size={24} />
          </button>

          <div className="carousel-viewport">
            <motion.div 
              className="carousel-track"
              animate={{ x: `-${currentIndex * (100 / itemsPerPage)}%` }}
              transition={{ type: "tween", ease: "easeInOut", duration: 1.6 }}
            >
              {fullImagePaths.map((src, index) => (
                <div 
                  key={index} 
                  className="carousel-slide"
                  style={{ flex: `0 0 ${100 / itemsPerPage}%` }}
                >
                  <div className="gallery-item" onClick={() => openLightbox(index)}>
                    <img src={src} alt={`Panthashala Ambience ${index + 1}`} loading="lazy" />
                    <div className="gallery-hover-overlay">
                      <span>View</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <button className="carousel-btn next-btn" onClick={nextSlide} aria-label="Next image">
            <ChevronRight size={24} />
          </button>
        </div>

        <LiquidMetalButton to="/gallery" className="gallery-view-all mt-4" variant="wood">
          View All Photos →
        </LiquidMetalButton>
      </div>

      <ImageLightbox 
        images={fullImagePaths}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNext={nextLightboxImage}
        onPrev={prevLightboxImage}
      />
    </section>
  );
}
