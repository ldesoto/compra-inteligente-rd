const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const matches = await prisma.productMatch.findMany({
    include: {
      canonicalProduct: true,
      priceHistory: {
        orderBy: { timestamp: 'desc' },
        take: 1
      }
    }
  });
  
  let validMatches = 0;
  for (const m of matches) {
    if (m.priceHistory.length > 0) {
      console.log(`Product: ${m.canonicalProduct.name} - Price: ${m.priceHistory[0].price} - SM: ${m.supermarketId}`);
      validMatches++;
    }
  }
  console.log('Total valid matches with prices:', validMatches);
}

main().catch(console.error).finally(() => prisma.$disconnect());
