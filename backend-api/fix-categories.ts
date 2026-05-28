import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Asegurando la existencia de las nuevas categorías...');
  
  const desiredCategories = [
    'Frutas y Vegetales',
    'Carnes y Mariscos',
    'Despensa',
    'Lácteos',
    'Bebidas',
    'Limpieza',
    'Cuidado Personal',
    'Mascotas',
    'General'
  ];

  for (const catName of desiredCategories) {
    // Upsert needs a unique field. Assuming `name` is unique in Category schema.
    const existing = await prisma.category.findFirst({ where: { name: catName } });
    if (!existing) {
      await prisma.category.create({ data: { name: catName } });
    }
  }

  const categories = await prisma.category.findMany();
  const catMap: Record<string, string> = {};
  for (const c of categories) {
    catMap[c.name] = c.id;
  }

  const CA_FRUTAS = catMap['Frutas y Vegetales'];
  const CA_CARNES_MARISCOS = catMap['Carnes y Mariscos'];
  const CA_DESPENSA = catMap['Despensa'];
  const CA_LACTEOS = catMap['Lácteos'];
  const CA_BEBIDAS = catMap['Bebidas'];
  const CA_LIMPIEZA = catMap['Limpieza'];
  const CA_CUIDADO = catMap['Cuidado Personal'];
  const CA_MASCOTAS = catMap['Mascotas'];
  const CA_GENERAL = catMap['General'];

  console.log('Iniciando recategorización masiva...');
  const products = await prisma.canonicalProduct.findMany();
  let updatedCount = 0;

  for (const p of products) {
    const name = p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let targetId = p.categoryId;

    // REGLAS ESTRICTAS DE CATEGORIZACIÓN (Ordenadas por prioridad)

    // 1. MASCOTAS
    if (/\b(perro|gato|mascota|mascotas|dog chow|pedigree|purina|whiskas|felix|cachorro|gatito|pet|gatos|perros)\b/.test(name)) {
      targetId = CA_MASCOTAS;
    }
    // 2. CUIDADO PERSONAL
    else if (/\b(shampoo|desodorante|pasta dental|colgate|cepillo dental|papel higienico|toalla sanitaria|tampon|jabon|gel de baño|acondicionador|crema corporal|listerine|enjuague bucal|rasuradora|gillette|pañales|huggies|pampers|toallitas)\b/.test(name)) {
      targetId = CA_CUIDADO;
    }
    // 3. LIMPIEZA
    else if (/\b(detergente|cloro|desinfectante|suavizante|lavaplatos|mistolin|fabuloso|ariel|oso|downy|suavitel|escoba|trapeador|esponja|brillo|servilleta|papel toalla|fundas de basura|insecticida|raid|baygon)\b/.test(name)) {
      targetId = CA_LIMPIEZA;
    }
    // 4. BEBIDAS (Incluye Licores)
    else if (/\b(jugo|agua|refresco|soda|malta|gatorade|coca cola|pepsi|7up|sprite|red bull|monster|energizante|te frio|lipton|ron|cerveza|vino|whisky|vodka|tequila|ginebra|brugal|barcelo|presidente|brahma|corona|heineken|chivas|buchanans|absolut)\b/.test(name) && !name.includes("leche")) {
      targetId = CA_BEBIDAS;
    }
    // 5. CARNES Y MARISCOS (Incluye Embutidos)
    else if (/\b(carne|cerdo|res|pollo|chuleta|pechuga|muslo|alas|alitas|filete|hamburguesa|molida|costilla|chivo|ovejo|marisco|camaron|pescado|salmon|tilapia|mero|atun|sardina|salami|jamon|salchicha|longaniza|pepperoni|mortadela|tocineta|bacon|chorizo|prosciutto|pastrami)\b/.test(name) && !name.includes("sazon") && !name.includes("caldo") && !name.includes("sopa")) {
      targetId = CA_CARNES_MARISCOS;
    }
    // 6. FRUTAS Y VEGETALES
    else if (/\b(manzana|platano|guineo|uva|naranja|limon|tomate|cebolla|ajo|aji|pimiento|papa|zanahoria|lechuga|repollo|pepino|aguacate|melon|sandia|piña|fresa|yuca|batata|vegetal|fruta)\b/.test(name) && !/\b(jugo|sabor|ambientador|aceite|jabon|shampoo|aroma|crema|aerosol|mermelada|galleta|bizcocho|dulce|yogurt|leche|te|sazon|caldo|sopa)\b/.test(name)) {
      targetId = CA_FRUTAS;
    }
    // 7. LÁCTEOS
    else if (/\b(leche|queso|yogurt|mantequilla|crema de leche|lactosa|nata)\b/.test(name) && !name.includes("cafe") && !name.includes("catibia") && !name.includes("empanada") && !name.includes("pastelito") && !name.includes("dulce")) {
      targetId = CA_LACTEOS;
    }
    // 8. DESPENSA (Cosas secas o ingredientes)
    else if (/\b(arroz|aceite|habichuela|guandules|espagueti|pasta|azucar|sal|cafe|salsa|sazon|galleta|harina|avena|cereal|corn flakes|maiz|ketchup|mayonesa|vinagre|caldo|sopa|sopita|maggi|doña gallina|mermelada|miel|pan|casabe|dulce|bizcocho|chocolate|cacao|te)\b/.test(name)) {
      targetId = CA_DESPENSA;
    } else {
      targetId = CA_GENERAL;
    }

    // Actualizar si hubo un cambio
    if (targetId && targetId !== p.categoryId) {
      await prisma.canonicalProduct.update({
        where: { id: p.id },
        data: { categoryId: targetId }
      });
      updatedCount++;
    }
  }

  console.log(`\n¡Recategorización completada! Se ajustaron ${updatedCount} productos a las nuevas 8 categorías.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
