import { motion } from 'framer-motion';
import { config } from '../config/restaurantConfig';
import './AboutSection.css';

export default function AboutSection() {
  return (
    <section id="about" className="about-section">
      <div className="container about-container">
        <motion.div 
          className="about-image-wrapper"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="about-image-deco"></div>
          <img 
            src={`${config.galleryImagesPath}exteriorbuilding.webp`} 
            alt="The exterior building of Panthashala Restaurant" 
            className="about-image" 
            loading="lazy"
          />
        </motion.div>
        
        <motion.div 
          className="about-content"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="about-label">A Legacy of Love Since {config.foundedYear}</div>
          <h2 className="about-heading">The Journey of {config.restaurantName}</h2>
          
          <div className="about-story">
            <p>
              Our journey began in {config.foundedYear}, and since then, {config.restaurantName} has evolved into more than just a dining destination—it is a lifelong journey of love with the people of {config.location.split(',')[0]}. Every dish we serve carries a whisper of tradition, crafted with passion and the finest ingredients to bring hearts closer together.
            </p>
            <p>
              Step into an ambience that feels like home. Whether it's a quiet evening of casual dining, joyous family meals filled with laughter, or intimate celebrations, our doors are open to create unforgettable moments. We pour our love into every recipe, ensuring that every bite resonates with warmth, nostalgia, and genuine hospitality along this beautiful journey.
            </p>
          </div>
          
          <ul className="about-features">
            <li>A Culinary Journey Since {config.foundedYear}</li>
            <li>Crafted with Love & Premium Ingredients</li>
            <li>A Warm, Inviting Ambience for Every Occasion</li>
            <li>Cherished Memories & Heartfelt Celebrations</li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
