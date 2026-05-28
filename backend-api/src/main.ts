import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: false,
  });
  const prisma = app.get(PrismaService);
  const allProducts = await prisma.canonicalProduct.findMany({ select: { id: true, name: true, categoryId: true } });
  let updatedCount = 0;

  const despensa = await prisma.category.findFirst({ where: { name: 'Despensa' } });
  const vegetales = await prisma.category.findFirst({ where: { name: 'Vegetales' } });

  for (const p of allProducts) {
    const lowerName = p.name.toLowerCase();
    
    // Fix Chicharron
    if (despensa && (lowerName.includes('chicharron') || lowerName.includes('chicharrón') || lowerName.includes('chicharon') || lowerName.includes('chicharón'))) {
      if (p.categoryId !== despensa.id) {
        await prisma.canonicalProduct.update({ where: { id: p.id }, data: { categoryId: despensa.id } });
        updatedCount++;
      }
    }
    
    // Fix Ensalada / Espinaca
    if (vegetales && (lowerName.includes('ensalada') || lowerName.includes('espinaca'))) {
      if (p.categoryId !== vegetales.id) {
        await prisma.canonicalProduct.update({ where: { id: p.id }, data: { categoryId: vegetales.id } });
        updatedCount++;
      }
    }
  }

  if (updatedCount > 0) {
    console.log(`✅ Se corrigieron ${updatedCount} productos mal categorizados (Chicharrones, Ensaladas, Espinacas).`);
  }

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`Backend running on http://0.0.0.0:3000`);
}
bootstrap();
