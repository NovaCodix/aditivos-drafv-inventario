const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/app/(dashboard)');
const folders = fs.readdirSync(dir);

folders.forEach(folder => {
  const pagePath = path.join(dir, folder, 'page.tsx');
  if (fs.existsSync(pagePath) && folder !== 'products' && folder !== 'users') {
    let content = fs.readFileSync(pagePath, 'utf8');
    
    const originalContent = content;

    // 1. Replace the top-level overflow div
    content = content.replace(
      /<div className="w-full max-w-\[calc\(100vw-2rem\)\] overflow-x-auto sm:max-w-full">/g,
      '<div className="w-full min-w-0 flex flex-col">'
    );
    content = content.replace(
      /<div className="overflow-x-auto w-full">/g,
      '<div className="w-full min-w-0 flex flex-col">'
    );
    // Be careful with the generic "overflow-x-auto" so it doesn't match the one we are inserting!
    // But since we are replacing it BEFORE we insert the new one, it's safe.
    content = content.replace(
      /<div className="overflow-x-auto">/g,
      '<div className="w-full min-w-0 flex flex-col">'
    );

    // 2. Wrap the table
    // It searches for `<div className="px-4 md:px-6 pt-2 pb-4">` followed by `<table `
    content = content.replace(
      /<div className="px-4 md:px-6 pt-2 pb-4">\s*<table /g,
      '<div className="px-4 md:px-6 pt-2 pb-4">\n        <div className="w-full max-w-[calc(100vw-3rem)] overflow-x-auto sm:max-w-full">\n          <table '
    );

    // 3. Add closing div after table
    content = content.replace(
      /<\/table>(\s*)<\/div>(\s*(?:\{\/\*\s*Pagination\s*\*\/\})?)(\s*)<DataTablePagination/g,
      '</table>\n        </div>$1</div>$2$3<DataTablePagination'
    );

    if (content !== originalContent) {
      fs.writeFileSync(pagePath, content, 'utf8');
      console.log('Fixed', folder);
    }
  }
});
