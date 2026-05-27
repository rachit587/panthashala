import { Star, Heart, IndianRupee, ShoppingBag, Users } from 'lucide-react';

import './TrustBar.css';

export default function TrustBar() {
  const highlights = [
    { icon: <Star fill="currentColor" />, text: "4.5-star rating on Google" },
    { icon: <Heart />, text: "Loved in Rampurhat" },
    { icon: <IndianRupee />, text: "Affordable Dining" },
    { icon: <ShoppingBag />, text: "Online Orders & Parcels" },
    { icon: <Users />, text: "Family Friendly" },
  ];

  return (
    <section className="trust-bar bg-wood">
      <div className="container trust-bar-container">
        {highlights.map((item, index) => (
          <div key={index} className="trust-item">
            <span className="trust-icon text-gold">{item.icon}</span>
            <span className="trust-text">{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
