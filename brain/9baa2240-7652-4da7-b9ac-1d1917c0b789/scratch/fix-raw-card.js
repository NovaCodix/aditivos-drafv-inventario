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

  // Replace plain <Card> that is followed by <CardContent className="p-0">
  content = content.replace(/<Card>\s*<CardContent className="p-0">/g, 
    '<Card className="border border-border/40 bg-card/65 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden !p-0 gap-0">\n      <CardContent className="p-0">'
  );
  
  // Also replace <Card> followed by <CardContent> (without p-0) just in case
  content = content.replace(/<Card>\s*<CardContent>/g, 
    '<Card className="border border-border/40 bg-card/65 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden !p-0 gap-0">\n      <CardContent className="p-0">'
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
    updatedFiles++;
  }
});

console.log(`Successfully updated ${updatedFiles} files.`);
