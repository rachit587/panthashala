import { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { config } from '../config/restaurantConfig';
import { LiquidMetalButton } from './ui/liquid-metal-button';
import './HeroSlideshow.css';

const heroImages = [
  '20260525_112458.webp',
  '20260525_112751.webp',
  '20260525_113322.webp',
  'dininfarea5.webp',
  'diningarea14.webp',
  'diningarea3.webp',
  'exteriorbuilding.webp',
  'interior11.webp'
];

const typewriterWords = [
  "Feels like coming home.",
  "Memories in every bite.",
  "Your table is waiting."
];

const TypewriterText = () => {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const handleTyping = () => {
      const currentWord = typewriterWords[wordIndex];
      
      if (isDeleting) {
        setText(currentWord.substring(0, text.length - 1));
        setTypingSpeed(50);
      } else {
        setText(currentWord.substring(0, text.length + 1));
        setTypingSpeed(100);
      }

      if (!isDeleting && text === currentWord) {
        // Pause at end of word
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % typewriterWords.length);
        // Pause before next word
        setTypingSpeed(500);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIndex, typingSpeed]);

  return (
    <div className="typewriter-container">
      <span className="text-silver-metallic typewriter-text">{text}</span>
      <span className="typewriter-cursor">|</span>
    </div>
  );
};

export default function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero-section">
      <div className="hero-backgrounds">
        <AnimatePresence>
          <motion.img
            key={currentSlide}
            src={`${config.heroImagesPath}${heroImages[currentSlide]}`}
            alt="Panthashala Interior"
            className="hero-image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          />
        </AnimatePresence>
        <div className="hero-overlay"></div>
      </div>

      <div className="container hero-content">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="hero-title-wrapper">
            <h1 className="hero-title text-shimmer-gold">Panthashala</h1>
            <h2 className="hero-subtitle-placed">Since 1996</h2>
          </div>
          
          <TypewriterText />
          
          <p className="hero-description">
            Sizzling tandoors, rich curries, and over two decades of passion. Taste the true spirit of Rampurhat.
          </p>

          <div className="hero-ctas">
            <LiquidMetalButton to="/menu" variant="primary">
              Explore Menu
            </LiquidMetalButton>
            <LiquidMetalButton href={`tel:${config.primaryPhone}`} variant="wood">
              <Phone size={18} /> Call Restaurant
            </LiquidMetalButton>
          </div>
        </motion.div>
      </div>

    </section>
  );
}
