const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../../../src/app/(dashboard)');

function walk(directory) {
  let results = [];
  const list = fs.readdirSync(directory);
  list.forEach(file => {
    file = path.join(directory, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('page.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(dir);

let updatedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Find Card with overflow-hidden and add pt-0 pb-0 gap-0
  content = content.replace(/<Card className="([^"]*overflow-hidden[^"]*)"/g, (match, className) => {
    if (!className.includes('pt-0')) {
      return `<Card className="${className} pt-0 pb-0 gap-0"`;
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
    updatedFiles++;
  }
});

// Also check products-table.tsx
const productsTableFile = path.join(__dirname, '../../../src/modules/products/components/products-table.tsx');
if (fs.existsSync(productsTableFile)) {
  let content = fs.readFileSync(productsTableFile, 'utf8');
  let originalContent = content;

  content = content.replace(/<Card>/g, '<Card className="overflow-hidden pt-0 pb-0 gap-0">');
  content = content.replace(/<Card className="([^"]*)"/g, (match, className) => {
    if (!className.includes('overflow-hidden')) {
      return `<Card className="${className} overflow-hidden pt-0 pb-0 gap-0"`;
    } else if (!className.includes('pt-0')) {
      return `<Card className="${className} pt-0 pb-0 gap-0"`;
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(productsTableFile, content, 'utf8');
    console.log(`Updated products-table.tsx`);
  }
}


console.log(`Successfully updated files.`);
