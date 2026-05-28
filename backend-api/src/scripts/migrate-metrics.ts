import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando script de migración de métricas...');

  try {
    // 1. Asegurar que las listas viejas tengan status DRAFT si no tienen o si tienen nulo
    console.log('🔄 Migrando listas de compras antiguas a DRAFT...');
    const resultLists = await prisma.shoppingList.updateMany({
      where: {
        status: {
          notIn: ['DRAFT', 'READY_TO_COMPARE', 'COMPARED', 'PLANNED', 'PURCHASED', 'CANCELLED', 'EXPIRED']
        }
      },
      data: {
        status: 'DRAFT'
      }
    });
    console.log(`✅ ${resultLists.count} listas actualizadas al estado DRAFT.`);

    // 2. Opcional: Asegurarse de que el usuario de prueba tenga presupuesto para que UI no quede vacía
    console.log('🔎 Verificando usuarios sin presupuesto...');
    const usersWithoutBudget = await prisma.user.findMany({
      where: {
        OR: [
          { monthlyBudget: null },
          { monthlyBudget: 0 }
        ]
      }
    });

    if (usersWithoutBudget.length > 0) {
      console.log(`🛠️ Asignando presupuesto base de RD$ 25,000 a ${usersWithoutBudget.length} usuarios para testing...`);
      for (const user of usersWithoutBudget) {
        await prisma.user.update({
          where: { id: user.id },
          data: { monthlyBudget: 25000 }
        });
      }
    } else {
      console.log('✅ Todos los usuarios ya tienen presupuesto asignado.');
    }

    console.log('🎉 Migración completada exitosamente.');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
