import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { isPrivateLabel } from '../utils/private-label';
type Browser = any;
type Page = any;
let chromium: any;
try {
  const pw = require('playwright');
  chromium = pw.chromium;
} catch (e) {}

interface ScrapedProduct {
  name: string;
  price: number;
  url?: string;
  imageUrl?: string;
}

interface CategoryConfig {
  categoryName: string;      // Our canonical category name
  dbCategoryName: string;    // Name to store in DB
  url: string;               // Direct category URL
  maxPages: number;
}

interface SupermarketConfig {
  name: string;
  baseUrl: string;
  needsJavaScript: boolean;
  rateLimit: number;
  selectors: {
    productContainer: string;
    productName: string;
    productPrice: string;
    productUrl?: string;
    productImage?: string;
    nextPageUrl?: string;      // selector for next page link
    totalProducts?: string;    // selector for total count
  };
  categories: CategoryConfig[];
  // How to build a page URL (page 2, 3...) - returns null if no pagination
  paginationUrl?: (categoryUrl: string, page: number) => string | null;
  // Dynamic Category Extraction Config
  dynamicCategories?: {
    startUrl: string;
    linkSelector: string;
    urlFilter: (url: string) => boolean;
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// JUMBO.COM.DO — Magento platform, static HTML, infinite scroll via ?p= param
// Categories discovered via live browser inspection
// ──────────────────────────────────────────────────────────────────────────────
const JUMBO_CONFIG: SupermarketConfig = {
  name: 'Jumbo',
  baseUrl: 'https://jumbo.com.do',
  needsJavaScript: true,  // needs scroll/wait for lazy loading
  rateLimit: 3000,
  selectors: {
    productContainer: '.product-item-info',
    productName: '.product-item-link',
    productPrice: '.price-box .price',
    productUrl: '.product-item-link',
    productImage: '.product-image-photo',
    nextPageUrl: '.action.next',
    totalProducts: '.toolbar-amount',
  },
  paginationUrl: (url, page) => `${url}?p=${page}`,
  dynamicCategories: {
    startUrl: 'https://jumbo.com.do/supermercado',
    linkSelector: 'a',
    urlFilter: (url) => url.includes('/supermercado/') && !url.includes('.html') && !url.includes('?') && url.split('/').length > 4,
  },
  categories: [
    // ── Granos y Despensa ──────────────────────────────────
    { categoryName: 'Arroz', dbCategoryName: 'Granos y Cereales', url: 'https://jumbo.com.do/supermercado/despensa/arroz-cereales-y-legumbres/arroz', maxPages: 5 },
    { categoryName: 'Aceites y Grasas', dbCategoryName: 'Aceites y Grasas', url: 'https://jumbo.com.do/supermercado/despensa/aceites', maxPages: 4 },
    { categoryName: 'Pastas', dbCategoryName: 'Pastas y Harinas', url: 'https://jumbo.com.do/supermercado/despensa/pastas', maxPages: 3 },
    { categoryName: 'Habichuelas y Legumbres', dbCategoryName: 'Granos y Cereales', url: 'https://jumbo.com.do/supermercado/despensa/arroz-cereales-y-legumbres', maxPages: 4 },
    { categoryName: 'Conservas y Enlatados', dbCategoryName: 'Enlatados', url: 'https://jumbo.com.do/supermercado/despensa/conservas-y-encurtidos', maxPages: 5 },
    { categoryName: 'Salsas y Condimentos', dbCategoryName: 'Condimentos', url: 'https://jumbo.com.do/supermercado/despensa/salsas-y-condimentos', maxPages: 4 },
    { categoryName: 'Azucar y Endulzantes', dbCategoryName: 'Azúcar y Endulzantes', url: 'https://jumbo.com.do/supermercado/despensa/azucar-y-endulzantes', maxPages: 3 },
    { categoryName: 'Cafe y Te', dbCategoryName: 'Café y Bebidas Calientes', url: 'https://jumbo.com.do/supermercado/despensa/cafe-y-te', maxPages: 3 },
    { categoryName: 'Cereales', dbCategoryName: 'Cereales', url: 'https://jumbo.com.do/supermercado/despensa/cereales', maxPages: 4 },
    { categoryName: 'Galletas y Snacks', dbCategoryName: 'Snacks y Dulces', url: 'https://jumbo.com.do/supermercado/despensa/galletas', maxPages: 5 },
    
    // ── Carnes y Embutidos ──────────────────────────────────
    { categoryName: 'Carne de Res', dbCategoryName: 'Carnes', url: 'https://jumbo.com.do/supermercado/carnes-pescados-y-mariscos/carnes/res', maxPages: 4 },
    { categoryName: 'Carnes Premium Angus', dbCategoryName: 'Carnes Premium', url: 'https://jumbo.com.do/supermercado/carnes-pescados-y-mariscos/carnes/certfied-angus-beef', maxPages: 2 },
    { categoryName: 'Carne de Cerdo', dbCategoryName: 'Carnes', url: 'https://jumbo.com.do/supermercado/carnes-pescados-y-mariscos/carnes/cerdo', maxPages: 3 },
    { categoryName: 'Pollo y Aves', dbCategoryName: 'Aves', url: 'https://jumbo.com.do/supermercado/carnes-pescados-y-mariscos/carnes/pollo', maxPages: 4 },
    { categoryName: 'Embutidos y Salchichas', dbCategoryName: 'Embutidos', url: 'https://jumbo.com.do/supermercado/lacteos-quesos-y-huevos/embutidos', maxPages: 5 },
    
    // ── Mariscos y Pescados ───────────────────────────────
    { categoryName: 'Pescados y Mariscos', dbCategoryName: 'Mariscos y Pescados', url: 'https://jumbo.com.do/supermercado/carnes-pescados-y-mariscos/pescados-y-mariscos', maxPages: 4 },
    
    // ── Lácteos y Huevos ──────────────────────────────────
    { categoryName: 'Leche', dbCategoryName: 'Lácteos', url: 'https://jumbo.com.do/supermercado/lacteos-quesos-y-huevos/leche', maxPages: 5 },
    { categoryName: 'Quesos', dbCategoryName: 'Lácteos', url: 'https://jumbo.com.do/supermercado/lacteos-quesos-y-huevos/quesos', maxPages: 4 },
    { categoryName: 'Huevos', dbCategoryName: 'Huevos', url: 'https://jumbo.com.do/supermercado/lacteos-quesos-y-huevos/huevos', maxPages: 2 },
    
    // ── Panadería ─────────────────────────────────────────
    { categoryName: 'Pan de Molde', dbCategoryName: 'Panes', url: 'https://jumbo.com.do/supermercado/panaderia-y-reposteria/panaderia/pan-de-molde', maxPages: 2 },
    { categoryName: 'Pan Tradicional', dbCategoryName: 'Panes', url: 'https://jumbo.com.do/supermercado/panaderia-y-reposteria/panaderia/pan-tradicional', maxPages: 2 },
    
    // ── Frutas y Vegetales ────────────────────────────────
    { categoryName: 'Vegetales y Hortalizas', dbCategoryName: 'Vegetales', url: 'https://jumbo.com.do/supermercado/frutas-y-vegetales/vegetales-y-hortalizas', maxPages: 5 },
    { categoryName: 'Viveres (Platanos, Yuca)', dbCategoryName: 'Víveres', url: 'https://jumbo.com.do/supermercado/frutas-y-vegetales/viveres', maxPages: 3 },
    { categoryName: 'Frutas', dbCategoryName: 'Frutas', url: 'https://jumbo.com.do/supermercado/frutas-y-vegetales/frutas', maxPages: 4 },
    
    // ── Bebidas ───────────────────────────────────────────
    { categoryName: 'Jugos', dbCategoryName: 'Bebidas', url: 'https://jumbo.com.do/supermercado/bebidas/aguas-refrescos-y-jugos/jugos', maxPages: 4 },
    { categoryName: 'Refrescos', dbCategoryName: 'Bebidas', url: 'https://jumbo.com.do/supermercado/bebidas/aguas-refrescos-y-jugos/refrescos', maxPages: 4 },
    { categoryName: 'Aguas', dbCategoryName: 'Bebidas', url: 'https://jumbo.com.do/supermercado/bebidas/aguas-refrescos-y-jugos/agua', maxPages: 2 },
    { categoryName: 'Cervezas y Vinos', dbCategoryName: 'Licores y Bebidas', url: 'https://jumbo.com.do/supermercado/bebidas/cervezas-vinos-y-espirituosos', maxPages: 4 },
    
    // ── Limpieza del Hogar ────────────────────────────────
    { categoryName: 'Papel Higienico', dbCategoryName: 'Artículos del Hogar', url: 'https://jumbo.com.do/supermercado/limpieza-y-desechables/desechables-y-organizacion/papel-higienico', maxPages: 3 },
    { categoryName: 'Detergentes y Lavado', dbCategoryName: 'Limpieza', url: 'https://jumbo.com.do/supermercado/limpieza-y-desechables/lavanderia', maxPages: 4 },
    { categoryName: 'Cloros y Desinfectantes', dbCategoryName: 'Limpieza', url: 'https://jumbo.com.do/supermercado/limpieza-y-desechables/limpiadores', maxPages: 4 },
    { categoryName: 'Desechables (Platos, Vasos, Servilletas)', dbCategoryName: 'Desechables', url: 'https://jumbo.com.do/supermercado/limpieza-y-desechables/desechables-y-organizacion', maxPages: 4 },
    
    // ── Cuidado Personal ──────────────────────────────────
    { categoryName: 'Pasta Dental', dbCategoryName: 'Higiene Personal', url: 'https://jumbo.com.do/salud-y-belleza/cuidado-oral/cremas-dentales', maxPages: 2 },
    { categoryName: 'Shampoo', dbCategoryName: 'Higiene Personal', url: 'https://jumbo.com.do/salud-y-belleza/cuidado-del-cabello', maxPages: 3 },
    { categoryName: 'Cuidado Personal', dbCategoryName: 'Higiene Personal', url: 'https://jumbo.com.do/salud-y-belleza/cuidado-personal', maxPages: 4 },
  ],
};

// ──────────────────────────────────────────────────────────────────────────────
// LA SIRENA — VTEX platform, React SPA
// ──────────────────────────────────────────────────────────────────────────────
const SIRENA_CONFIG: SupermarketConfig = {
  name: 'La Sirena',
  baseUrl: 'https://sirena.do',
  needsJavaScript: true,
  rateLimit: 4000,
  selectors: {
    productContainer: '.vtex-product-summary-2-x-container',
    productName: '.vtex-product-summary-2-x-brandName',
    productPrice: '.vtex-selling-price-3-x-value',
    productUrl: '.vtex-product-summary-2-x-clearLink',
    productImage: '.vtex-product-summary-2-x-imageNormal',
    nextPageUrl: '.vtex-search-result-3-x-buttonShowMore button',
  },
  paginationUrl: (url, page) => `${url}?page=${page}`,
  dynamicCategories: {
    startUrl: 'https://sirena.do/supermercado',
    linkSelector: 'a',
    urlFilter: (url) => url.includes('sirena.do/') && !url.includes('/p') && !url.includes('login') && url.length > 20,
  },
  categories: [
    { categoryName: 'Arroz', dbCategoryName: 'Granos y Cereales', url: 'https://sirena.do/arroz?map=c', maxPages: 3 },
    { categoryName: 'Aceites', dbCategoryName: 'Aceites y Grasas', url: 'https://sirena.do/aceites?map=c', maxPages: 3 },
    { categoryName: 'Cereales', dbCategoryName: 'Cereales', url: 'https://sirena.do/cereales?map=c', maxPages: 3 },
    { categoryName: 'Galletas y Snacks', dbCategoryName: 'Snacks y Dulces', url: 'https://sirena.do/galletas?map=c', maxPages: 3 },
    
    { categoryName: 'Carnes', dbCategoryName: 'Carnes', url: 'https://sirena.do/carnes?map=c', maxPages: 4 },
    { categoryName: 'Pollo', dbCategoryName: 'Aves', url: 'https://sirena.do/pollo?map=c', maxPages: 3 },
    { categoryName: 'Embutidos y Salchichas', dbCategoryName: 'Embutidos', url: 'https://sirena.do/embutidos?map=c', maxPages: 4 },
    { categoryName: 'Pescados y Mariscos', dbCategoryName: 'Mariscos y Pescados', url: 'https://sirena.do/mariscos?map=c', maxPages: 3 },
    
    { categoryName: 'Lacteos', dbCategoryName: 'Lácteos', url: 'https://sirena.do/lacteos?map=c', maxPages: 4 },
    { categoryName: 'Quesos', dbCategoryName: 'Lácteos', url: 'https://sirena.do/quesos?map=c', maxPages: 3 },
    { categoryName: 'Panes', dbCategoryName: 'Panes', url: 'https://sirena.do/panaderia?map=c', maxPages: 3 },
    
    { categoryName: 'Vegetales', dbCategoryName: 'Vegetales', url: 'https://sirena.do/vegetales?map=c', maxPages: 4 },
    { categoryName: 'Viveres', dbCategoryName: 'Víveres', url: 'https://sirena.do/viveres?map=c', maxPages: 3 },
    { categoryName: 'Frutas', dbCategoryName: 'Frutas', url: 'https://sirena.do/frutas?map=c', maxPages: 3 },
    
    { categoryName: 'Bebidas', dbCategoryName: 'Bebidas', url: 'https://sirena.do/bebidas?map=c', maxPages: 4 },
    { categoryName: 'Enlatados', dbCategoryName: 'Enlatados', url: 'https://sirena.do/enlatados?map=c', maxPages: 3 },
    
    { categoryName: 'Limpieza', dbCategoryName: 'Artículos del Hogar', url: 'https://sirena.do/limpieza?map=c', maxPages: 4 },
    { categoryName: 'Cloros y Desinfectantes', dbCategoryName: 'Limpieza', url: 'https://sirena.do/cloros?map=c', maxPages: 3 },
    { categoryName: 'Desechables (Platos, Vasos)', dbCategoryName: 'Desechables', url: 'https://sirena.do/desechables?map=c', maxPages: 3 },
    
    { categoryName: 'Higiene Personal', dbCategoryName: 'Higiene Personal', url: 'https://sirena.do/cuidado-personal?map=c', maxPages: 4 },
  ],
};

// ──────────────────────────────────────────────────────────────────────────────
// NACIONAL — Same Magento platform as Jumbo (Centro Cuesta Nacional)
// ──────────────────────────────────────────────────────────────────────────────
const NACIONAL_CONFIG: SupermarketConfig = {
  ...JUMBO_CONFIG,
  name: 'Nacional',
  baseUrl: 'https://supermercadosnacional.com',
  categories: JUMBO_CONFIG.categories.map(cat => ({
    ...cat,
    url: cat.url.replace('https://jumbo.com.do', 'https://supermercadosnacional.com')
  })),
  dynamicCategories: {
    startUrl: 'https://supermercadosnacional.com',
    linkSelector: 'a',
    urlFilter: (url) => url.includes('supermercadosnacional.com/') && !url.includes('.html') && !url.includes('?') && url.split('/').length > 4,
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// PLAZA LAMA — Shopify / VTEX
// ──────────────────────────────────────────────────────────────────────────────
const PLAZA_LAMA_CONFIG: SupermarketConfig = {
  name: 'Plaza Lama',
  baseUrl: 'https://plazalama.com.do',
  needsJavaScript: true,
  rateLimit: 3000,
  selectors: {
    productContainer: '.vtex-product-summary-2-x-container, .product-item',
    productName: '.vtex-product-summary-2-x-productNameContainer, .product-item-name',
    productPrice: '.vtex-product-price-1-x-sellingPrice, .price',
    productUrl: '.vtex-product-summary-2-x-clearLink, .product-item-link',
  },
  paginationUrl: (url, page) => `${url}?page=${page}`,
  dynamicCategories: {
    startUrl: 'https://plazalama.com.do/ca/supermercado/11',
    linkSelector: 'a',
    urlFilter: (url) => url.includes('/ca/') && !url.includes('?') && url.length > 30,
  },
  categories: [
    { categoryName: 'Arroz', dbCategoryName: 'Granos y Cereales', url: 'https://plazalama.com.do/ca/supermercado/11', maxPages: 3 },
    { categoryName: 'Aceites', dbCategoryName: 'Aceites y Grasas', url: 'https://plazalama.com.do/ca/supermercado/11', maxPages: 2 },
    { categoryName: 'Carnes', dbCategoryName: 'Carnes', url: 'https://plazalama.com.do/ca/supermercado/11', maxPages: 2 },
    { categoryName: 'Lacteos', dbCategoryName: 'Lácteos', url: 'https://plazalama.com.do/ca/supermercado/11', maxPages: 2 },
    { categoryName: 'Limpieza', dbCategoryName: 'Limpieza', url: 'https://plazalama.com.do/ca/supermercado/11', maxPages: 2 },
  ],
};

// ──────────────────────────────────────────────────────────────────────────────
// BRAVO — Custom App / Web config
// ──────────────────────────────────────────────────────────────────────────────
const BRAVO_CONFIG: SupermarketConfig = {
  name: 'Supermercado Bravo',
  baseUrl: 'https://bravo.do',
  needsJavaScript: true,
  rateLimit: 3000,
  selectors: {
    productContainer: '.product-card, .vtex-product-summary-2-x-container, .item-card',
    productName: '.product-title, .vtex-product-summary-2-x-productNameContainer, .name',
    productPrice: '.product-price, .vtex-product-price-1-x-sellingPrice, .price',
    productUrl: '.product-link, .vtex-product-summary-2-x-clearLink',
  },
  paginationUrl: (url, page) => `${url}?page=${page}`,
  dynamicCategories: {
    startUrl: 'https://bravo.do/categorias',
    linkSelector: 'a',
    urlFilter: (url) => url.includes('/c/') && url.length > 15,
  },
  categories: [
    { categoryName: 'Arroz', dbCategoryName: 'Granos y Cereales', url: 'https://bravo.do/c/arroz', maxPages: 2 },
    { categoryName: 'Carnes', dbCategoryName: 'Carnes', url: 'https://bravo.do/c/carnes', maxPages: 2 },
    { categoryName: 'Lacteos', dbCategoryName: 'Lácteos', url: 'https://bravo.do/c/lacteos', maxPages: 2 },
  ],
};

// ──────────────────────────────────────────────────────────────────────────────
// CARREFOUR — VTEX / Magento config
// ──────────────────────────────────────────────────────────────────────────────
const CARREFOUR_CONFIG: SupermarketConfig = {
  name: 'Carrefour',
  baseUrl: 'https://mercado.carrefour.do',
  needsJavaScript: true,
  rateLimit: 3000,
  selectors: {
    productContainer: '.product-item, .vtex-product-summary-2-x-container',
    productName: '.product-item-name, .vtex-product-summary-2-x-brandName',
    productPrice: '.price, .vtex-selling-price-3-x-value',
    productUrl: '.product-item-link, .vtex-product-summary-2-x-clearLink',
  },
  paginationUrl: (url, page) => `${url}?p=${page}`,
  dynamicCategories: {
    startUrl: 'https://mercado.carrefour.do/supermercado',
    linkSelector: 'a',
    urlFilter: (url) => url.includes('/c/') && !url.includes('?'),
  },
  categories: [
    { categoryName: 'Vinos y Cervezas', dbCategoryName: 'Licores y Bebidas', url: 'https://mercado.carrefour.do/c/bebidas', maxPages: 2 },
    { categoryName: 'Lácteos', dbCategoryName: 'Lácteos', url: 'https://mercado.carrefour.do/c/lacteos', maxPages: 2 },
    { categoryName: 'Despensa', dbCategoryName: 'Despensa', url: 'https://mercado.carrefour.do/c/despensa', maxPages: 2 },
  ],
};

const ALL_CONFIGS: SupermarketConfig[] = [JUMBO_CONFIG, SIRENA_CONFIG, NACIONAL_CONFIG, PLAZA_LAMA_CONFIG, BRAVO_CONFIG, CARREFOUR_CONFIG];

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(private prisma: PrismaService) {}

  private cachedPromotions: any[] = [
    { id: 1, store: 'Jumbo', letter: 'J', color: '#FF8200', title: 'Hasta 40%', sub: 'Ahorro en frutas\ny vegetales', badge: 'Precios actualizados', badgeColor: '#16A34A', badgeBg: '#DCFCE7', icon: 'arrow-up', emoji: '🍅🥬' },
    { id: 2, store: 'La Sirena', letter: 'S', color: '#EF4444', title: 'Feria de\nLimpieza', sub: 'Detergentes y\njabón', badge: 'Termina hoy', badgeColor: '#EF4444', badgeBg: '#FEE2E2', icon: 'clock', emoji: '🧴🧼' },
    { id: 3, store: 'Nacional', letter: 'N', color: '#008B47', title: 'Especial de\nCarnes', sub: 'Cortes seleccionados\na mejores precios', badge: 'Precios actualizados', badgeColor: '#16A34A', badgeBg: '#DCFCE7', icon: 'arrow-up', emoji: '🥩' },
    { id: 4, store: 'Plaza Lama', letter: 'P', color: '#EAB308', title: 'Súper\nOfertas', sub: 'Miles de productos\ncon descuento', badge: 'Ofertas destacadas', badgeColor: '#D97706', badgeBg: '#FEF3C7', icon: 'star', emoji: '🛒' }
  ];
  private lastPromoFetch = 0;

  // ─── Public API ───────────────────────────────────────────────────────────

  async getLivePromotions(): Promise<any[]> {
    const now = Date.now();
    // Cache for 6 hours
    if (now - this.lastPromoFetch > 1000 * 60 * 60 * 6) {
      this.lastPromoFetch = now;
      // Scrape in background so we don't block the request
      this.scrapeHomePromotions().catch(e => this.logger.error('Error scraping promos: ' + e.message));
    }
    return this.cachedPromotions;
  }

  private async scrapeHomePromotions(): Promise<void> {
    this.logger.log('🕷️  Extrayendo promociones en vivo (productos en oferta)...');
    if (!chromium) {
      this.logger.error('Playwright no está instalado');
      return;
    }
    const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    
    try {
      let [jumboPromo, sirenaPromo, naciPromo, plazaPromo] = [...this.cachedPromotions];

      const filterGrocery = (products: any[]) => {
        const blacklist = ['extractor', 'campana', 'estampa', 'album', 'fifa', 'juguete', 'bebedero', 'televisor', 'tv', 'smart', 'led', 'oled', 'laptop', 'computador', 'tablet', 'ipad', 'celular', 'smartphone', 'iphone', 'samsung', 'nevera', 'refrigerador', 'estufa', 'lavadora', 'secadora', 'microondas', 'aire', 'inverter', 'licuadora', 'batidora', 'freidora', 'tostadora', 'plancha', 'aspiradora', 'bocina', 'parlante', 'impresora', 'monitor', 'colchon', 'cama', 'sofa', 'mueble', 'silla', 'bicicleta', 'abanico', 'playstation', 'xbox', 'nintendo'];
        return products.find(p => {
          if (!p || !p.name) return false;
          const name = p.name.toLowerCase();
          return !blacklist.some(term => name.includes(term));
        });
      };

      const getStyleAndEmoji = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('carne') || n.includes('pollo') || n.includes('res') || n.includes('cerdo') || n.includes('chuleta')) {
          return { emoji: '🥩🍗', badge: 'Carnes', badgeColor: '#E11D48', badgeBg: '#FFE4E6' };
        } else if (n.includes('arroz') || n.includes('habichuela') || n.includes('aceite') || n.includes('azucar') || n.includes('sal') || n.includes('pasta')) {
          return { emoji: '🍚🌾', badge: 'Canasta Básica', badgeColor: '#D97706', badgeBg: '#FEF3C7' };
        } else if (n.includes('leche') || n.includes('queso') || n.includes('yogur') || n.includes('mantequilla')) {
          return { emoji: '🥛🧀', badge: 'Lácteos', badgeColor: '#2563EB', badgeBg: '#DBEAFE' };
        } else if (n.includes('jabon') || n.includes('detergente') || n.includes('suavizante') || n.includes('cloro') || n.includes('limpiador') || n.includes('papel')) {
          return { emoji: '🧼🧴', badge: 'Limpieza', badgeColor: '#059669', badgeBg: '#D1FAE5' };
        } else if (n.includes('fruta') || n.includes('vegetal') || n.includes('manzana') || n.includes('platano') || n.includes('cebolla') || n.includes('ajo') || n.includes('papa')) {
          return { emoji: '🍎🥬', badge: 'Frescos', badgeColor: '#16A34A', badgeBg: '#DCFCE7' };
        } else if (n.includes('cerveza') || n.includes('vino') || n.includes('ron') || n.includes('refresco') || n.includes('jugo') || n.includes('agua')) {
          return { emoji: '🍻🍹', badge: 'Bebidas', badgeColor: '#9333EA', badgeBg: '#F3E8FF' };
        } else if (n.includes('galleta') || n.includes('cereal') || n.includes('pan') || n.includes('bizcocho')) {
          return { emoji: '🥐🍪', badge: 'Snacks', badgeColor: '#CA8A04', badgeBg: '#FEF08A' };
        }
        return { emoji: '🛒🏷️', badge: 'Oferta Especial', badgeColor: '#0EA5E9', badgeBg: '#E0F2FE' };
      };

      // 1. Jumbo Ofertas (Solo Supermercado)
      try {
        const page = await browser.newPage();
        await page.goto('https://jumbo.com.do/supermercado.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
        const products = await page.evaluate(() => {
          const els = Array.from(document.querySelectorAll('.product-item-info'));
          return els.map(el => ({
            name: el.querySelector('.product-item-link')?.textContent?.trim(),
            price: el.querySelector('.price')?.textContent?.trim()
          }));
        });
        const product = filterGrocery(products || []);
        if (product && product.name) {
           const style = getStyleAndEmoji(product.name);
           jumboPromo = { ...jumboPromo, ...style, title: 'Oferta de Súper', sub: `${product.name}\n${product.price || ''}` };
        }
        await page.close();
      } catch (e: any) { this.logger.error('Error Jumbo: ' + e.message); }

      // 2. Sirena Ofertas (Solo Supermercado)
      try {
        const page = await browser.newPage();
        await page.goto('https://sirena.do/supermercado', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);
        const products = await page.evaluate(() => {
          const els = Array.from(document.querySelectorAll('.vtex-product-summary-2-x-container'));
          return els.map(el => ({
            name: el.querySelector('.vtex-product-summary-2-x-brandName')?.textContent?.trim(),
            price: el.querySelector('.vtex-product-price-1-x-sellingPriceValue')?.textContent?.trim()
          }));
        });
        const product = filterGrocery(products || []);
        if (product && product.name) {
          const style = getStyleAndEmoji(product.name);
          sirenaPromo = { ...sirenaPromo, ...style, title: 'Destacado Hoy', sub: `${product.name}\n${product.price || ''}` };
        }
        await page.close();
      } catch (e: any) { this.logger.error('Error Sirena: ' + e.message); }

      // 3. Nacional Ofertas
      try {
        const page = await browser.newPage();
        await page.goto('https://supermercadosnacional.com/ofertas', { waitUntil: 'domcontentloaded', timeout: 30000 });
        const products = await page.evaluate(() => {
          const els = Array.from(document.querySelectorAll('.product-item-info'));
          return els.map(el => ({
            name: el.querySelector('.product-item-link')?.textContent?.trim(),
            price: el.querySelector('.price')?.textContent?.trim()
          }));
        });
        const product = filterGrocery(products || []);
        if (product && product.name) {
          const style = getStyleAndEmoji(product.name);
          naciPromo = { ...naciPromo, ...style, title: 'Súper Especial', sub: `${product.name}\n${product.price || ''}` };
        }
        await page.close();
      } catch (e: any) { this.logger.error('Error Nacional: ' + e.message); }

      // 4. Plaza Lama Ofertas (Solo Supermercado)
      try {
        const page = await browser.newPage();
        // Usar networkidle para asegurar que VTEX cargue el JS y los productos
        await page.goto('https://plazalama.com.do/ca/supermercado/11', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(5000); // 5 segundos extras para hidratación
        const products = await page.evaluate(() => {
          // Buscamos cualquier elemento que parezca un producto (VTEX o estándar)
          const els = Array.from(document.querySelectorAll('.vtex-product-summary-2-x-container, .vtex-search-result-3-x-galleryItem, .product-item, .card'));
          return els.map(el => {
            const nameEl = el.querySelector('.vtex-product-summary-2-x-productNameContainer, .vtex-product-summary-2-x-brandName, .product-item-name, h2, h3, .vtex-store-components-3-x-productBrand');
            const priceEl = el.querySelector('.vtex-product-price-1-x-sellingPrice, .vtex-product-price-1-x-sellingPriceValue, .price, .money');
            return { name: nameEl?.textContent?.trim(), price: priceEl?.textContent?.trim() };
          });
        });
        
        let product = filterGrocery(products || []);
        
        if (product && product.name && product.name.length > 3) {
          const style = getStyleAndEmoji(product.name);
          let cleanName = product.name.replace(/\n/g, ' ').substring(0, 45);
          plazaPromo = { ...plazaPromo, ...style, title: 'Especial Provisión', sub: `${cleanName}\n${product.price || ''}` };
        } else {
          throw new Error('Bloqueo anti-bot de VTEX o tiempo de espera agotado. Se mantendrán los datos en caché para Plaza Lama.');
        }
        await page.close();
      } catch (e: any) { this.logger.error('Error Plaza Lama: ' + e.message); }

      this.cachedPromotions = [jumboPromo, sirenaPromo, naciPromo, plazaPromo];
      this.logger.log('✅ Banners promocionales actualizados desde páginas reales.');
    } finally {
      await browser.close();
    }
  }

  async forceScrapePromotions(): Promise<any[]> {
    await this.scrapeHomePromotions();
    this.lastPromoFetch = Date.now();
    return this.cachedPromotions;
  }

  async runDailyScraping(targetSupermarkets?: string[]): Promise<{ success: boolean; productsScraped: number; errors: string[] }> {
    const configsToRun = targetSupermarkets && targetSupermarkets.length > 0
      ? ALL_CONFIGS.filter(c => targetSupermarkets.some(t => c.name.toLowerCase().includes(t.toLowerCase())))
      : ALL_CONFIGS;

    this.logger.log(`🕷️  Iniciando scraping... (Objetivos: ${configsToRun.map(c => c.name).join(', ')})`);
    const errors: string[] = [];
    let totalScraped = 0;

    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled'],
    });

    try {
      for (const config of configsToRun) {
        this.logger.log(`\n📦 ═══ Iniciando ${config.name} ═══`);
        let supermarket = await this.prisma.supermarket.findUnique({ where: { name: config.name } });
        if (!supermarket) {
          this.logger.log(`  ➕ Creando nuevo supermercado: ${config.name}`);
          supermarket = await this.prisma.supermarket.create({
            data: { 
              name: config.name, 
              logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(config.name)}&background=random&color=fff&size=200`,
              isActive: true
            }
          });
        }

        let categoriesToScrape = [...config.categories];

        // DYNAMIC CATEGORY DISCOVERY
        if (config.dynamicCategories) {
          this.logger.log(`  🔍 Explorando categorías dinámicamente en ${config.name}...`);
          try {
            const dynamicCats = await this.discoverCategories(browser, config);
            this.logger.log(`  ✅ ${dynamicCats.length} categorías descubiertas automáticamente.`);
            
            // Merge with existing avoiding duplicates
            const existingUrls = new Set(categoriesToScrape.map(c => c.url));
            for (const dc of dynamicCats) {
              if (!existingUrls.has(dc.url)) {
                categoriesToScrape.push(dc);
                existingUrls.add(dc.url);
              }
            }
          } catch (e: any) {
            this.logger.warn(`  ⚠️ Falló descubrimiento dinámico: ${e.message}`);
          }
        }

        this.logger.log(`  📊 Total de categorías a procesar: ${categoriesToScrape.length}`);

        for (const category of categoriesToScrape) {
          try {
            const saved = await this.scrapeCategory(browser, config, supermarket.id, category);
            totalScraped += saved;
            this.logger.log(`  ✅ ${category.categoryName}: ${saved} productos guardados`);
          } catch (err: any) {
            const msg = `Error en ${config.name} / ${category.categoryName}: ${err.message}`;
            this.logger.error(`  ❌ ${msg}`);
            errors.push(msg);
          }
          await this.sleep(config.rateLimit);
        }
        this.logger.log(`✅ ${config.name} completado.`);
        await this.sleep(10000); // Extra pause between supermarkets
      }
    } finally {
      await browser.close();
    }

    this.logger.log(`\n🏁 Scraping completo: ${totalScraped} precios actualizados. Errores: ${errors.length}`);
    return { success: errors.length === 0, productsScraped: totalScraped, errors };
  }

  // ─── Dynamic Category Discovery ───────────────────────────────────────────

  private async discoverCategories(browser: Browser, config: SupermarketConfig): Promise<CategoryConfig[]> {
    if (!config.dynamicCategories) return [];
    
    const page = await browser.newPage();
    try {
      await page.goto(config.dynamicCategories.startUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000); // Wait for dynamic menus to render

      const links = await page.$$eval(config.dynamicCategories.linkSelector, els => 
        els.map(e => ({ name: e.textContent?.trim() || '', url: (e as HTMLAnchorElement).href }))
      );

      const validLinks = links.filter(l => 
        l.url && l.name && l.name.length > 2 && config.dynamicCategories!.urlFilter(l.url)
      );

      const uniqueCats: CategoryConfig[] = [];
      const seenUrls = new Set<string>();

      for (const link of validLinks) {
        // Clean URL from hashes or trailing slashes
        const cleanUrl = link.url.split('#')[0].replace(/\/$/, '');
        if (!seenUrls.has(cleanUrl)) {
          seenUrls.add(cleanUrl);
          // Capitalize and clean name
          const catName = link.name.replace(/\n/g, '').trim().substring(0, 40);
          uniqueCats.push({
            categoryName: catName,
            dbCategoryName: 'General', // Fallback for dynamic categories
            url: cleanUrl,
            maxPages: 5, // Process up to 5 pages per dynamic category
          });
        }
      }

      return uniqueCats;
    } finally {
      await page.close();
    }
  }

  // ─── Single category crawler ──────────────────────────────────────────────

  private async scrapeCategory(
    browser: Browser,
    config: SupermarketConfig,
    supermarketId: string,
    category: CategoryConfig,
  ): Promise<number> {
    let totalSaved = 0;
    let page = 1;

    // Ensure DB category exists
    const dbCategory = await this.prisma.category.upsert({
      where: { name: category.dbCategoryName },
      update: {},
      create: { name: category.dbCategoryName },
    });

    while (page <= category.maxPages) {
      const url = page === 1
        ? category.url
        : config.paginationUrl?.(category.url, page) ?? null;

      if (!url) break;

      const products = await this.scrapePage(browser, config, url);

      if (products.length === 0) {
        this.logger.debug(`    Página ${page} sin productos — terminando categoría`);
        break;
      }

      for (const product of products) {
        try {
          await this.saveProduct(supermarketId, dbCategory.id, product);
          totalSaved++;
        } catch (err: any) {
          this.logger.debug(`    ⚠️ Error guardando "${product.name}": ${err.message}`);
        }
      }

      this.logger.debug(`    Página ${page}/${category.maxPages}: ${products.length} productos`);
      page++;
      await this.sleep(config.rateLimit);
    }

    return totalSaved;
  }

  // ─── Page scraper ─────────────────────────────────────────────────────────

  private async scrapePage(browser: Browser, config: SupermarketConfig, url: string): Promise<ScrapedProduct[]> {
    const page: Page = await browser.newPage();

    try {
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-DO,es;q=0.9,en;q=0.8',
      });

      await page.goto(url, {
        waitUntil: config.needsJavaScript ? 'networkidle' : 'domcontentloaded',
        timeout: 30000,
      });

      if (config.needsJavaScript) {
        await page.waitForSelector(config.selectors.productContainer, { timeout: 12000 }).catch(() => {});
        // Scroll to trigger lazy loading
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
        await this.sleep(1500);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await this.sleep(1500);
      }

      const products = await page.evaluate(
        ({ sel }: { sel: SupermarketConfig['selectors'] }) => {
          const results: ScrapedProduct[] = [];
          const containers = document.querySelectorAll(sel.productContainer);

          containers.forEach((el) => {
            const nameEl = el.querySelector(sel.productName);
            const priceEl = el.querySelector(sel.productPrice);

            if (!nameEl || !priceEl) return;

            const name = nameEl.textContent?.trim() ?? '';
            const rawPrice = priceEl.textContent?.trim() ?? '';

            // Strip currency symbols and letters
            const rawClean = rawPrice.replace(/[^\d.,]/g, '');
            let price = 0;
            
            // Si tiene coma y punto, detectamos cuál es el decimal (el que esté más a la derecha)
            if (rawClean.includes(',') && rawClean.includes('.')) {
                if (rawClean.lastIndexOf(',') > rawClean.lastIndexOf('.')) {
                    // Formato europeo: 1.234,50 -> 1234.50
                    price = parseFloat(rawClean.replace(/\./g, '').replace(',', '.'));
                } else {
                    // Formato US / DR estándar: 1,234.50 -> 1234.50
                    price = parseFloat(rawClean.replace(/,/g, ''));
                }
            } else if (rawClean.includes(',')) {
                // Solo coma. Si termina en ,XX o ,XXX? Usualmente ,XX es decimal.
                if (rawClean.match(/,\d{2}$/)) {
                    price = parseFloat(rawClean.replace(',', '.'));
                } else {
                    price = parseFloat(rawClean.replace(/,/g, ''));
                }
            } else {
                price = parseFloat(rawClean);
            }

            if (!name || isNaN(price) || price <= 0) return;

            const urlEl = sel.productUrl ? el.querySelector(sel.productUrl) : null;
            const imgEl = sel.productImage ? el.querySelector(sel.productImage) : null;

            results.push({
              name,
              price,
              url: (urlEl as HTMLAnchorElement)?.href,
              imageUrl: (imgEl as HTMLImageElement)?.src,
            });
          });

          return results;
        },
        { sel: config.selectors },
      );

      // ── Filtrar productos que NO son de supermercado ──────────────────
      const filtered = products.filter(p => {
        const lower = p.name.toLowerCase();
        
        // Blacklist: palabras clave de electrodomésticos, tecnología, muebles, etc.
        const BLACKLIST = [
          'televisor', 'tv ', ' tv', 'smart tv', 'led tv', 'oled',
          'laptop', 'computador', 'tablet', 'ipad', 'celular', 'smartphone', 'iphone', 'samsung galaxy',
          'nevera', 'refrigerador', 'estufa', 'lavadora', 'secadora', 'microondas',
          'aire acondicionado', 'inverter', 'split', 'btu',
          'licuadora', 'batidora', 'freidora de aire', 'air fryer', 'tostadora',
          'plancha de ropa', 'aspiradora', 'robot aspirador',
          'bocina', 'parlante', 'speaker', 'audífono', 'headphone', 'earbuds',
          'impresora', 'printer', 'monitor', 'mouse', 'teclado',
          'colchón', 'colchon', 'cama', 'sofá', 'sofa', 'mueble', 'mesa de comedor', 'silla gamer',
          'bicicleta', 'scooter', 'patineta',
          'juego de comedor', 'juego de sala',
          'ventilador', 'abanico',
          'generador', 'inversor', 'planta eléctrica',
          'playstation', 'xbox', 'nintendo', 'consola', 'videojuego',
          'cámara', 'camara', 'drone', 'gopro',
          'reloj inteligente', 'smartwatch', 'apple watch',
          'lavaplatos', 'lavavajilla',
          'calentador', 'water heater',
          'herramienta', 'taladro', 'sierra',
          'motocicleta', 'casco',
          'piscina', 'jacuzzi',
          'power bank', 'cargador solar',
          'extractor', 'campana', 'horno empotrar',
          'álbum fifa', 'album fifa', 'figurita', 'sticker album',
          // Juguetes y coleccionables
          'muñeca', 'muñeco', 'rompecabezas', 'puzzle', 'juego de mesa',
          'hasbro', 'disney', 'lego', 'hot wheels', 'barbie', 'nerf', 'mattel', 'pegaso',
          'juguete', 'helicoptero', 'teamsterz', 'astro venture', 'domino spin',
          'educa rompecabezas', 'rastar', 'radio control', 'polly pocket', 'woodzeez',
          'marvel', 'spider man', 'lanzador', 'dinosquad',
          'porsche', 'mercedes amg', 'copa mundial',
        ];
        
        if (BLACKLIST.some(term => lower.includes(term))) return false;
        
        // Precio máximo para artículos de supermercado: RD$ 15,000
        // (Whisky premium, carnes importadas pueden llegar a ~12,000)
        if (p.price > 15000) return false;
        
        return true;
      });
      
      this.logger.debug(`    Filtrado: ${products.length} → ${filtered.length} productos (${products.length - filtered.length} excluidos)`);
      return filtered;
    } catch (err: any) {
      this.logger.debug(`    Error en página ${url}: ${err.message}`);
      return [];
    } finally {
      await page.close();
    }
  }

  // ─── Database persistence ─────────────────────────────────────────────────

  private normalizeProductName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar tildes
      .replace(/\s+/g, ' ') // Espacios múltiples
      .replace(/(\d+)\s*(ml|l|g|kg|oz|lb|lt|litro|litros)/g, '$1$2') // Estandarizar unidades
      .trim();
  }

  private async saveProduct(supermarketId: string, categoryId: string, scraped: ScrapedProduct): Promise<void> {
    const normalizedName = this.normalizeProductName(scraped.name);
    
    // Find or create canonical product by NORMALIZED name to prevent fragmentation
    let canonical = await this.prisma.canonicalProduct.findFirst({
      where: { name: normalizedName },
    });

    if (!canonical) {
      canonical = await this.prisma.canonicalProduct.create({
        data: {
          name: normalizedName,
          categoryId,
          defaultImageUrl: scraped.imageUrl,
        },
      });
    }

    // Find or create the product match
    let match = await this.prisma.productMatch.findFirst({
      where: { canonicalProductId: canonical.id, supermarketId },
    });

    if (!match) {
      match = await this.prisma.productMatch.create({
        data: {
          canonicalProductId: canonical.id,
          supermarketId,
          rawName: scraped.name,
          rawUrl: scraped.url,
        },
      });
    } else {
      await this.prisma.productMatch.update({
        where: { id: match.id },
        data: { rawName: scraped.name, rawUrl: scraped.url },
      });
    }

    // Always insert new price history entry
    await this.prisma.priceHistory.create({
      data: { productMatchId: match.id, price: scraped.price, currency: 'DOP' },
    });
  }

  // ─── Status & Diagnostics ─────────────────────────────────────────────────

  async getScrapingStatus() {
    const [totalProducts, totalPrices, latestPrice, supermarkets] = await Promise.all([
      this.prisma.canonicalProduct.count(),
      this.prisma.priceHistory.count(),
      this.prisma.priceHistory.findFirst({ orderBy: { timestamp: 'desc' } }),
      this.prisma.supermarket.findMany({
        include: {
          productMatches: { include: { priceHistory: { orderBy: { timestamp: 'desc' }, take: 1 } } },
        },
      }),
    ]);

    const bySupermarket = supermarkets.map((sm) => ({
      name: sm.name,
      productMatchCount: sm.productMatches.length,
      lastUpdate: sm.productMatches.flatMap((pm) => pm.priceHistory).sort((a, b) =>
        b.timestamp.getTime() - a.timestamp.getTime()
      )[0]?.timestamp ?? null,
    }));

    return { totalProducts, totalPrices, lastRun: latestPrice?.timestamp ?? null, bySupermarket };
  }

  // ─── Category browser endpoint ────────────────────────────────────────────

  async getCategories(): Promise<string[]> {
    const cats = await this.prisma.category.findMany({ orderBy: { name: 'asc' } });
    return cats.map((c) => c.name);
  }

  async getProductsByCategory(category: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    return this.prisma.canonicalProduct.findMany({
      where: { category: { name: { equals: category } } },
      include: {
        productMatches: {
          include: {
            supermarket: true,
            priceHistory: { orderBy: { timestamp: 'desc' }, take: 1 },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    });
  }

  async searchProducts(query: string, categoryFilter?: string) {
    const normalize = (str: string) => str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';
    const normQuery = normalize(query);
    const normCategory = categoryFilter ? normalize(categoryFilter) : null;

    const allProducts = await this.prisma.canonicalProduct.findMany({
      orderBy: { name: 'asc' },
      where: categoryFilter
        ? { category: { name: { equals: categoryFilter } } }
        : undefined,
      include: {
        category: true,
        productMatches: {
          include: {
            supermarket: true,
            priceHistory: { orderBy: { timestamp: 'desc' }, take: 1 },
          },
        },
      },
    });

    return allProducts
      .filter((p) => {
        const normName = normalize(p.name);
        // Search only by product name (category is already pre-filtered above)
        return normName.includes(normQuery);
      })
      .slice(0, 100)
      .map((p) => {
        // Find the lowest price among matches
        let lowestPrice = 0;
        for (const match of p.productMatches) {
          if (isPrivateLabel(p.name, match.supermarket.name)) continue;

          const price = match.priceHistory[0]?.price || 0;
          if (price > 0 && (lowestPrice === 0 || price < lowestPrice)) {
            lowestPrice = price;
          }
        }
        return {
          id: p.id,
          name: p.name,
          imageUrl: p.defaultImageUrl || 'https://via.placeholder.com/150',
          price: lowestPrice,
        };
      });
  }

  async getProductHistory(canonicalId: string) {
    const product = await this.prisma.canonicalProduct.findUnique({
      where: { id: canonicalId },
      include: {
        productMatches: {
          include: {
            supermarket: true,
            priceHistory: {
              orderBy: { timestamp: 'desc' },
              take: 12, // Get last 12 price points per supermarket
            },
          },
        },
      },
    });

    if (!product) return null;

    // Transform into a format easy for the frontend to consume
    const stores: Record<string, number> = {};
    const historyMap: Record<string, any> = {};

    product.productMatches.forEach(match => {
      const storeName = match.supermarket.name;
      if (isPrivateLabel(product.name, storeName)) return;

      if (match.priceHistory.length > 0) {
        stores[storeName] = match.priceHistory[0].price; // Current price
      }
      
      // Group history by month/date
      match.priceHistory.forEach(ph => {
        const dateStr = ph.timestamp.toISOString().substring(0, 7); // YYYY-MM
        if (!historyMap[dateStr]) historyMap[dateStr] = { date: dateStr };
        historyMap[dateStr][storeName.toLowerCase()] = ph.price;
      });
    });

    const history = Object.values(historyMap)
      .sort((a: any, b: any) => a.date.localeCompare(b.date));

    // Calculate trend
    let trend = 'stable';
    let previous = 0;
    let current = 0;
    
    // Calculamos trend en base al primero no filtrado
    const matchWithHistory = product.productMatches.find(m => m.priceHistory.length > 1 && !isPrivateLabel(product.name, m.supermarket.name));
    if (matchWithHistory && matchWithHistory.priceHistory.length >= 2) {
      current = matchWithHistory.priceHistory[0].price;
      previous = matchWithHistory.priceHistory[1].price;
      if (current > previous) trend = 'up';
      else if (current < previous) trend = 'down';
    } else {
      const singleMatch = product.productMatches.find(m => m.priceHistory.length === 1 && !isPrivateLabel(product.name, m.supermarket.name));
      if (singleMatch) {
        current = singleMatch.priceHistory[0].price;
        previous = current;
      }
    }

    return {
      id: product.id,
      name: product.name,
      current,
      previous,
      trend,
      stores,
      history
    };
  }

  private sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
}
