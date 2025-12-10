import fs from 'fs';
import path from 'path';

const filesToFix = [
  'src/pages/FavoritesPage.tsx',
  'src/pages/ComparePage.tsx',
  'src/components/RecentlyViewed.tsx',
  'src/components/SearchBar.tsx'
];

function fixFile(filePath: string) {
  const fullPath = path.join(process.cwd(), filePath);
  let content = fs.readFileSync(fullPath, 'utf-8');
  let modified = false;

  // Remove the import from utils/currency
  if (content.includes("from '../utils/currency'")) {
    content = content.replace(/import \{ formatPrice \} from '\.\.\/utils\/currency';\n?/g, '');
    modified = true;
    console.log(`✓ Removed utils/currency import from ${filePath}`);
  }

  // Update the destructuring from useWatch
  const useWatchPattern = /const \{ ([^}]+) \} = useWatch\(\);/;
  const match = content.match(useWatchPattern);

  if (match) {
    const currentProps = match[1].split(',').map(s => s.trim());

    // Remove old currency props if present
    const propsToRemove = ['currencyMode', 'exchangeRate'];
    let filteredProps = currentProps.filter(prop => !propsToRemove.includes(prop));

    // Add formatPrice if not present
    if (!filteredProps.includes('formatPrice')) {
      filteredProps.push('formatPrice');
    }

    const newDestructuring = `const { ${filteredProps.join(', ')} } = useWatch();`;
    content = content.replace(useWatchPattern, newDestructuring);
    modified = true;
    console.log(`✓ Updated useWatch destructuring in ${filePath}`);
  }

  // Replace formatPrice calls
  const oldPattern = /formatPrice\(([^,]+),\s*currencyMode,\s*exchangeRate\)/g;
  if (content.match(oldPattern)) {
    content = content.replace(oldPattern, 'formatPrice($1)');
    modified = true;
    console.log(`✓ Updated formatPrice calls in ${filePath}`);
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`✅ Fixed ${filePath}\n`);
    return true;
  }

  console.log(`⏭️  No changes needed in ${filePath}\n`);
  return false;
}

console.log('🔧 Fixing Currency Conversion in Components...\n');

let fixedCount = 0;
for (const file of filesToFix) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log(`\n✨ Complete! Fixed ${fixedCount} out of ${filesToFix.length} files`);
console.log('\n📝 Next steps:');
console.log('1. Test the application: npm run dev');
console.log('2. Check currency selector in header');
console.log('3. Verify prices update when changing currency');
console.log('4. Test on all pages: inventory, watch detail, favorites, compare');
