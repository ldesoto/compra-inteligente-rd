import { Controller, Post, Get, Param, Query } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  /**
   * POST /scraper/run
   * Trigger a full scraping run across all supermarkets and categories.
   * Expected duration: 15-30 minutes for a full run.
   */
  @Post('run')
  async runScraping() {
    const result = await this.scraperService.runDailyScraping();
    return {
      message: result.success
        ? `✅ Scraping completo: ${result.productsScraped} productos actualizados`
        : `⚠️ Completado con errores: ${result.productsScraped} éxitos`,
      ...result,
    };
  }

  /**
   * GET /scraper/status
   * Returns stats about scraped products and last run time.
   */
  @Get('status')
  getStatus() {
    return this.scraperService.getScrapingStatus();
  }

  /**
   * GET /scraper/categories
   * Returns all product categories in the database.
   */
  @Get('categories')
  getCategories() {
    return this.scraperService.getCategories();
  }

  /**
   * GET /scraper/products/:category?page=1&limit=50
   * Returns all products for a given category with their latest prices per supermarket.
   */
  @Get('products/:category')
  getProductsByCategory(
    @Param('category') category: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    return this.scraperService.getProductsByCategory(category, +page, +limit);
  }

  /**
   * GET /scraper/search?q=query
   * Search for canonical products by name.
   */
  @Get('search')
  searchProducts(@Query('q') query: string) {
    if (!query || query.length < 2) return [];
    return this.scraperService.searchProducts(query);
  }

  /**
   * GET /scraper/history/:productId
   * Returns price history for a canonical product across supermarkets.
   */
  @Get('history/:productId')
  getProductHistory(@Param('productId') productId: string) {
    return this.scraperService.getProductHistory(productId);
  }
}
