import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import type { MenuType } from '../pages/Menu';
import { LiquidMetalButton } from './ui/liquid-metal-button';
import './MenuGateway.css';

interface MenuGatewayProps {
  onSelectMenu: (menu: MenuType) => void;
}

export default function MenuGateway({ onSelectMenu }: MenuGatewayProps) {
  return (
    <div className="menu-gateway container">
      <div className="gateway-header">
        <h1 className="section-heading">Our Menus</h1>
        <p className="gateway-subtitle">Please select a menu to view our offerings</p>
      </div>

      <div className="gateway-cards">
        <motion.div 
          className="gateway-card regular-menu"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => onSelectMenu('Panthashala')}
        >
          <div className="card-content">
            <h2>Panthashala</h2>
            <p>Multi-cuisine favourites, biryani, Chinese, tandoor, rolls, veg, non-veg, snacks, beverages, and classic comfort dishes.</p>
            <LiquidMetalButton variant="primary" onClick={(e) => { e?.stopPropagation?.(); onSelectMenu('Panthashala'); }}>View Panthashala Menu</LiquidMetalButton>
          </div>
        </motion.div>

        <motion.div 
          className="gateway-card veg-menu"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onClick={() => onSelectMenu('Panthashala Pure Veg')}
        >
          <div className="card-content">
            <div className="veg-badges">
              <span className="badge-veg"><Leaf size={14} /> Pure Veg</span>
              <span className="badge-no-onion">No Onion No Garlic</span>
            </div>
            <h2>Panthashala Pure Veg</h2>
            <p>Pure vegetarian, no onion, no garlic menu with South Indian dishes, snacks, chaat, rolls, chowmein, chole bhature, and beverages.</p>
            <LiquidMetalButton variant="primary" onClick={(e) => { e?.stopPropagation?.(); onSelectMenu('Panthashala Pure Veg'); }}>View Pure Veg Menu</LiquidMetalButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
