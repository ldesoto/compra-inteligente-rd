import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

// ─── NORMALIZE helper ────────────────────────────────────────────────────────
function n(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ─── EXACT WORD MATCH ────────────────────────────────────────────────────────
// Returns true if any of `words` appear as a standalone token in `name`
function has(name: string, words: string[]): boolean {
  return words.some(w => name.includes(n(w)));
}

// ─── CATEGORIZATION ENGINE v3 ────────────────────────────────────────────────
// Returns the target category name, or 'General' if nothing matches
function categorize(rawName: string): string {
  const name = n(rawName);

  // ── MASCOTAS ──────────────────────────────────────────────────────────────
  const PET_BRANDS = ['pedigree', 'purina', 'whiskas', 'friskies', 'dog chow', 'cat chow',
    'iams', 'royal canin', 'eukanuba', 'cesar dog', 'fancy feast', 'tidy cats',
    'arm & hammer arena', 'tiger pet', 'neo clean', 'ringo +pro', 'ringo pro',
    'paws premium almohadilla'];
  const PET_KEYWORDS = ['alimento para perro', 'alimento para gato', 'alimento para mascota',
    'alimento humedo para perro', 'alimento seco para perro', 'alimento humedo para gato',
    'arena para gato', 'arena sanitaria para gato',
    'almohadilla de entrenamiento para cachorro',
    'comedero para perro', 'comedero para gato',
    'juguete para perro', 'juguete para gato',
    'correa para perro', 'collar para perro',
    'antipulgas', 'desparasitante para perro', 'desparasitante para gato',
    'shampoo para perro', 'shampoo para mascota'];
  if (has(name, PET_BRANDS) || has(name, PET_KEYWORDS)) return 'Mascotas';
  // Pet food containers ("alimento seco/humedo" alone can be for humans but with cachorro/perro/gato it's pet)
  if ((name.includes('cachorro') || name.includes('para perro') || name.includes('para gato'))
    && !name.includes('crema') && !name.includes('cafe') && !name.includes('galleta')) {
    return 'Mascotas';
  }

  // ── CUIDADO PERSONAL ─────────────────────────────────────────────────────
  const PERSONAL_CARE = [
    'shampoo', 'champu', 'acondicionador capilar', 'tratamiento capilar', 'mascarilla capilar',
    'tinte de cabello', 'tinte para cabello', 'coloracion capilar',
    'desodorante', 'antitranspirante',
    'pasta dental', 'crema dental', 'blanqueador dental', 'cepillo dental',
    'hilo dental', 'enjuague bucal', 'listerine',
    'gel de baño', 'gel ducha', 'jabon de baño', 'jabón de baño',
    'espuma de afeitar', 'crema de afeitar', 'rasuradora', 'gillette', 'schick',
    'papel higienico', 'papel higiénico', 'papel de bano',
    'toalla sanitaria', 'tampon', 'copa menstrual',
    'panales', 'pañales', 'huggies', 'pampers',
    'toallitas humedas', 'toallitas húmedas',
    'crema corporal', 'locion corporal', 'loción corporal',
    'protector solar', 'bloqueador solar', 'spf',
    'maquillaje', 'labial', 'rimel', 'mascara de pestanas', 'corrector',
    'perfume dama', 'perfume hombre', 'colonia hombre', 'colonia dama',
    'eau de toilette', 'eau de parfum',
    'serum facial', 'sérum facial', 'crema facial', 'hidratante facial', 'toner facial',
    'agua micelar',  // "agua micelar" is NOT a drinking water
    'desmaquillante',
  ];
  if (has(name, PERSONAL_CARE)) return 'Cuidado Personal';

  // ── LIMPIEZA ──────────────────────────────────────────────────────────────
  const CLEANING = [
    'detergente', 'suavizante de ropa', 'suavitel', 'downy ropa', 'downy tela',
    'cloro ', 'blanqueador ropa', 'blanqueador piso',
    'desinfectante piso', 'desinfectante superficie', 'desinfectante multiusos',
    'limpiador multiusos', 'limpiador bano', 'limpiador cocina',
    'lavaplatos', 'lavatrastes', 'ajax', 'dawn dishwashing',
    'mistolin', 'fabuloso', 'lysol', 'pinesol', 'pine sol',
    'ariel', 'tide ', 'gain detergente', 'omo detergente',
    'escoba', 'trapeador', 'mopa piso',
    'esponja de cocina', 'fibra de cocina', 'estropajo',
    'brillo piso', 'cera para piso', 'cera piso',
    'papel toalla', 'papel de cocina', 'papel absorbente', 'toallas de papel',
    'servilletas de papel', 'servilleta papel',
    'fundas de basura', 'bolsa de basura', 'bolsas de basura', 'funda basura',
    'insecticida', 'raid ', 'baygon', 'fumigador',
    'limpiavidrios', 'windex',
    'quitamanchas', 'quitamancha',
    'desengrasante cocina',
    'glade ambientador', 'febreze', 'air wick', 'ambientador spray',
    'cloro clorox', 'clorox',
  ];
  if (has(name, CLEANING)) return 'Limpieza';

  // ── BEBIDAS ───────────────────────────────────────────────────────────────
  // Only exact beverage products — no "sabor a" or flavored non-drinks
  const ALCOHOL = ['ron brugal', 'ron barcelo', 'ron bermudez', 'ron bacardi', 'ron appleton',
    'whisky', 'whiskey', 'bourbon', 'scotch',
    'vodka ', 'tequila ', 'mezcal ', 'ginebra ', ' gin ',
    'cerveza ', 'cerveza\t',
    'vino tinto', 'vino blanco', 'vino rosado', 'vino espumoso',
    'cava ', 'champagne', 'champan', 'prosecco', 'cava brut',
    'heineken', 'corona beer', 'brahma cerveza', 'stella artois',
    'presidente beer', 'presidente lata', 'presidente botella',
    'chivas regal', 'buchanans whisky', 'absolut vodka', 'smirnoff vodka',
    'jack daniel', 'johnnie walker', 'brugal leyenda', 'barcelo imperial',
    'aguardiente',
    'licor de ', 'crema de whisky', 'baileys', 'kahlua'];
  if (has(name, ALCOHOL)) return 'Bebidas';

  const NON_ALCOHOL_DRINKS = [
    'refresco ', 'soda water', 'agua tonica', 'agua tónica',
    'agua purificada', 'agua mineral', 'agua con gas', 'agua sin gas', 'agua de manantial',
    'agua de coco',
    'jugo de naranja', 'jugo de manzana', 'jugo de uva', 'jugo de pina', 'jugo de fresa',
    'jugo de tomate', 'jugo de zanahoria', 'jugo natural', 'jugo 100',
    'nectar de ', 'néctar de ',
    'gatorade', 'powerade', 'electrolit',
    'coca cola', 'pepsi ', '7up ', 'sprite ', 'fanta ', 'canada dry',
    'limonada lista', 'naranjada lista',
    'red bull', 'monster energy', 'bang energy', 'celsius energy',
    'malta india', 'malta polar', 'malta morenita', 'malta presidente',
    'lipton ice tea', 'te helado', 'te frio', 'snapple',
    'kombucha', 'kefir bebible',
    'leche de avena oatly', 'bebida de avena', 'bebida de almendra', 'bebida de soya',
    'smoothie ', 'batido listo',
    'san pellegrino', 'perrier ', 'schweppes',
  ];
  if (has(name, NON_ALCOHOL_DRINKS)) return 'Bebidas';

  // ── CARNES Y MARISCOS ─────────────────────────────────────────────────────
  const SEAFOOD = ['camarones frescos', 'camaron fresco', 'langosta fresca', 'langostino fresco',
    'pulpo fresco', 'calamar fresco', 'tilapia fresca', 'salmon fresco',
    'mero fresco', 'pargo fresco', 'chillo fresco', 'carite fresco',
    'filete de pescado', 'filete de tilapia', 'filete de salmon',
    'rodajas de carite', 'rodajas de salmon',
    'pescado fresco', 'mariscos frescos',
    'atun fresco', 'mahi mahi'];
  if (has(name, SEAFOOD)) return 'Carnes y Mariscos';

  // Deli meats — only when it's clearly the product, not a flavor
  const DELI_MEATS = [
    'salami de res', 'salami de pavo', 'salami dominicano', 'salchichon loncheado',
    'salchichon rebanado', 'salchichon por libra',
    'jamon de pavo', 'jamon de cerdo', 'jamon cocido', 'jamon ahumado', 'jamon york',
    'longaniza dominicana', 'longaniza de cerdo',
    'chorizo espanol', 'chorizo argentino',
    'mortadela ', 'bologna ',
    'pepperoni loncheado', 'pepperoni rebanado',
    'salchicha frankfurt', 'salchicha de pavo', 'salchicha de res', 'hot dog ',
    'tocineta ahumada', 'tocino ahumado', 'bacon ahumado',
    'pastrami rebanado', 'prosciutto loncheado',
    'embutido snack', 'embutido loncheado',
    'boars head', "boar's head",
    'luncheon meat', 'spam ',
  ];
  if (has(name, DELI_MEATS)) return 'Carnes y Mariscos';

  // Raw meat cuts — very specific phrases
  const RAW_MEAT = [
    'chuleta de cerdo', 'chuleta de res', 'chuleta ahumada', 'chuleta asar',
    'pechuga de pollo', 'muslo de pollo', 'alas de pollo', 'alitas de pollo', 'piernitas de pollo',
    'filete de res', 'filete de cerdo', 'filete de pollo',
    'costilla de res', 'costilla de cerdo',
    'carne molida de res', 'carne molida de cerdo', 'carne molida de pavo',
    'lomo de cerdo', 'lomo de res', 'lomo de pavo',
    'pierna de cerdo', 'pierna de pollo',
    'pollo entero', 'medio pollo', 'cuarto de pollo',
    'fajitas de res', 'fajitas de pollo', 'fajitas de cerdo',
    'chivo guisado', 'cabrito asado',
    'pavo entero', 'pechuga de pavo entera',
    'carne para guisar', 'carne para estofar',
    'brangus', 'wagyu', 'angus beef',
  ];
  if (has(name, RAW_MEAT)) return 'Carnes y Mariscos';

  // ── FRUTAS Y VEGETALES ────────────────────────────────────────────────────
  // Only clearly fresh produce — specific variety names or "fresco/fresca"
  const PRODUCE_BRANDS = ['fresh produce', 'organic farm'];
  const PRODUCE_SPECIFIC = [
    // Fruits — must be clearly the raw fruit, not a flavor
    'manzana verde und', 'manzana roja und', 'manzana fuji', 'manzana granny',
    'manzana honeycrisp', 'manzana gala',
    'platano macho', 'platano verde und', 'guineo maduro', 'guineo verde und',
    'uvas verdes sin semilla', 'uvas rojas sin semilla', 'uvas negras',
    'naranja navel', 'naranja por libra', 'mandarina und', 'clementina und',
    'limon persa', 'limon tahiti', 'lima persa',
    'tomate cherry', 'tomate beefsteak', 'tomate por libra', 'tomates und',
    'cebolla blanca por libra', 'cebolla roja por libra', 'cebolla morada',
    'ajo pelado', 'cabeza de ajo',
    'aji cubanela', 'aji caballero', 'pimiento rojo und', 'pimiento verde und',
    'pimiento morron',
    'papa blanca por libra', 'papa roja por libra', 'papa russet',
    'zanahoria por libra', 'zanahoria baby', 'zanahoria rallada',
    'lechuga romana', 'lechuga iceberg', 'lechuga orejona',
    'repollo verde und', 'repollo morado und',
    'pepino cohombro', 'pepino por libra',
    'aguacate hass', 'aguacate criollo und', 'aguacate popenoe', 'aguacate selecto',
    'melon cantalupo', 'sandia sin semilla', 'sandia por tajada',
    'pina golden', 'pina hawaiana',
    'fresas por libra', 'fresas paquete',
    'arandanos frescos', 'arándanos frescos', 'frambuesas frescas', 'moras frescas',
    'yuca fresca por libra', 'batata por libra',
    'espinaca fresca', 'col rizada fresca', 'kale fresco',
    'brocoli fresco', 'brócoli fresco', 'coliflor fresca', 'apio por libra',
    'habichuela tierna', 'vainitas frescas',
    'celery und', 'remolacha fresca',
    'vegetales mixtos frescos', 'mix de vegetales frescos',
    // viandas
    'yuca und', 'batata und', 'ñame', 'auyama por libra', 'chayote',
    'viveres paq',
  ];
  if (has(name, PRODUCE_BRANDS) || has(name, PRODUCE_SPECIFIC)) return 'Frutas y Vegetales';
  // Also catch generic patterns like "X; Und" or "X; Lb" for produce items
  if ((name.includes('; und') || name.includes('; lb') || name.includes('por libra') || name.includes('por unidad'))
    && (name.includes('aguacate') || name.includes('tomate') || name.includes('cebolla')
      || name.includes('platano') || name.includes('guineo') || name.includes('lechuga')
      || name.includes('repollo') || name.includes('piña') || name.includes('melon')
      || name.includes('sandia') || name.includes('papa ') || name.includes('yuca ')
      || name.includes('batata') || name.includes('auyama'))) {
    return 'Frutas y Vegetales';
  }

  // ── LÁCTEOS ───────────────────────────────────────────────────────────────
  const DAIRY = [
    'leche entera', 'leche semidescremada', 'leche descremada', 'leche evaporada',
    'leche condensada', 'leche en polvo', 'leche uht', 'leche pasteurizada',
    'leche sin lactosa', 'leche baja en grasa', 'leche deslactosada',
    'leche 2%', 'leche 1%', 'leche whole',
    'queso cheddar', 'queso gouda', 'queso mozzarella', 'queso parmesano',
    'queso manchego', 'queso brie', 'queso ricotta', 'queso cottage',
    'queso de hoja', 'queso blanco por libra', 'queso blanco paq', 'queso amarillo',
    'queso procesado', 'queso crema philadelphia', 'queso philadelphia',
    'queso tipo holandes', 'queso cheddar monte plata',
    'yogurt natural', 'yogurt griego', 'yogurt fresa', 'yogurt vainilla', 'yogurt bebible',
    'mantequilla sin sal', 'mantequilla con sal', 'margarina',
    'crema de leche', 'crema para batir', 'crema agria', 'sour cream', 'nata ',
    'dos pinos leche', 'parmalat leche',
    'helado de vainilla', 'helado de chocolate', 'helado de fresa', 'helado de coco',
    'huevos blancos', 'huevos marrones', 'huevos de gallina', 'cartón de huevos',
    'tofu ', // often shelved with dairy alternatives
  ];
  if (has(name, DAIRY)) return 'Lácteos';

  // ── DESPENSA ─────────────────────────────────────────────────────────────
  const PANTRY = [
    // Rice
    'arroz largo', 'arroz extra largo', 'arroz jasmine', 'arroz basmati', 'arroz integral',
    'arroz blanco', 'arroz parboiled', 'arroz mahatma', 'arroz uncle ben',
    // Beans
    'habichuela negra', 'habichuela roja', 'habichuela pinta', 'habichuela blanca',
    'guandules verdes', 'guandules secos', 'guandules con coco',
    'lentejas ', 'garbanzos ', 'frijoles ',
    // Oils (clearly labeled as cooking oil, not personal care)
    'aceite de oliva', 'aceite vegetal', 'aceite de maiz', 'aceite de girasol',
    'aceite de canola', 'aceite de soya', 'aceite de coco comestible',
    'aceite lider cocina', 'aceite la espanola',
    // Pasta
    'espagueti ', 'spaghetti ', 'penne ', 'fettuccine ', 'macarrones ', 'tallarines ',
    'pasta linguine', 'pasta rigatoni', 'pasta angel hair',
    // Flour
    'harina de trigo', 'harina de maiz', 'harina de arroz', 'masa harina', 'masarepa',
    'harina pan', 'harina pillsbury',
    // Sugars
    'azucar blanca', 'azucar morena', 'azucar refinada', 'azucar en polvo',
    'miel de abeja', 'miel pura de abeja',
    'stevia ', 'splenda ', 'equal ', 'truvia ',
    // Condiments
    'ketchup ', 'catsup ', 'mayonesa ', 'mostaza dijon', 'mostaza amarilla',
    'salsa de tomate lider', 'salsa marinara', 'salsa para pasta', 'salsa boloñesa',
    'salsa de soya', 'salsa teriyaki', 'salsa worcestershire', 'salsa inglesa',
    'salsa picante tabasco', 'tabasco ', 'sriracha ',
    'vinagre blanco', 'vinagre de manzana', 'vinagre balsamico',
    'aceitunas ', 'pepinillos ',
    // Canned / Preserved — explicitly canned
    'atun en lata', 'atun en agua', 'atun en aceite', 'atun chunk',
    'sardinas en ', 'salmon en lata', 'macarela en lata',
    'pasta de tomate', 'tomate entero enlatado', 'tomate triturado',
    'maiz en lata', 'maiz enlatado',
    'palmitos en lata', 'corazon de palma',
    'almejas en lata', 'cangrejo en lata',
    // Broths / soups
    'caldo de pollo maggi', 'caldo de res maggi', 'sopita ', 'doña gallina',
    'sopa de fideos', 'sopa de pollo', 'sopa de mariscos',
    'sazon goya', 'sazón goya', 'adobo goya', 'sazon completo', 'sazón completo',
    // Spices — clearly labeled
    'pimienta negra molida', 'pimienta blanca molida', 'pimienta cayena',
    'oregano seco', 'comino molido', 'canela molida', 'canela en rama',
    'nuez moscada', 'paprika ', 'pimenton ', 'curcuma ', 'curry en polvo',
    'ajo en polvo', 'cebolla en polvo', 'ajo granulado',
    'sal marina', 'sal kosher', 'sal de mesa', 'sal iodada',
    // Snacks & sweets
    'galletas oreo', 'galletas maria', 'galletas de agua', 'galletas club social',
    'chips lays', 'papitas pringles', 'cheetos ', 'doritos ', 'fritos ',
    'palomitas microondas', 'popcorn microondas',
    'chocolate hersheys', 'chocolate snickers', 'chocolate kit kat',
    'dulce de leche', 'caramelos masticables', 'gomitas haribo',
    'barra de cereal', 'granola ',
    'mani salado', 'nueces mixtas', 'almendras tostadas', 'pistachos tostados',
    'mermelada de fresa', 'mermelada de guayaba', 'mermelada de naranja',
    'casabe ',
    // Cereals
    'corn flakes', 'frosted flakes', 'cheerios ', 'captain crunch', 'rice krispies',
    'avena quaker', 'avena en hojuelas', 'avena instantanea',
    // Coffee / Hot drinks
    'cafe bustelo', 'cafe santo domingo', 'cafe molido', 'cafe instantaneo', 'cafe grano',
    'nescafe ', 'dolce gusto', 'capsulas de cafe',
    'manzanilla sobres', 'te negro lipton', 'te verde lipton',
    // Bread / Bakery
    'pan de molde', 'pan integral bimbo', 'pan blanco bimbo', 'pan hogaza',
    'tortillas de maiz', 'tortillas de harina',
    // Baking
    'polvo de hornear', 'levadura seca', 'bicarbonato de sodio', 'vainilla extracto',
  ];
  if (has(name, PANTRY)) return 'Despensa';

  return 'General';
}

async function main() {
  console.log('Cargando productos...');
  const products = await prisma.canonicalProduct.findMany({
    include: { category: true },
    orderBy: { name: 'asc' }
  });

  // Get category IDs
  const categories = await prisma.category.findMany();
  const catMap: Record<string, string> = {};
  for (const c of categories) catMap[c.name] = c.id;

  // Target categories only
  const TARGET_CATEGORIES = [
    'Frutas y Vegetales', 'Carnes y Mariscos', 'Despensa',
    'Lácteos', 'Bebidas', 'Limpieza', 'Cuidado Personal', 'Mascotas', 'General'
  ];
  for (const cat of TARGET_CATEGORIES) {
    if (!catMap[cat]) {
      const created = await prisma.category.create({ data: { name: cat } });
      catMap[cat] = created.id;
    }
  }

  // Recategorize and build CSV
  const csvLines: string[] = ['Producto,Categoría Asignada,Categoría Anterior'];
  let updated = 0;
  const distribution: Record<string, number> = {};

  for (const p of products) {
    const newCatName = categorize(p.name);
    const newCatId = catMap[newCatName];
    const oldCatName = p.category?.name ?? 'Sin categoría';

    distribution[newCatName] = (distribution[newCatName] ?? 0) + 1;

    // Update DB if changed
    if (newCatId && newCatId !== p.categoryId) {
      await prisma.canonicalProduct.update({
        where: { id: p.id },
        data: { categoryId: newCatId }
      });
      updated++;
    }

    // CSV line
    const safeName = p.name.replace(/,/g, ';').replace(/"/g, '');
    const safeCat = newCatName.replace(/,/g, ';');
    const safePrev = oldCatName.replace(/,/g, ';');
    csvLines.push(`${safeName},${safeCat},${safePrev}`);
  }

  // Write CSV sorted by category then name
  const sorted = csvLines.slice(1).sort((a, b) => {
    const catA = a.split(',')[1];
    const catB = b.split(',')[1];
    if (catA !== catB) return catA.localeCompare(catB);
    return a.localeCompare(b);
  });
  const output = [csvLines[0], ...sorted].join('\n');
  const csvPath = '/Users/luisdesoto/compra-inteligente-rd/productos_categorias.csv';
  require('fs').writeFileSync(csvPath, output, 'utf8');

  console.log(`\n✅ Recategorización v3 completada. Actualizados: ${updated}`);
  console.log('\n📊 Distribución:');
  Object.entries(distribution)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => console.log(`   ${cat}: ${count}`));
  console.log(`\n📄 CSV guardado en: ${csvPath}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
