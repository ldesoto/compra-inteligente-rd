import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Funciones de similitud
function tokenize(str: string): string[] {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !['con', 'del', 'para', 'las', 'los'].includes(w));
}

function calculateSimilarity(tokens1: string[], tokens2: string[]): number {
  if (tokens1.length === 0 || tokens2.length === 0) return 0;
  
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  let intersection = 0;
  
  for (const t of set1) {
    if (set2.has(t)) intersection++;
    else {
      // Partial match (e.g. "lechera" in "la lechera")
      for (const t2 of set2) {
        if (t.includes(t2) || t2.includes(t)) {
          intersection += 0.5;
          break;
        }
      }
    }
  }
  
  const union = set1.size + set2.size - intersection;
  return intersection / union;
}

async function main() {
  console.log('🤖 Iniciando Motor de Emparejamiento por IA (Fuzzy Matching)...');

  // Traemos todos los productos con sus matches
  const products = await prisma.canonicalProduct.findMany({
    include: { productMatches: true },
    // Procesaremos solo algunas categorías de prueba, o todos si no hay memoria issue
  });

  console.log(`Analizando ${products.length} productos...`);

  // Agrupamos por categoría para no comparar plátanos con desodorantes
  const byCategory: Record<string, typeof products> = {};
  for (const p of products) {
    if (!p.categoryId) continue;
    if (!byCategory[p.categoryId]) byCategory[p.categoryId] = [];
    byCategory[p.categoryId].push(p);
  }

  let mergedCount = 0;
  let deletedCount = 0;

  for (const [categoryId, catsProducts] of Object.entries(byCategory)) {
    // Un set para saber cuáles ya fusionamos y no volver a procesarlos
    const skipIds = new Set<string>();

    for (let i = 0; i < catsProducts.length; i++) {
      const p1 = catsProducts[i];
      if (skipIds.has(p1.id)) continue;

      const tokens1 = tokenize(p1.name);
      if (tokens1.length === 0) continue;

      // Buscamos candidatos a fusionar
      for (let j = i + 1; j < catsProducts.length; j++) {
        const p2 = catsProducts[j];
        if (skipIds.has(p2.id)) continue;

        const tokens2 = tokenize(p2.name);
        if (tokens2.length === 0) continue;

        const similarity = calculateSimilarity(tokens1, tokens2);
        
        // Si hay una similitud del 75% o más, o si comparten las mismas unidades (155g) y marca
        if (similarity >= 0.75) {
          // Fusionar p2 dentro de p1
          console.log(`[Fusión] ${(similarity * 100).toFixed(0)}% similitud: \n  - ${p1.name} \n  - ${p2.name}`);
          
          // Reasignar los ProductMatches
          await prisma.productMatch.updateMany({
            where: { canonicalProductId: p2.id },
            data: { canonicalProductId: p1.id }
          });

          // Reasignar items de listas o recibos si los hay
          await prisma.shoppingListItem.updateMany({
            where: { canonicalProductId: p2.id },
            data: { canonicalProductId: p1.id }
          });

          await prisma.receiptItem.updateMany({
            where: { canonicalProductId: p2.id },
            data: { canonicalProductId: p1.id }
          });

          // Borrar el producto huérfano
          await prisma.canonicalProduct.delete({
            where: { id: p2.id }
          });

          skipIds.add(p2.id);
          mergedCount++;
          deletedCount++;
        }
      }
    }
  }

  console.log(`\n✅ ¡Motor finalizado! Se encontraron y fusionaron ${mergedCount} productos duplicados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
