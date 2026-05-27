import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HeroSlideshow from '../components/HeroSlideshow';
import TrustBar from '../components/TrustBar';
import GalleryPreview from '../components/GalleryPreview';
import MenuCTA from '../components/MenuCTA';
import AboutSection from '../components/AboutSection';
import ConnectSection from '../components/ConnectSection';
import ContactSection from '../components/ContactSection';
import TestimonialsSection from '../components/TestimonialsSection';

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <>
      <HeroSlideshow />
      <TrustBar />
      <GalleryPreview />
      <MenuCTA />
      <ConnectSection />
      <AboutSection />
      <TestimonialsSection />
      <ContactSection />
    </>
  );
}
