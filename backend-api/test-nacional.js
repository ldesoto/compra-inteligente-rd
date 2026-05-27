const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('https://supermercadosnacional.com/supermercado/carnes-pescados-y-mariscos/carnes/pollo', { waitUntil: 'networkidle' });
    const products = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.product-item-info')).map(el => {
        const name = el.querySelector('.product-item-link')?.textContent?.trim();
        const price = el.querySelector('.price-box .price')?.textContent?.trim();
        return { name, price };
      });
    });
    console.log(products.slice(0, 5));
  } catch(e) {
    console.error(e.message);
  } finally {
    await browser.close();
  }
})();
