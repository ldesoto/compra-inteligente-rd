const rawPrice = "RD$ 1,950.00";
const cleaned = rawPrice
  .replace(/[RD$\s]/g, '')
  .replace(/\./g, '')    // remove thousand dots
  .replace(',', '.');    // use period as decimal
console.log(cleaned);
console.log(parseFloat(cleaned));
