import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, Filter, X } from 'lucide-react';
import menuData from '../data/menuData.json';
import type { MenuType } from '../pages/Menu';
import { LiquidMetalButton } from './ui/liquid-metal-button';
import './MenuViewer.css';

interface MenuViewerProps {
  menuType: MenuType;
  onBack: () => void;
}

export default function MenuViewer({ menuType, onBack }: MenuViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Filter data based on menuType
  const outletData = useMemo(() => {
    return menuData.filter(item => item.outlet === menuType);
  }, [menuType]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(outletData.map(item => item.category));
    return ['All', ...Array.from(cats)];
  }, [outletData]);

  // Extract unique tags/filters
  const availableFilters = useMemo(() => {
    const tags = new Set<string>();
    outletData.forEach(item => {
      item.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [outletData]);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const clearFilters = () => {
    setActiveFilters([]);
    setSearchQuery('');
    setActiveCategory('All');
  };

  // Filter the actual items to display
  const displayedItems = useMemo(() => {
    return outletData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesFilters = activeFilters.length === 0 || activeFilters.every(f => item.tags.includes(f));
      
      return matchesSearch && matchesCategory && matchesFilters;
    });
  }, [outletData, searchQuery, activeCategory, activeFilters]);

  return (
    <div className="menu-viewer container">
      <div className="menu-viewer-header">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={20} /> Back to Menus
        </button>
        <h1 className="menu-title">{menuType}</h1>
        {menuType === 'Panthashala Pure Veg' && (
          <div className="veg-indicator">
            <span className="badge-veg">Pure Veg</span>
            <span className="badge-no-onion">No Onion No Garlic</span>
          </div>
        )}
      </div>

      <div className="menu-controls">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search dishes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filter-scroll">
          <div className="filter-label"><Filter size={16} /> Filters:</div>
          {availableFilters.map(filter => (
            <button 
              key={filter}
              className={`filter-chip ${activeFilters.includes(filter) ? 'active' : ''}`}
              onClick={() => toggleFilter(filter)}
            >
              {filter}
            </button>
          ))}
          {activeFilters.length > 0 && (
            <button className="clear-filters-btn" onClick={() => setActiveFilters([])}>Clear</button>
          )}
        </div>
      </div>

      <div className="category-tabs-wrapper">
        <div className="category-tabs">
          {categories.map(cat => (
            <button 
              key={cat}
              className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="menu-items-grid">
        <AnimatePresence mode="popLayout">
          {displayedItems.length > 0 ? (
            displayedItems.map((item, idx) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.05, 0.5) }}
                className="menu-item-card"
              >
                <div className="item-header">
                  <div className={`diet-icon ${item.type.toLowerCase().replace('/', '-').replace(' ', '')}`} title={item.type}>
                    {/* Circle in square for veg/non-veg */}
                    <div className="diet-dot"></div>
                  </div>
                  <h3 className="item-name">{item.name}</h3>
                </div>
                
                <div className="item-footer">
                  <div className="item-price">₹{item.price.replace(/₹/g, '')}</div>
                  {item.bestSeller && <div className="item-bestseller">Best Seller</div>}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p>No items found matching your criteria.</p>
              <LiquidMetalButton variant="primary" onClick={clearFilters}>Clear Filters</LiquidMetalButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
