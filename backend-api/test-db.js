const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const matches = await prisma.productMatch.findMany({
    where: {
      canonicalProduct: {
        name: {
          in: [
            'Muslo de Pollo 1 Lb',
            'Pechuga de Pollo sin Hueso 1 Lb',
            'Arroz Bisonó 10 Lbs',
            'Aceite de Maní El Manicero 128 oz',
            'Leche Evaporada Carnation 315g',
            'Refresco Coca-Cola 2 Litros'
          ]
        }
      }
    },
    include: {
      canonicalProduct: true,
      supermarket: true,
      priceHistory: {
        orderBy: { timestamp: 'desc' },
        take: 1
      }
    }
  });

  for (const m of matches) {
    if (m.priceHistory.length > 0) {
      console.log(`${m.supermarket.name} - ${m.canonicalProduct.name}: ${m.priceHistory[0].price}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
