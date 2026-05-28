import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

function readXlsx(): Array<{ product: string; category: string }> {
  const pyScript = `
import zipfile, xml.etree.ElementTree as ET, json
xlsx_path = '/Users/luisdesoto/compra-inteligente-rd/Productos - Categoria General.xlsx'
with zipfile.ZipFile(xlsx_path) as z:
    shared_strings = []
    if 'xl/sharedStrings.xml' in z.namelist():
        ss_xml = z.read('xl/sharedStrings.xml')
        ss_root = ET.fromstring(ss_xml)
        ns = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        for si in ss_root.findall('.//s:si', ns):
            texts = si.findall('.//s:t', ns)
            shared_strings.append(''.join(t.text or '' for t in texts))
            
    sheet_xml = z.read('xl/worksheets/sheet1.xml')
    sheet_root = ET.fromstring(sheet_xml)
    ns = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    rows = []
    for row in sheet_root.findall('.//s:sheetData/s:row', ns):
        cells = {}
        for cell in row.findall('s:c', ns):
            ref = cell.get('r')
            col = ''.join(c for c in ref if c.isalpha())
            cell_type = cell.get('t')
            val_elem = cell.find('s:v', ns)
            
            # Inline strings
            is_elem = cell.find('.//s:is/s:t', ns)
            if is_elem is not None and is_elem.text:
                cells[col] = is_elem.text
            elif val_elem is not None and val_elem.text:
                if cell_type == 's':
                    cells[col] = shared_strings[int(val_elem.text)]
                else:
                    cells[col] = val_elem.text
            else:
                cells[col] = ''
        rows.append(cells)

    
    # Filter rows where category changed (not "General" and not empty)
    data = []
    for r in rows[1:]:
        prod = r.get("A", "").strip()
        cat = r.get("B", "").strip()
        if prod and cat and cat != "General":
            data.append({"product": prod, "category": cat})
            
    print(json.dumps(data, ensure_ascii=False))
`;
  const result = execSync(`python3 << 'PYEOF'\n${pyScript}\nPYEOF`, { encoding: 'utf-8' });
  return JSON.parse(result.trim());
}

// Ultra-aggressive normalize
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // accents
    .replace(/[^a-z0-9\s]/g, ' ')     // all punctuation → space
    .replace(/\s+/g, ' ')             // collapse spaces
    .trim();
}

async function main() {
  console.log('📖 Leyendo archivo Excel de General...');
  const corrections = readXlsx();
  console.log(`   ${corrections.length} productos reclasificados encontrados.\n`);
  
  if (corrections.length === 0) {
    console.log('No hay cambios para aplicar.');
    return;
  }

  // Get all categories and create map
  const allCategories = await prisma.category.findMany();
  const catMap: Record<string, string> = {};
  for (const c of allCategories) catMap[c.name] = c.id;

  // Ensure all target categories exist
  for (const catName of [...new Set(corrections.map(c => c.category))]) {
    if (!catMap[catName]) {
      const created = await prisma.category.create({ data: { name: catName } });
      catMap[catName] = created.id;
      console.log(`   ✨ Nueva categoría creada: ${catName}`);
    }
  }

  // Optimize: Since these products were primarily "General", let's get all products 
  const allProducts = await prisma.canonicalProduct.findMany({
    select: { id: true, name: true, categoryId: true },
  });

  // Build normalized lookup
  const productByNorm: Record<string, typeof allProducts> = {};
  for (const p of allProducts) {
    const key = normalize(p.name);
    if (!productByNorm[key]) productByNorm[key] = [];
    productByNorm[key].push(p);
  }

  let updated = 0;
  let notFound = 0;
  let alreadyCorrect = 0;
  const notFoundList: string[] = [];

  for (const correction of corrections) {
    const normName = normalize(correction.product);
    const targetCatId = catMap[correction.category];
    if (!targetCatId) continue;

    // Try exact normalized match first
    let matches = productByNorm[normName];

    // If no exact match, try fuzzy
    if (!matches || matches.length === 0) {
      const candidates = allProducts.filter(p => {
        const normP = normalize(p.name);
        return normP.includes(normName) || normName.includes(normP);
      });
      if (candidates.length >= 1) {
        // Pick the closest match by length
        candidates.sort((a, b) => Math.abs(normalize(a.name).length - normName.length) - Math.abs(normalize(b.name).length - normName.length));
        matches = [candidates[0]];
      }
    }

    if (!matches || matches.length === 0) {
      notFound++;
      notFoundList.push(correction.product);
      continue;
    }

    for (const product of matches) {
      if (product.categoryId === targetCatId) {
        alreadyCorrect++;
        continue;
      }
      await prisma.canonicalProduct.update({
        where: { id: product.id },
        data: { categoryId: targetCatId },
      });
      updated++;
    }
  }

  console.log(`\n✅ Actualización masiva completada:`);
  console.log(`   📝 Actualizados: ${updated}`);
  console.log(`   ✔️  Ya estaban correctos: ${alreadyCorrect}`);
  console.log(`   ❌ No encontrados: ${notFound}`);
  if (notFoundList.length > 0 && notFound <= 50) {
    console.log(`\n   Productos no encontrados (hasta 50):`);
    notFoundList.slice(0, 50).forEach(p => console.log(`      - ${p}`));
  }

  // Show final distribution
  const finalCounts = await prisma.canonicalProduct.groupBy({
    by: ['categoryId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });
  
  const finalAllCats = await prisma.category.findMany();
  console.log('\n📊 Distribución final:');
  for (const fc of finalCounts) {
    const cat = finalAllCats.find(c => c.id === fc.categoryId);
    console.log(`   ${cat?.name ?? 'Unknown'}: ${fc._count.id}`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
