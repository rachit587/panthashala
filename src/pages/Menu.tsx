import { useState, useEffect } from 'react';
import MenuGateway from '../components/MenuGateway';
import MenuViewer from '../components/MenuViewer';

export type MenuType = 'none' | 'Panthashala' | 'Panthashala Pure Veg';

export default function Menu() {
  const [selectedMenu, setSelectedMenu] = useState<MenuType>('none');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedMenu]);

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: 'var(--color-ivory)' }}>
      {selectedMenu === 'none' ? (
        <MenuGateway onSelectMenu={setSelectedMenu} />
      ) : (
        <MenuViewer 
          menuType={selectedMenu} 
          onBack={() => setSelectedMenu('none')} 
        />
      )}
    </div>
  );
}
