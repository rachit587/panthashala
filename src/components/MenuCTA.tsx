import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { config } from '../config/restaurantConfig';
import { LiquidMetalButton } from './ui/liquid-metal-button';
import './MenuCTA.css';

const specialItems = [
  { id: '1', name: 'Chicken Biryani', price: '₹170', img: '/images/menu/chicken_biryani_1779821730676.png' },
  { id: '11', name: 'Masala Dosa', price: '₹100', img: '/images/menu/masala_dosa_1779821899522.png' },
  { id: '2', name: 'Mutton Biryani', price: '₹260', img: '/images/menu/mutton_biryani_1779821746650.png' },
  { id: '12', name: 'Butter Masala Dosa', price: '₹110', img: '/images/menu/butter_masala_dosa_1779821917316.png' },
  { id: '3', name: 'Chilli Chicken', price: '₹200', img: '/images/menu/chilli_chicken_1779821763627.png' },
  { id: '13', name: 'Paper Masala Dosa', price: '₹160', img: '/images/menu/paper_masala_dosa_1779821933180.png' },
  { id: '4', name: 'Chicken Butter Masala', price: '₹280', img: '/images/menu/chicken_butter_masala_1779821778942.png' },
  { id: '14', name: 'Butter Paneer Special Dosa', price: '₹160', img: '/images/menu/butter_paneer_special_dosa_1779821949358.png' },
  { id: '5', name: 'Crispy Fried Chicken', price: '₹250', img: '/images/menu/crispy_fried_chicken_1779821796697.png' },
  { id: '15', name: 'Cheese Masala Dosa', price: '₹150', img: '/images/menu/cheese_masala_dosa_1779821965684.png' },
  { id: '6', name: 'Egg Chicken Fried Rice', price: '₹200', img: '/images/menu/egg_chicken_fried_rice_1779821819009.png' },
  { id: '16', name: 'Chole Bhature', price: '₹80', img: '/images/menu/chole_bhature.png' },
  { id: '7', name: 'Chicken Kasha', price: '₹210', img: '/images/menu/chicken_kasha_1779821835411.png' },
  { id: '17', name: 'Paneer Special Chowmein', price: '₹150', img: '/images/menu/paneer_chowmein.png' },
  { id: '8', name: 'Chicken 65', price: '₹250', img: '/images/menu/chicken_65_1779821848983.png' },
  { id: '9', name: 'Chicken Manchow Soup', price: '₹150', img: '/images/menu/chicken_manchow_soup_1779821860564.png' },
  { id: '10', name: 'Fish Finger', price: '₹210', img: '/images/menu/fish_finger_1779821875513.png' }
];

export default function MenuCTA() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleItemClick = (id: string) => {
    if (activeId === id) {
      setActiveId(null);
    } else {
      setActiveId(id);
    }
  };

  return (
    <section className="menu-cta-section bg-wood">
      <div className="container">
        <h2 className="section-heading text-gold">Explore Our Menu</h2>
        <p className="section-subtitle text-ivory">Discover the rich flavors of Panthashala</p>
        
        <div className={`menu-scroller-wrapper ${activeId ? 'is-paused' : ''}`}>
          <div className="menu-scroller">
            {[...specialItems, ...specialItems].map((item, idx) => {
              const uniqueId = `${item.id}-${idx}`;
              const isActive = activeId === uniqueId;
              return (
                <div 
                  key={uniqueId} 
                  className={`menu-scroll-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => handleItemClick(uniqueId)}
                >
                  <div className="menu-scroll-img-wrapper">
                    <img src={item.img} alt={item.name} loading="lazy" />
                  </div>
                  <div className="menu-scroll-info">
                    <h3 className="menu-scroll-name">{item.name}</h3>
                    <p className="menu-scroll-price">{item.price}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="menu-cta-actions">
          <LiquidMetalButton to="/menu" variant="primary">
            View Full Menu
          </LiquidMetalButton>
          <LiquidMetalButton
            href={config.tasteOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="orange"
          >
            Order from Taste <ExternalLink size={18} />
          </LiquidMetalButton>
        </div>
      </div>
    </section>
  );
}
