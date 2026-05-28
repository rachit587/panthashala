import fs from 'fs';

function parseMenu(filePath, outletName) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').map(l => l.trim());
  
  let currentCategory = '';
  const items = [];
  let currentItem = null;
  
  for (const line of lines) {
    if (
      line.startsWith('SUGGESTED BEST-SELLING') || 
      line.startsWith('COPY-PASTE SUMMARY') ||
      line.startsWith('WEBSITE MENU FILTER SUGGESTIONS')
    ) {
      break;
    }

    if (line.startsWith('CATEGORY:')) {
      currentCategory = line.replace('CATEGORY:', '').trim();
      continue;
    }
    
    // Match item start, e.g., "1. Mineral Water"
    const itemStartMatch = line.match(/^\d+\.\s+(.+)$/);
    if (itemStartMatch) {
      if (currentItem) items.push(currentItem);
      currentItem = {
        id: outletName + '-' + items.length,
        outlet: outletName,
        category: currentCategory,
        name: itemStartMatch[1].trim(),
        price: '',
        type: '',
        tags: [],
        bestSeller: false,
        description: ''
      };
      continue;
    }
    
    if (currentItem) {
      if (line.startsWith('Price:')) {
        currentItem.price = line.replace('Price:', '').trim();
      } else if (line.startsWith('Type:')) {
        currentItem.type = line.replace('Type:', '').trim();
      } else if (line.startsWith('Tags:')) {
        currentItem.tags = line.replace('Tags:', '').split(',').map(t => t.trim());
      } else if (line.startsWith('Suggested Best-Seller:') || line.startsWith('Best Seller:')) {
        const val = line.replace(/Suggested Best-Seller:|Best Seller:/, '').trim().toLowerCase();
        currentItem.bestSeller = val === 'yes';
      }
    }
  }
  if (currentItem) items.push(currentItem);
  return items;
}

const mainMenu = parseMenu('./menu/new_panthashala_restaurant_menu_text_file.txt', 'Panthashala');
const vegMenu = parseMenu('./menu/new_panthashala_pure_veg_branch_menu.txt', 'Panthashala Pure Veg');

const allData = [...mainMenu, ...vegMenu];

fs.writeFileSync('./src/data/menuData.json', JSON.stringify(allData, null, 2));
console.log('Menu data successfully parsed and saved to src/data/menuData.json');
