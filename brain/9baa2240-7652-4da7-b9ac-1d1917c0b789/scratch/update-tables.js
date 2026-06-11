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
console.log(`Found ${files.length} files.`);

let updatedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace <tr inside <thead>
  content = content.replace(/<tr className="[^"]*bg-muted[^"]*">/g, '<tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">');
  content = content.replace(/<tr\s+className="border-b\s+border-border\/30\s+bg-muted\/10">/g, '<tr className="border-b border-border/30 bg-[#F4F7FB] dark:bg-slate-800/50">');

  // Replace th classes
  content = content.replace(/<th\s+className="([^"]+)"/g, (match, className) => {
    // Only replace if it looks like a standard table header
    if (className.includes('text-muted-foreground') || className.includes('py-3')) {
      let align = 'text-left';
      if (className.includes('text-right')) align = 'text-right';
      if (className.includes('text-center')) align = 'text-center';
      return `<th className="${align} py-3.5 px-6 text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300"`;
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
    updatedFiles++;
  }
});

console.log(`Successfully updated ${updatedFiles} files.`);
