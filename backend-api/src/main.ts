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
  const despensa = await prisma.category.findFirst({ where: { name: 'Despensa' } });
  if (despensa) {
    await prisma.canonicalProduct.updateMany({
      where: { name: { contains: 'chicharron' } },
      data: { categoryId: despensa.id }
    });
    await prisma.canonicalProduct.updateMany({
      where: { name: { contains: 'chicharrón' } },
      data: { categoryId: despensa.id }
    });
    console.log('✅ Productos de chicharrón movidos a Despensa');
  }

  const vegetales = await prisma.category.findFirst({ where: { name: 'Vegetales' } });
  if (vegetales) {
    await prisma.canonicalProduct.updateMany({
      where: { name: { contains: 'ensalada' } },
      data: { categoryId: vegetales.id }
    });
    await prisma.canonicalProduct.updateMany({
      where: { name: { contains: 'espinaca' } },
      data: { categoryId: vegetales.id }
    });
    console.log('✅ Ensaladas y espinacas movidas a Vegetales');
  }

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`Backend running on http://0.0.0.0:3000`);
}
bootstrap();
