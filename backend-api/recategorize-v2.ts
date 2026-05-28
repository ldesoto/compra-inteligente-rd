import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Normalize: lowercase, remove accents
function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Check if name contains ANY of these words (exact word match)
function hasAny(name: string, words: string[]): boolean {
  return words.some(w => {
    const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[\\s,.()\\/\\-])${escaped}([\\s,.()\\/\\-]|$)`).test(name);
  });
}

// Check if name contains ALL of these words
function hasAll(name: string, words: string[]): boolean {
  return words.every(w => name.includes(w));
}

type CategoryRule = {
  category: string;
  // Must have at least one of these
  required: string[];
  // Must NOT have any of these
  forbidden: string[];
  // Optional context boost words
  boost?: string[];
};

// Categories in PRIORITY ORDER (first match wins)
const RULES: CategoryRule[] = [

  // ── 1. MASCOTAS ──────────────────────────────────────────────────────────
  {
    category: 'Mascotas',
    required: [
      'pedigree', 'purina', 'whiskas', 'friskies', 'dog chow', 'cat chow',
      'iams', 'royal canin', 'eukanuba', 'cesar', 'felix cat', 'fancy feast',
      'kibble', 'wet food', 'dry food',
      // keywords solo suficientemente únicos
      'alimento para perro', 'alimento para gato', 'alimento para mascotas',
      'cama para perro', 'cama para gato', 'correa para perro',
      'arena para gato', 'arena sanitaria', 'comedero',
      'juguete para perro', 'juguete para gato',
      'shampoo para perro', 'shampoo para mascotas',
      'antipulgas', 'desparasitante', 'collar antipulgas',
    ],
    forbidden: [],
  },
  // Pets: also catch "perro" and "gato" but ONLY if combined with pet context
  {
    category: 'Mascotas',
    required: ['cachorro'],
    forbidden: ['cafe', 'chocolate', 'crema', 'galleta', 'pastel', 'dulce'],
  },

  // ── 2. CUIDADO PERSONAL ──────────────────────────────────────────────────
  {
    category: 'Cuidado Personal',
    required: [
      'shampoo', 'champu', 'acondicionador', 'tratamiento capilar',
      'tinte de cabello', 'tinte para cabello', 'coloracion',
      'desodorante', 'antitranspirante',
      'pasta dental', 'crema dental', 'blanqueador dental',
      'cepillo dental', 'hilo dental', 'enjuague bucal', 'listerine', 'colgate',
      'jabón de baño', 'jabon de baño', 'gel de baño', 'gel ducha',
      'espuma de afeitar', 'crema de afeitar', 'rasuradora', 'gillette', 'schick',
      'papel higiénico', 'papel higienico', 'papel de baño',
      'toalla sanitaria', 'tampón', 'tampon', 'copa menstrual',
      'pañales', 'pañal', 'huggies', 'pampers', 'toallitas húmedas', 'toallitas humedas',
      'crema corporal', 'loción corporal', 'locion corporal',
      'protector solar', 'bloqueador solar',
      'maquillaje', 'labial', 'rímel', 'rimel', 'mascara de ojos',
      'perfume', 'colonia', 'eau de toilette',
      'hidratante facial', 'sérum', 'serum facial',
    ],
    forbidden: ['comida', 'alimento', 'cocina'],
  },

  // ── 3. LIMPIEZA ──────────────────────────────────────────────────────────
  {
    category: 'Limpieza',
    required: [
      'detergente', 'suavizante de ropa', 'suavitel',
      'cloro', 'blanqueador',
      'desinfectante', 'desinfectante de piso',
      'limpiador', 'limpiador multiusos',
      'lavaplatos', 'lavatrastes',
      'mistolin', 'fabuloso', 'lysol', 'pinesol', 'pino sol',
      'ariel', 'tide', 'gain', 'downy', 'omo',
      'escoba', 'trapeador', 'mopa',
      'esponja', 'esponja de cocina', 'fibra de cocina',
      'brillo para pisos', 'cera para pisos',
      'papel toalla', 'papel de cocina', 'papel absorbente',
      'servilletas', 'servilleta',
      'fundas de basura', 'bolsa de basura', 'bolsas de basura',
      'insecticida', 'raid', 'baygon', 'fumigador',
      'limpiavidrios', 'windex',
      'quitamancha', 'quitamanchas',
      'desengrasante',
    ],
    forbidden: ['comida', 'alimento', 'consumo'],
  },

  // ── 4. BEBIDAS (incl. licores) ───────────────────────────────────────────
  {
    category: 'Bebidas',
    required: [
      // Alcoholic
      'ron ', 'ron\t', // trailing space to avoid "ron" in other words
      'whisky', 'whiskey', 'bourbon',
      'vodka', 'tequila', 'mezcal',
      'ginebra', 'gin ',
      'cerveza', 'birra',
      'vino tinto', 'vino blanco', 'vino rosado', 'vino espumoso', 'cava', 'champagne', 'champan', 'prosecco',
      'brugal', 'barcelo', 'bermudez', 'presidente', 'heineken', 'corona beer', 'brahma', 'stella artois',
      'chivas', 'buchanans', 'absolut vodka', 'smirnoff', 'jack daniel', 'johnnie walker',
      // Non-alcoholic
      'refresco', 'soda', 'agua purificada', 'agua mineral', 'agua con gas', 'agua sin gas',
      'jugo de naranja', 'jugo de manzana', 'jugo de uva', 'jugo de pina', 'jugo de fresa',
      'jugo de tomate', 'jugo de zanahoria', 'jugo natural', 'jugo 100%',
      'agua de coco',
      'gatorade', 'powerade',
      'coca cola', 'pepsi', '7up', 'sprite', 'fanta', 'canada dry',
      'limonada', 'naranjada',
      'red bull', 'monster energy', 'energizante',
      'malta india', 'malta polar', 'malta morenita',
      'lipton', 'te frio', 'te helado', 'te en botella',
    ],
    forbidden: ['mermelada', 'saborizante', 'esencia de', 'extracto de', 'aroma de', 'galleta', 'dulce', 'caramelo', 'bombón'],
  },
  // Catch-all for jugo / agua
  {
    category: 'Bebidas',
    required: ['jugo'],
    forbidden: ['mermelada', 'saborizante', 'esencia', 'extracto', 'aroma', 'galleta', 'dulce', 'caramelo', 'crema', 'pasta de', 'sazón', 'sazon', 'concentrado de sabor', 'caldo', 'sopa'],
  },
  {
    category: 'Bebidas',
    required: ['agua'],
    forbidden: ['mermelada', 'galleta', 'crema', 'pasta de', 'caldo', 'sopa', 'shampoo', 'lavado', 'limpieza', 'colonia', 'perfume', 'locion'],
  },

  // ── 5. CARNES Y MARISCOS ─────────────────────────────────────────────────
  {
    category: 'Carnes y Mariscos',
    required: [
      // Seafood - very specific, always meat
      'camarones', 'camaron', 'langosta', 'langostino', 'pulpo', 'calamar', 'cangreja',
      'salmon', 'tilapia', 'mero', 'mahi mahi', 'pargo', 'chillo', 'carite', 'atun fresco',
      'mariscos', 'filete de pescado', 'pescado fresco',
      // Cuts of meat - physical cuts
      'chuleta de cerdo', 'chuleta de res', 'chuleta ahumada',
      'pechuga de pollo', 'muslo de pollo', 'alas de pollo', 'alitas de pollo',
      'filete de res', 'filete de cerdo', 'filete de pollo',
      'costilla de res', 'costilla de cerdo',
      'carne molida', 'carne picada',
      'lomo de cerdo', 'lomo de res',
      'pierna de cerdo', 'pierna de pollo',
      'pollo entero', 'pollo asado', 'medio pollo',
      'fajitas de res', 'fajitas de pollo',
      'chivo', 'cabrito',
      // Deli meats - processed but still "carnes"
      'salami', 'salchichon', 'salchichón',
      'jamon de pavo', 'jamon de cerdo', 'jamon cocido', 'jamon ahumado',
      'longaniza', 'chorizo', 'morcilla',
      'mortadela', 'bologna',
      'pepperoni',
      'salchicha', 'frankfurter', 'hot dog',
      'tocineta', 'tocino', 'bacon',
      'pastrami', 'prosciutto',
      'embutido',
    ],
    forbidden: [
      'galleta', 'lunchmaker', 'lunch maker', 'pizza kit', 'cracker',
      'pasta de', 'caldo de', 'sopa de', 'sazón', 'sazon', 'base para',
      'sabor a', 'saborizante', 'condimento', 'adobo',
      'molida canela', 'canela molida', 'pimienta molida', 'comino molido',
      'shampoo', 'jabon', 'crema de', 'aceite de',
    ],
  },
  // Catch raw pollo / carne / res / cerdo when they appear ALONE
  {
    category: 'Carnes y Mariscos',
    required: ['pollo'],
    forbidden: [
      'caldo', 'sopa', 'sazon', 'sazón', 'condimento', 'sabor', 'base',
      'doña gallina', 'maggi', 'knorr', 'consome', 'consomé',
      'frito', 'empanado', 'nugget', 'burritos', 'tacos', 'ensalada',
      'shampoo', 'detergente', 'jabón', 'crema',
    ],
  },
  {
    category: 'Carnes y Mariscos',
    required: ['carne de res'],
    forbidden: ['caldo', 'sopa', 'sazon', 'sazón', 'condimento', 'sabor', 'base'],
  },

  // ── 6. FRUTAS Y VEGETALES ────────────────────────────────────────────────
  {
    category: 'Frutas y Vegetales',
    required: [
      'manzana verde', 'manzana roja', 'manzana fuji', 'manzana granny',
      'platano macho', 'guineo maduro', 'guineo verde', 'platano verde',
      'uvas verdes', 'uvas rojas', 'uvas sin semilla',
      'naranja navel', 'mandarina', 'clementina',
      'limon persa', 'limon tahiti', 'lima',
      'tomate cherry', 'tomate beefsteak', 'tomates',
      'cebolla blanca', 'cebolla roja', 'cebolla morada',
      'ajo pelado', 'dientes de ajo',
      'aji cubanela', 'aji caballero', 'pimiento rojo', 'pimiento verde',
      'papa blanca', 'papa roja', 'papa russet',
      'zanahoria baby', 'zanahoria rallada',
      'lechuga romana', 'lechuga iceberg', 'lechuga',
      'repollo verde', 'repollo morado',
      'pepino cohombro',
      'aguacate hass', 'aguacate criollo',
      'melon cantalupo', 'sandia sin semilla',
      'pina golden',
      'fresas', 'frutos rojos', 'arándanos', 'arandanos', 'frambuesas', 'moras',
      'yuca fresca', 'batata',
      'espinaca', 'col rizada', 'kale', 'acelga', 'berro',
      'brócoli', 'brocoli', 'coliflor', 'apio',
      'habichuela tierna', 'vainitas',
      'celery', 'remolacha',
      'vegetales mixtos', 'mix de vegetales',
      'verduras frescas', 'frutas frescas',
    ],
    forbidden: [
      'jugo', 'néctar', 'nectar', 'refresco', 'bebida',
      'mermelada', 'conserva', 'compota', 'gelatina',
      'ambientador', 'aroma', 'fragancia', 'perfume', 'esencia',
      'shampoo', 'acondicionador', 'jabón', 'crema',
      'galleta', 'bizcocho', 'dulce', 'caramelo', 'candy',
      'sazon', 'sazón', 'condimento', 'caldo', 'sopa',
      'aceite de', 'vinagre de',
      'yogurt', 'helado',
    ],
  },

  // ── 7. LÁCTEOS ───────────────────────────────────────────────────────────
  {
    category: 'Lácteos',
    required: [
      'leche entera', 'leche semidescremada', 'leche descremada', 'leche evaporada',
      'leche condensada', 'leche en polvo', 'leche uht', 'leche pasteurizada',
      'leche de vaca', 'leche de almendra', 'leche de avena', 'leche de soya',
      'leche sin lactosa', 'leche baja en grasa',
      'queso cheddar', 'queso gouda', 'queso mozzarella', 'queso parmesano',
      'queso manchego', 'queso brie', 'queso ricotta', 'queso cottage',
      'queso de hoja', 'queso blanco', 'queso amarillo', 'queso procesado',
      'queso crema', 'queso Philadelphia',
      'yogurt natural', 'yogurt griego', 'yogurt sabor', 'yogurt bebible',
      'mantequilla sin sal', 'mantequilla con sal', 'margarina',
      'crema de leche', 'nata', 'crema agria', 'sour cream',
      'suero de leche', 'buttermilk',
      'helado de vainilla', 'helado de chocolate', 'helado de fresa',
      'dos pinos', 'parmalat', 'lechosa',
    ],
    forbidden: [
      'cafe con leche', 'cacao con leche', 'chocolate con leche',
      'galleta de queso', 'crema de queso para pasta',
      'shampoo', 'crema corporal', 'locion',
    ],
  },

  // ── 8. DESPENSA ──────────────────────────────────────────────────────────
  {
    category: 'Despensa',
    required: [
      // Grains
      'arroz largo', 'arroz extra largo', 'arroz jasmine', 'arroz basmati', 'arroz integral',
      'arroz grano', 'arroz uncle ben', 'arroz mahatma',
      'habichuela negra', 'habichuela roja', 'habichuela pinta',
      'guandules verdes', 'guandules secos',
      'lentejas', 'garbanzos', 'frijoles',
      // Oils
      'aceite de oliva', 'aceite vegetal', 'aceite de maiz', 'aceite de girasol',
      'aceite de canola', 'aceite de soya', 'aceite de coco',
      // Pasta / flour
      'espagueti', 'spaghetti', 'penne', 'fettuccine', 'tallarines',
      'harina de trigo', 'harina de maiz', 'harina de arroz', 'masa harina', 'masarepa',
      // Sugar / sweeteners
      'azucar blanca', 'azucar morena', 'azucar refinada', 'azucar en polvo',
      'miel de abeja', 'miel pura',
      'stevia', 'splenda', 'equal', 'endulzante',
      // Condiments / sauces
      'ketchup', 'catsup',
      'mayonesa', 'mayonnaise',
      'mostaza', 'dijon',
      'salsa de tomate', 'salsa marinara', 'salsa para pasta',
      'salsa de soya', 'salsa teriyaki', 'salsa worcestershire', 'salsa inglesa',
      'salsa picante', 'tabasco', 'sriracha',
      'vinagre blanco', 'vinagre de manzana', 'vinagre balsamico',
      // Canned / preserved
      'atun en lata', 'atun en agua', 'atun en aceite',
      'sardinas en', 'salmon en lata', 'macarela en lata',
      'tomate en lata', 'pasta de tomate', 'tomates enlatados',
      'maiz enlatado', 'maiz en grano',
      'hongos enlatados', 'hongos en lata',
      'almejas enlatadas', 'cangrejo en lata',
      'palmitos', 'corazon de palma',
      'aceitunas', 'pepinillos',
      // Dry soups / broths
      'caldo de pollo', 'caldo de res', 'caldo de mariscos',
      'sopita', 'doña gallina', 'maggi', 'knorr',
      'sopa de fideos', 'sopa de mariscos',
      // Spices / seasonings
      'sal marina', 'sal kosher', 'sal de mesa',
      'pimienta negra', 'pimienta blanca', 'pimienta molida',
      'oregano', 'comino', 'canela en rama', 'canela molida', 'nuez moscada',
      'paprika', 'pimenton', 'curcuma', 'curry',
      'ajo en polvo', 'cebolla en polvo',
      'sazon completo', 'sazon goya', 'sazón completo', 'sazón goya', 'adobo goya',
      'hierbas', 'laurel',
      // Snacks & sweets
      'galletas', 'galleta',
      'chips', 'papitas', 'cheetos', 'doritos', 'pringles',
      'palomitas', 'popcorn',
      'chocolates', 'chocolate', 'cacao en polvo',
      'dulces', 'caramelos', 'gomitas', 'gummies',
      'barras de cereal', 'granola',
      'mani', 'cacahuetes', 'nueces', 'almendras', 'pistachos',
      'mermelada', 'jalea de',
      'casabe',
      // Cereals / breakfast
      'corn flakes', 'cereal de trigo', 'cereal de arroz', 'cheerios', 'frosted flakes', 'captain crunch',
      'avena en hojuelas', 'avena instantanea', 'quaker',
      // Coffee / tea (hot drinks)
      'cafe molido', 'cafe instantaneo', 'cafe en grano', 'cafe bustelo', 'cafe Santo Domingo',
      'te negro', 'te verde', 'manzanilla', 'te de hierbas',
      // Baking
      'polvo de hornear', 'levadura', 'bicarbonato', 'vainilla extracto',
      // Bread / bakery
      'pan de molde', 'pan integral', 'pan blanco', 'pan bimbo',
      'tortillas de maiz', 'tortillas de harina',
    ],
    forbidden: ['shampoo', 'detergente', 'cloro', 'jabón de baño', 'crema corporal'],
  },

];

// --- MAIN CATEGORIZATION FUNCTION ---
function categorize(name: string, catMap: Record<string, string>): string | null {
  const n = norm(name);

  for (const rule of RULES) {
    const catId = catMap[rule.category];
    if (!catId) continue;

    const hasRequired = rule.required.some(w => n.includes(norm(w)));
    if (!hasRequired) continue;

    const hasForbidden = rule.forbidden.some(w => n.includes(norm(w)));
    if (hasForbidden) continue;

    return catId;
  }

  return catMap['General'] ?? null;
}

async function main() {
  console.log('Asegurando existencia de categorías objetivo...');

  const targetCategories = [
    'Frutas y Vegetales', 'Carnes y Mariscos', 'Despensa',
    'Lácteos', 'Bebidas', 'Limpieza', 'Cuidado Personal', 'Mascotas', 'General'
  ];

  for (const catName of targetCategories) {
    const exists = await prisma.category.findFirst({ where: { name: catName } });
    if (!exists) {
      await prisma.category.create({ data: { name: catName } });
      console.log(`  Creada: ${catName}`);
    }
  }

  const categories = await prisma.category.findMany();
  const catMap: Record<string, string> = {};
  for (const c of categories) catMap[c.name] = c.id;

  console.log('\nCargando todos los productos...');
  const products = await prisma.canonicalProduct.findMany({ select: { id: true, name: true, categoryId: true } });
  console.log(`Total: ${products.length} productos\n`);

  let updatedCount = 0;
  let unchangedCount = 0;
  const categoryCounts: Record<string, number> = {};

  for (const p of products) {
    const targetId = categorize(p.name, catMap);
    if (!targetId) { unchangedCount++; continue; }

    // Track what category was assigned
    const catName = Object.keys(catMap).find(k => catMap[k] === targetId) ?? 'Unknown';
    categoryCounts[catName] = (categoryCounts[catName] ?? 0) + 1;

    if (targetId !== p.categoryId) {
      await prisma.canonicalProduct.update({
        where: { id: p.id },
        data: { categoryId: targetId }
      });
      updatedCount++;
    } else {
      unchangedCount++;
    }
  }

  console.log(`\n✅ Recategorización v2 completada!`);
  console.log(`   Actualizados: ${updatedCount}`);
  console.log(`   Sin cambio:   ${unchangedCount}`);
  console.log(`\n📊 Distribución por categoría:`);
  Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => console.log(`   ${cat}: ${count}`));
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
