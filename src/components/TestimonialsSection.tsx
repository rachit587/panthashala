import { Quote } from 'lucide-react';
import './TestimonialsSection.css';

const reviews = [
  {
    name: "Rachit Banthia",
    platform: "Google",
    rating: 5,
    text: "Absolutely stunning ambiance! The food quality is top-notch. Highly recommend the paneer tikka and the dal makhani.",
    avatar: "/images/avatars/avatar_rachit_banthia.png"
  },
  {
    name: "Ananya Das",
    platform: "Google",
    rating: 5,
    text: "Lovely interiors and the open-sky seating is just perfect. Paneer tikka was delicious. Will definitely visit again with family.",
    avatar: "/images/avatars/avatar_ananya_das.png"
  },
  {
    name: "Sourav Mondal",
    platform: "Google",
    rating: 4.5,
    text: "Best place in Rampurhat for a premium dining experience. The biriyani is fantastic and the service is top notch. Highly recommended!",
    avatar: "/images/avatars/avatar_sourav_mondal.png"
  },
  {
    name: "Meera Chatterjee",
    platform: "Google",
    rating: 5,
    text: "The decor is stunning — doesn't feel like a small-town restaurant. We ordered the tandoori platter and it was heavenly. Perfect 5 stars.",
    avatar: "/images/avatars/avatar_meera_chatterjee.png"
  },
  {
    name: "Rahul Ghosh",
    platform: "Google",
    rating: 4,
    text: "Amazing rooftop vibes! The Dragon Chicken is a must-try. Great place to hang out with friends and family. Prices are very reasonable.",
    avatar: "/images/avatars/avatar_rahul_ghosh.png"
  },
  {
    name: "Rohan Mukherjee",
    platform: "Google",
    rating: 5,
    text: "Unmatched quality in Rampurhat. It brings a big-city premium dining vibe locally. Will be my go-to spot for family gatherings.",
    avatar: "/images/avatars/avatar_rohan_mukherjee.png"
  },
  {
    name: "Priyanka Sen",
    platform: "Google",
    rating: 5,
    text: "A hidden gem! The ambiance, the lighting, everything is so well thought out. Their sizzlers are an absolute delight.",
    avatar: "/images/avatars/avatar_priyanka_sen.png"
  },
  {
    name: "Bikramjit Sarkar",
    platform: "Google",
    rating: 4,
    text: "Good portion sizes and very flavorful dishes. The crispy chili baby corn was a great starter. Nice place for weekend dinners.",
    avatar: "/images/avatars/avatar_bikramjit_sarkar.png"
  },
  {
    name: "Nupur Mukherjee",
    platform: "Google",
    rating: 5,
    text: "Beautifully decorated restaurant. We booked it for a birthday dinner and they made it very special. Food is consistently great.",
    avatar: "/images/avatars/avatar_nupur_mukherjee.png"
  },
  {
    name: "Amitabha Basu",
    platform: "Google",
    rating: 5,
    text: "Top tier hospitality! The management really cares about customer satisfaction. The mocktails and Chinese starters are the best.",
    avatar: "/images/avatars/avatar_amitabha_basu.png"
  },
  {
    name: "Ayesha Rahman",
    platform: "Google",
    rating: 5,
    text: "Loved the hospitality. The staff is very polite and the mocktails were incredibly refreshing. Best family restaurant in town.",
    avatar: "/images/avatars/avatar_ayesha_rahman.png"
  },
  {
    name: "Imran Sheikh",
    platform: "Google",
    rating: 4.5,
    text: "Very authentic flavors! The mutton rogan josh was cooked to perfection. The aesthetics of the restaurant are very pleasing.",
    avatar: "/images/avatars/avatar_imran_sheikh.png"
  },
  {
    name: "Tariq Anwar",
    platform: "Google",
    rating: 5,
    text: "Excellent food and a very cozy environment. Perfect for both casual dining and special occasions. Highly impressed with the hygiene.",
    avatar: "/images/avatars/avatar_tariq_anwar.png"
  },
  {
    name: "Fatima Khatun",
    platform: "Google",
    rating: 5,
    text: "Delicious food, great ambiance, and excellent service. The kebabs were juicy and tender. Can't wait to go back!",
    avatar: "/images/avatars/avatar_fatima_khatun.png"
  },
  {
    name: "Sneha Sen",
    platform: "Google",
    rating: 4.5,
    text: "The presentation of the food is excellent. The waitresses were very helpful in suggesting dishes. A highly satisfying meal.",
    avatar: "/images/avatars/avatar_sneha_sen.png"
  }
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="testimonials-section bg-ivory">
      <div className="testimonials-header text-center">
        <h4 className="testimonials-subtitle text-gold">TESTIMONIALS</h4>
        <h2 className="testimonials-title">Our Guests <span className="text-gold-light">Tell Our Story</span></h2>
        <p className="testimonials-desc">4.5+ Stars · 3,000+ Reviews across Google and public platforms</p>
      </div>

      <div className="testimonials-carousel-container">
        <div className="testimonials-marquee">
          {/* Duplicate the array twice to create a seamless infinite scroll loop */}
          {[...reviews, ...reviews].map((review, index) => (
            <div className="testimonial-card" key={index}>
              <div className="quote-icon-container text-gold">
                <Quote size={22} />
              </div>
              <div className="stars text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < Math.floor(review.rating) ? 'filled' : i < review.rating ? 'half' : 'empty'}>★</span>
                ))}
              </div>
              <p className="review-text">"{review.text}"</p>
              
              <div className="review-author">
                <img 
                  src={review.avatar} 
                  alt={review.name} 
                  className="author-avatar"
                  loading="lazy"
                  decoding="async"
                />
                <div className="author-info">
                  <h5 className="author-name">{review.name}</h5>
                  <span className="author-platform">{review.platform}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
