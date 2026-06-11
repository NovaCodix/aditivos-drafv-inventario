const fs = require('fs');
const path = require('path');

const files = [
  'audit', 'batches', 'categories', 'inventory', 'locations', 'movements', 'users'
];

files.forEach(name => {
  const file = path.join(__dirname, '../../../src/app/(dashboard)', name, 'page.tsx');
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes("import { DataTablePagination }")) {
      content = "import { DataTablePagination } from '@/components/ui/data-table-pagination'\n" + content;
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed import in', file);
    }
  }
});
