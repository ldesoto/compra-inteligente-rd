export function isPrivateLabel(prodName: string, supName: string): boolean {
  if (!prodName || !supName) return false;
  const p = prodName.toLowerCase();
  const s = supName.toLowerCase();
  
  // Grupo Ramos (La Sirena, Pola, Aprezio)
  if ((p.includes('wala') || p.includes('sirena') || p.includes('zerca') || p.includes('first class')) && !s.includes('sirena') && !s.includes('pola')) return true;
  
  // Centro Cuesta Nacional (Nacional, Jumbo)
  if ((p.includes('líder') || p.includes('lider') || p.includes('nacional') || p.includes('jumbo')) && !(s.includes('jumbo') || s.includes('nacional'))) return true;
  
  // Supermercados Bravo
  if (p.includes('bravo') && !s.includes('bravo')) return true;

  return false;
}
