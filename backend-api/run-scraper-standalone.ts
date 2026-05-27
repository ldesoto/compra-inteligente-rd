import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ScraperService } from './src/scraper/scraper.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const scraper = app.get(ScraperService);
  console.log("Iniciando scraper standalone...");
  const result = await scraper.runDailyScraping();
  console.log("Resultado:", result);
  await app.close();
}
bootstrap();
