const fs = require('fs');
const path = require('path');

const folders = ['customers', 'purchases', 'sales', 'bill-of-materials', 'production-orders', 'invoicing'];

folders.forEach(name => {
  const file = path.join(__dirname, '../../../src/app/(dashboard)', name, 'page.tsx');
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Find <div className="p-3 text-xs text-muted-foreground border-t">...</div>
    const regex = /<div className="p-3 text-xs text-muted-foreground border-t">[\s\S]*?<\/div>/;
    
    if (regex.test(content) && !content.includes('<DataTablePagination')) {
      content = content.replace(regex, `<DataTablePagination totalItems={count} />`);
      
      if (!content.includes('import { DataTablePagination }')) {
        content = "import { DataTablePagination } from '@/components/ui/data-table-pagination'\n" + content;
      }
      
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated paginator in', file);
    } else {
      console.log('No match or already updated in', file);
    }
  }
});
