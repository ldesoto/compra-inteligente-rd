import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create supermarkets (must match names used in scraper.service.ts exactly)
  const supermarkets = await Promise.all([
    prisma.supermarket.upsert({ where: { name: 'Jumbo' }, update: {}, create: { name: 'Jumbo', website: 'https://jumbo.com.do' } }),
    prisma.supermarket.upsert({ where: { name: 'La Sirena' }, update: {}, create: { name: 'La Sirena', website: 'https://sirena.do' } }),
    prisma.supermarket.upsert({ where: { name: 'Supermercado Bravo' }, update: {}, create: { name: 'Supermercado Bravo', website: 'https://supermercadosbravo.com' } }),
    prisma.supermarket.upsert({ where: { name: 'Nacional' }, update: {}, create: { name: 'Nacional', website: 'https://supermercadonacional.com.do' } }),
    prisma.supermarket.upsert({ where: { name: 'Plaza Lama' }, update: {}, create: { name: 'Plaza Lama', website: 'https://plazalama.com.do' } }),
  ]);

  const [jumbo, sirena, bravo, nacional] = supermarkets;
  console.log(`✅ ${supermarkets.length} supermercados creados`);

  // Create Category
  const category = await prisma.category.upsert({
    where: { name: 'Lácteos' },
    update: {},
    create: { name: 'Lácteos' }
  });

  // Massive Dominican Product Catalog
  const productsToSeed = [
    // Arroz
    { name: 'Arroz Premium La Garza 10 Lbs', cat: 'Granos y Cereales', unit: 'lb', weight: 10, img: 'https://jumbo.com.do/media/catalog/product/a/r/arroz-la-garza-10-lb-1.jpg', prices: [440, 445, 450] },
    { name: 'Arroz Premium La Garza 5 Lbs', cat: 'Granos y Cereales', unit: 'lb', weight: 5, img: 'https://jumbo.com.do/media/catalog/product/a/r/arroz-la-garza-10-lb-1.jpg', prices: [225, 230, 235] },
    { name: 'Arroz Campos Premium 10 Lbs', cat: 'Granos y Cereales', unit: 'lb', weight: 10, img: 'https://jumbo.com.do/media/catalog/product/a/r/arroz-campos-5-lb-1.jpg', prices: [435, 440, 442] },
    { name: 'Arroz Campos Premium 5 Lb', cat: 'Granos y Cereales', unit: 'lb', weight: 5, img: 'https://jumbo.com.do/media/catalog/product/a/r/arroz-campos-5-lb-1.jpg', prices: [235, 238, 240] },
    { name: 'Arroz Wala Premium 10 Lb', cat: 'Granos y Cereales', unit: 'lb', weight: 10, img: 'https://jumbo.com.do/media/catalog/product/2/1/2115160_1.jpg', prices: [348, 355, 360] },
    { name: 'Arroz Pimco Selecto 10 Lbs', cat: 'Granos y Cereales', unit: 'lb', weight: 10, img: 'https://jumbo.com.do/media/catalog/product/a/r/arroz-pimco-10-lb-1.jpg', prices: [425, 430, 435] },
    { name: 'Arroz Bisonó 10 Lbs', cat: 'Granos y Cereales', unit: 'lb', weight: 10, img: 'https://via.placeholder.com/150', prices: [420, 425, 430] },
    { name: 'Arroz Donato 10 Lbs', cat: 'Granos y Cereales', unit: 'lb', weight: 10, img: 'https://via.placeholder.com/150', prices: [410, 415, 420] },

    // Aceites
    { name: 'Aceite de Soya Crisol 1 Galón', cat: 'Aceites y Grasas', unit: 'Galón', weight: 1, img: 'https://jumbo.com.do/media/catalog/product/a/c/aceite-crisol-1-galon-1.jpg', prices: [540, 550, 560] },
    { name: 'Aceite de Soya Crisol 128 oz', cat: 'Aceites y Grasas', unit: 'oz', weight: 128, img: 'https://jumbo.com.do/media/catalog/product/a/c/aceite-crisol-1-galon-1.jpg', prices: [530, 540, 550] },
    { name: 'Aceite de Soya Crisol 64 oz', cat: 'Aceites y Grasas', unit: 'oz', weight: 64, img: 'https://via.placeholder.com/150', prices: [280, 290, 300] },
    { name: 'Aceite de Maní El Manicero 128 oz', cat: 'Aceites y Grasas', unit: 'oz', weight: 128, img: 'https://jumbo.com.do/media/catalog/product/a/c/aceite-manicero-128-oz-1.jpg', prices: [620, 630, 640] },
    { name: 'Aceite de Soya Ideal 1 Galón', cat: 'Aceites y Grasas', unit: 'Galón', weight: 1, img: 'https://via.placeholder.com/150', prices: [520, 530, 540] },
    { name: 'Aceite de Oliva Fígaro Extra Virgen 500ml', cat: 'Aceites y Grasas', unit: 'ml', weight: 500, img: 'https://via.placeholder.com/150', prices: [450, 460, 470] },
    { name: 'Aceite de Oliva Betis Extra Virgen 500ml', cat: 'Aceites y Grasas', unit: 'ml', weight: 500, img: 'https://via.placeholder.com/150', prices: [480, 495, 510] },

    // Carnes
    { name: 'Carne de Res Molida Premium 1 Lb', cat: 'Carnes', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [250, 260, 275] },
    { name: 'Pecho de Res 1 Lb', cat: 'Carnes', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [180, 190, 195] },
    { name: 'Chuleta Ahumada de Cerdo 1 Lb', cat: 'Carnes', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [130, 140, 150] },
    { name: 'Carne de Cerdo para Guisar 1 Lb', cat: 'Carnes', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [120, 130, 135] },
    { name: 'Pollo Fresco Entero Cibao 1 Lb', cat: 'Aves', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [75, 80, 85] },
    { name: 'Pechuga de Pollo sin Hueso 1 Lb', cat: 'Aves', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [160, 175, 185] },
    { name: 'Pechuga de Pollo con Hueso 1 Lb', cat: 'Aves', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [110, 115, 120] },
    { name: 'Pechuga de Pollo Premium Superfresh 1 Lb', cat: 'Aves', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [195, 205, 210] },
    { name: 'Pechugina de Pollo Fresca 1 Lb', cat: 'Aves', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [175, 180, 190] },
    { name: 'Pechuga de Pollo Entera Congelada 1 Lb', cat: 'Aves', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [145, 150, 155] },
    { name: 'Pechuga de Pollo en Cubos 1 Lb', cat: 'Aves', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [180, 190, 200] },
    { name: 'Pechuga de Pavo Butterball 1 Lb', cat: 'Aves', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [280, 295, 310] },
    { name: 'Bandeja Pechuga de Pollo Fileteada 1 Lb', cat: 'Aves', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [185, 195, 205] },
    { name: 'Pechuga de Pollo Sazonada 1 Lb', cat: 'Aves', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [190, 200, 215] },
    { name: 'Muslo de Pollo 1 Lb', cat: 'Aves', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [65, 70, 75] },
    { name: 'Alas de Pollo 1 Lb', cat: 'Aves', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [90, 95, 100] },

    // Pan
    { name: 'Pan de Agua (Paquete 10 uds)', cat: 'Panes', unit: 'Paquete', weight: 1, img: 'https://via.placeholder.com/150', prices: [60, 65, 70] },
    { name: 'Pan Sobao (Paquete 10 uds)', cat: 'Panes', unit: 'Paquete', weight: 1, img: 'https://via.placeholder.com/150', prices: [60, 65, 70] },
    { name: 'Pan de Molde Blanco Pepín 16 oz', cat: 'Panes', unit: 'oz', weight: 16, img: 'https://via.placeholder.com/150', prices: [110, 115, 120] },
    { name: 'Pan de Molde Integral Pepín 16 oz', cat: 'Panes', unit: 'oz', weight: 16, img: 'https://via.placeholder.com/150', prices: [125, 130, 135] },
    { name: 'Pan de Molde Blanco Lumijor 16 oz', cat: 'Panes', unit: 'oz', weight: 16, img: 'https://via.placeholder.com/150', prices: [105, 110, 115] },

    // Lácteos
    { name: 'Leche Rica Listamilk Entera 1 Litro', cat: 'Lácteos', unit: 'Litro', weight: 1, img: 'https://via.placeholder.com/150', prices: [65, 68, 70] },
    { name: 'Leche Parmalat Entera 1 Litro', cat: 'Lácteos', unit: 'Litro', weight: 1, img: 'https://via.placeholder.com/150', prices: [67, 69, 72] },
    { name: 'Leche Milex Líquida Entera 1 Litro', cat: 'Lácteos', unit: 'Litro', weight: 1, img: 'https://via.placeholder.com/150', prices: [68, 70, 75] },
    { name: 'Leche Evaporada Carnation 315g', cat: 'Lácteos', unit: 'g', weight: 315, img: 'https://via.placeholder.com/150', prices: [60, 62, 65] },
    { name: 'Queso Cheddar Geo 1 Lb', cat: 'Lácteos', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [250, 260, 275] },
    { name: 'Queso Danés Sosúa 1 Lb', cat: 'Lácteos', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [320, 330, 345] },

    // Embutidos
    { name: 'Salami Super Especial Induveca 1 Lb', cat: 'Carnes', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [140, 145, 150] },
    { name: 'Salami Sosúa 1 Lb', cat: 'Carnes', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [135, 140, 145] },
    { name: 'Salami Chef Checo 1 Lb', cat: 'Carnes', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [120, 125, 130] },

    // Bebidas y Jugos
    { name: 'Jugo Rica de Naranja 1 Litro', cat: 'Bebidas', unit: 'Litro', weight: 1, img: 'https://via.placeholder.com/150', prices: [85, 90, 95] },
    { name: 'Jugo Santal de Pera 1 Litro', cat: 'Bebidas', unit: 'Litro', weight: 1, img: 'https://via.placeholder.com/150', prices: [90, 95, 100] },
    { name: 'Refresco Coca-Cola 2 Litros', cat: 'Bebidas', unit: 'Litro', weight: 2, img: 'https://via.placeholder.com/150', prices: [80, 85, 90] },
    { name: 'Refresco Sprite 2 Litros', cat: 'Bebidas', unit: 'Litro', weight: 2, img: 'https://via.placeholder.com/150', prices: [80, 85, 90] },
    { name: 'Refresco Kola Real 2 Litros', cat: 'Bebidas', unit: 'Litro', weight: 2, img: 'https://via.placeholder.com/150', prices: [60, 65, 70] },

    // Vegetales y Ajos
    { name: 'Cebolla Roja 1 Lb', cat: 'Vegetales', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [50, 55, 60] },
    { name: 'Ajo Importado 1 Lb', cat: 'Vegetales', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [120, 130, 140] },
    { name: 'Ají Morrón 1 Lb', cat: 'Vegetales', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [70, 80, 90] },
    { name: 'Tomate Barceló 1 Lb', cat: 'Vegetales', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [45, 50, 55] },
    { name: 'Papas 1 Lb', cat: 'Vegetales', unit: 'lb', weight: 1, img: 'https://via.placeholder.com/150', prices: [35, 40, 45] },

    // Enlatados
    { name: 'Salsa de Tomate Linda 8 oz', cat: 'Enlatados', unit: 'oz', weight: 8, img: 'https://via.placeholder.com/150', prices: [40, 42, 45] },
    { name: 'Salsa de Tomate Victorina 8 oz', cat: 'Enlatados', unit: 'oz', weight: 8, img: 'https://via.placeholder.com/150', prices: [42, 44, 46] },
    { name: 'Maíz Dulce La Famosa 15 oz', cat: 'Enlatados', unit: 'oz', weight: 15, img: 'https://via.placeholder.com/150', prices: [60, 65, 70] },
    { name: 'Gandules Verdes La Famosa 15 oz', cat: 'Enlatados', unit: 'oz', weight: 15, img: 'https://via.placeholder.com/150', prices: [75, 80, 85] },

    // Hogar y Cuidado
    { name: 'Papel Higiénico Familia (Paquete 4 uds)', cat: 'Artículos del Hogar', unit: 'Paquete', weight: 1, img: 'https://via.placeholder.com/150', prices: [110, 115, 120] },
    { name: 'Papel Higiénico Scott (Paquete 4 uds)', cat: 'Artículos del Hogar', unit: 'Paquete', weight: 1, img: 'https://via.placeholder.com/150', prices: [120, 125, 130] },
    { name: 'Pasta Dental Colgate Triple Acción 75ml', cat: 'Higiene Personal', unit: 'ml', weight: 75, img: 'https://via.placeholder.com/150', prices: [100, 110, 115] },
    { name: 'Jabón de Baño Protex 3 uds', cat: 'Higiene Personal', unit: 'Paquete', weight: 1, img: 'https://via.placeholder.com/150', prices: [140, 150, 160] },
    { name: 'Detergente OMO 1 Kg', cat: 'Artículos del Hogar', unit: 'kg', weight: 1, img: 'https://via.placeholder.com/150', prices: [150, 160, 170] },
    { name: 'Cloro Macier 1 Galón', cat: 'Artículos del Hogar', unit: 'Galón', weight: 1, img: 'https://via.placeholder.com/150', prices: [85, 90, 95] },
  ];

  for (const p of productsToSeed) {
    // Upsert Category
    const cat = await prisma.category.upsert({
      where: { name: p.cat },
      update: {},
      create: { name: p.cat }
    });

    // Create Canonical
    const canonical = await prisma.canonicalProduct.create({
      data: { name: p.name, categoryId: cat.id, baseUnit: p.unit, baseWeight: p.weight, defaultImageUrl: p.img }
    });

    // Create Matches & Prices for Supermarkets
    const supers = [jumbo, sirena, nacional, bravo];
    for (let i = 0; i < supers.length; i++) {
      const match = await prisma.productMatch.create({
        data: { canonicalProductId: canonical.id, supermarketId: supers[i].id, rawName: p.name }
      });
      // Vary prices slightly per supermarket
      const basePrice = p.prices[i % p.prices.length];
      await prisma.priceHistory.create({
        data: { productMatchId: match.id, price: basePrice + (Math.random() * 10 - 5), currency: 'DOP' }
      });
    }
  }


  // Create a user and a list
  const user = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {},
    create: { email: 'test@test.com', name: 'Usuario Prueba' }
  });

  const firstProduct = await prisma.canonicalProduct.findFirst();
  if (firstProduct) {
    const list = await prisma.shoppingList.create({
      data: {
        name: 'Mi Compra de Prueba',
        ownerId: user.id,
        items: {
          create: [
            { canonicalProductId: firstProduct.id, quantity: 2 }
          ]
        }
      }
    });
    console.log('Seed terminado. Lista de prueba creada con ID:', list.id);
  } else {
    console.log('Seed terminado sin lista de prueba.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
