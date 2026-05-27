const axios = require('axios');

async function main() {
  try {
    const res = await axios.get('http://localhost:3000/scraper/search?q=a');
    const items = res.data.slice(0, 6).map(prod => ({
      id: prod.id,
      canonicalProductId: prod.id,
      name: prod.name,
      quantity: 1
    }));
    console.log("Items to compare:", items.map(i => i.name));
    
    const compareRes = await axios.post('http://localhost:3000/compare/quick', { items });
    console.log("Compare Result:", JSON.stringify(compareRes.data, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}
main();
