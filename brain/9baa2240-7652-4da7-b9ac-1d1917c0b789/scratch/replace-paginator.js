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

  // Check if it has the Pagination comment
  if (content.includes('{/* Pagination */}')) {
    // Extract the variable used for total
    const match = content.match(/Mostrando 1-(?:.*?) de (\{.*?\}) resultados/);
    let totalVar = '{0}';
    
    if (match && match[1]) {
      totalVar = match[1].replace('{', '').replace('}', '');
    } else {
        // sometimes it's hardcoded to 10
        const match2 = content.match(/Mostrando 1-10 de 10 resultados/);
        if (match2) totalVar = '10';
        else {
            // maybe `count`
            const match3 = content.match(/Mostrando 1-50 de (\{.*?\}) resultados/);
            if (match3) totalVar = match3[1].replace('{', '').replace('}', '');
        }
    }

    // Replace the block
    const replaceRegex = /\{\/\*\s*Pagination\s*\*\/\}.*?<\/CardContent>/s;
    if (replaceRegex.test(content)) {
        content = content.replace(replaceRegex, `{/* Pagination */}\n        <DataTablePagination totalItems={${totalVar}} />\n      </CardContent>`);
        
        // ensure import is added
        if (!content.includes('DataTablePagination')) {
            content = "import { DataTablePagination } from '@/components/ui/data-table-pagination'\n" + content;
        }

        fs.writeFileSync(file, content, 'utf8');
        updatedFiles++;
        console.log(`Updated ${file} with totalVar = ${totalVar}`);
    }
  }
});

console.log(`Updated ${updatedFiles} files.`);
