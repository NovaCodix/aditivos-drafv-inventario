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

const paginatorHTML = `
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F4F7FB] dark:bg-slate-800/50 border-t border-border/30">
          <p className="text-[13px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            Mostrando 1-10 de 10 resultados
          </p>
          <div className="flex items-center gap-1.5">
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-700 h-8 w-8 text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left w-4 h-4"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="flex items-center gap-1 mx-2">
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 min-w-8 text-[13px] px-3 bg-[#1e3a8a] text-white hover:bg-[#1e3a8a]/90 hover:text-white">
                1
              </button>
            </div>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-700 h-8 w-8 text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-4 h-4"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>`;

files.forEach(file => {
  if (file.includes('users\\page.tsx') || file.includes('users/page.tsx')) return; // Already done

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. Center headers
  content = content.replace(/<th className="([^"]*?)(text-left|text-right)([^"]*?)"/g, '<th className="$1text-center$3"');

  // 2. Add overflow-hidden to Card
  content = content.replace(/<Card className="([^"]*?)"/g, (match, className) => {
    if (!className.includes('overflow-hidden')) {
      return `<Card className="${className} overflow-hidden"`;
    }
    return match;
  });

  // 3. Add paginator right before </CardContent>
  // Wait, there might be multiple CardContents. We want the one enclosing the table.
  // Instead of complex parsing, I'll just look for `</table>\n          </div>\n        </CardContent>` or similar.
  if (!content.includes('Mostrando 1-10') && content.includes('<table')) {
      content = content.replace(/(<\/div>\n\s*)(<\/CardContent>)/g, `$1${paginatorHTML}\n      $2`);
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
    updatedFiles++;
  }
});

console.log(`Successfully updated ${updatedFiles} files.`);
