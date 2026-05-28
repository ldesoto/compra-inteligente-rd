import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { isPrivateLabel } from '../utils/private-label';

@Injectable()
export class CompareService {
  constructor(private prisma: PrismaService) {}

  async compareByBranch(canonicalProductId: string, lat: number, lng: number) {
    const product = await this.prisma.canonicalProduct.findUnique({
      where: { id: canonicalProductId },
      include: {
        productMatches: {
          include: {
            supermarket: { include: { stores: true } },
            priceHistory: { orderBy: { timestamp: 'desc' }, take: 1 }
          }
        }
      }
    });

    if (!product) throw new NotFoundException('Producto no encontrado');

    const branchResults = [];
    console.log(`📡 [GPS COMPARATOR] Coordenadas recibidas del usuario: Latitud: ${lat}, Longitud: ${lng}`);

    // 🗺️ Buscar sucursales reales en tiempo real usando OpenStreetMap (Overpass API)
    let dynamicStores: any[] = [];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s Max para un rango mayor

      // Usamos 'nwr' (nodes, ways, relations) y 'out center' para detectar supermercados dibujados como polígonos
      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=[out:json];nwr(around:30000,${lat},${lng})[shop~"supermarket|department_store"];out center;`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.elements) {
          dynamicStores = data.elements.map((el: any) => ({
            id: 'osm-' + el.id,
            name: el.tags.name || 'Supermercado',
            latitude: el.lat || (el.center ? el.center.lat : null),
            longitude: el.lon || (el.center ? el.center.lon : null),
            address: el.tags['addr:street'] || el.tags['addr:full'] || 'Sucursal detectada por GPS'
          })).filter(store => store.latitude && store.longitude); // Filtrar si no tienen coordenadas válidas
          console.log(`🗺️ [OSM GPS] ¡Éxito! Se detectaron ${dynamicStores.length} sucursales reales en el mapa (supermercados y grandes tiendas) en un rango de 30km.`);
        }
      }
    } catch (err: any) {
      console.log('⚠️ [OSM GPS] Servidor offline o error de API. Activando fallback inteligente de respaldo.', err.message);
    }

    // Eliminar función local isPrivateLabel, ahora usamos this.isPrivateLabel

    for (const match of product.productMatches) {
      if (match.priceHistory.length === 0) continue;
      
      // Filter out if it's a private label of another supermarket
      if (isPrivateLabel(product.name, match.supermarket.name)) continue;

      const currentPrice = match.priceHistory[0].price;

      let storesToCheck: any[] = [];
      const sName = match.supermarket.name.toLowerCase();

      // 1. Intentar emparejar con las sucursales reales detectadas por OpenStreetMap
      const matchedOsm = dynamicStores.filter(store => {
        const name = store.name.toLowerCase();
        if (sName.includes('jumbo') && name.includes('jumbo')) return true;
        if (sName.includes('sirena') && (
          name.includes('sirena') || 
          name.includes('multicentro') || 
          name.includes('sirenamarket') || 
          name.includes('sirena market') ||
          name.includes('pola') ||
          name.includes('super pola')
        )) return true;
        if (sName.includes('bravo') && name.includes('bravo')) return true;
        if (sName.includes('nacional') && name.includes('nacional')) return true;
        if (sName.includes('lama') && (name.includes('lama') || name.includes('plaza lama'))) return true;
        return false;
      });

      if (matchedOsm.length > 0) {
        storesToCheck = matchedOsm.map(store => ({
          id: store.id,
          supermarketId: match.supermarketId,
          name: store.name.replace(/supermercado|jumbo|sirena|bravo|nacional|sirenamarket|sirena market|super pola|pola|plaza lama|lama/gi, '').trim() || 'Principal',
          latitude: store.latitude,
          longitude: store.longitude,
          address: store.address
        }));
      }

      // 2. Si no se encontró ninguna coincidencia real en OSM, activar el respaldo robusto
      if (storesToCheck.length === 0) {
        if (sName.includes('jumbo')) {
          storesToCheck = [
            { id: 'j1', supermarketId: match.supermarketId, name: 'Luperón', latitude: 18.4527, longitude: -69.9654, address: 'Av. Luperón, SD' },
            { id: 'j2', supermarketId: match.supermarketId, name: 'Ágora Mall', latitude: 18.4835, longitude: -69.9400, address: 'Av. Abraham Lincoln' },
            { id: 'j3', supermarketId: match.supermarketId, name: 'Megacentro', latitude: 18.5029, longitude: -69.8569, address: 'Santo Domingo Este' },
            { id: 'j4', supermarketId: match.supermarketId, name: 'Colinas Mall (Santiago)', latitude: 19.4721, longitude: -70.7180, address: 'Santiago de los Caballeros' },
            { id: 'j5', supermarketId: match.supermarketId, name: 'Lope de Vega', latitude: 18.4735, longitude: -69.9290, address: 'Av. Lope de Vega' },
            { id: 'j6', supermarketId: match.supermarketId, name: 'San Isidro', latitude: 18.4795, longitude: -69.8450, address: 'Autopista San Isidro, SDE' }
          ];
        } else if (sName.includes('sirena')) {
          storesToCheck = [
            { id: 's1', supermarketId: match.supermarketId, name: 'Churchill', latitude: 18.4682, longitude: -69.9419, address: 'Av. Winston Churchill' },
            { id: 's2', supermarketId: match.supermarketId, name: 'San Isidro', latitude: 18.4816, longitude: -69.8329, address: 'Autopista San Isidro' },
            { id: 's3', supermarketId: match.supermarketId, name: 'Luperón', latitude: 18.4641, longitude: -69.9678, address: 'Av. Luperón, SD' },
            { id: 's4', supermarketId: match.supermarketId, name: 'El Embrujo (Santiago)', latitude: 19.4441, longitude: -70.6698, address: 'Santiago de los Caballeros' },
            { id: 's5', supermarketId: match.supermarketId, name: 'Galería 360', latitude: 18.4835, longitude: -69.9360, address: 'Av. John F. Kennedy' },
            { id: 's6', supermarketId: match.supermarketId, name: 'Lope de Vega', latitude: 18.4770, longitude: -69.9280, address: 'Av. Lope de Vega' },
            { id: 's7', supermarketId: match.supermarketId, name: 'Villa Mella', latitude: 18.5350, longitude: -69.9050, address: 'Av. Hermanas Mirabal, SDN' },
            { id: 's8', supermarketId: match.supermarketId, name: 'Autopista Duarte', latitude: 18.4980, longitude: -69.9880, address: 'Aut. Duarte Km 10.5, SDO' },
            { id: 's9', supermarketId: match.supermarketId, name: 'Bartolomé Colón (Santiago)', latitude: 19.4580, longitude: -70.6860, address: 'Santiago de los Caballeros' },
            { id: 's10', supermarketId: match.supermarketId, name: 'Plaza Cuadra Alameda', latitude: 18.4500, longitude: -70.0050, address: 'Prol. 27 de Febrero, SDO' },
            { id: 's11', supermarketId: match.supermarketId, name: 'Patio Colombia', latitude: 18.5020, longitude: -69.9650, address: 'Av. República de Colombia' },
            { id: 's12', supermarketId: match.supermarketId, name: 'Prolongación 27', latitude: 18.4450, longitude: -70.0150, address: 'Av. Prolongación 27 de Febrero' }
          ];
        } else if (sName.includes('bravo')) {
          storesToCheck = [
            { id: 'b1', supermarketId: match.supermarketId, name: 'Churchill', latitude: 18.4651, longitude: -69.9412, address: 'Av. Winston Churchill' },
            { id: 'b2', supermarketId: match.supermarketId, name: 'Enriquillo', latitude: 18.4485, longitude: -69.9620, address: 'Av. Enriquillo, SD' },
            { id: 'b3', supermarketId: match.supermarketId, name: 'San Vicente', latitude: 18.4900, longitude: -69.8500, address: 'Av. San Vicente de Paúl' },
            { id: 'b4', supermarketId: match.supermarketId, name: 'Estrella Sadhalá (Santiago)', latitude: 19.4612, longitude: -70.6987, address: 'Santiago de los Caballeros' },
            { id: 'b5', supermarketId: match.supermarketId, name: 'Rep. de Colombia', latitude: 18.5020, longitude: -69.9650, address: 'Av. República de Colombia' },
            { id: 'b6', supermarketId: match.supermarketId, name: 'Núñez de Cáceres', latitude: 18.4680, longitude: -69.9540, address: 'Av. Núñez de Cáceres' },
            { id: 'b7', supermarketId: match.supermarketId, name: 'Sarasota', latitude: 18.4520, longitude: -69.9470, address: 'Av. Sarasota, Bella Vista' },
            { id: 'b8', supermarketId: match.supermarketId, name: 'Prolongación 27', latitude: 18.4500, longitude: -70.0050, address: 'Av. Prolongación 27 de Febrero, SDO' }
          ];
        } else if (sName.includes('nacional')) {
          storesToCheck = [
            { id: 'n1', supermarketId: match.supermarketId, name: '27 de Febrero', latitude: 18.4658, longitude: -69.9298, address: 'Av. 27 de Febrero' },
            { id: 'n2', supermarketId: match.supermarketId, name: 'Lope de Vega', latitude: 18.4770, longitude: -69.9280, address: 'Av. Lope de Vega' },
            { id: 'n3', supermarketId: match.supermarketId, name: 'Arroyo Hondo', latitude: 18.4930, longitude: -69.9450, address: 'Arroyo Hondo, SD' },
            { id: 'n4', supermarketId: match.supermarketId, name: 'Santiago (Av. 27 de Feb.)', latitude: 19.4589, longitude: -70.6785, address: 'Santiago de los Caballeros' },
            { id: 'n5', supermarketId: match.supermarketId, name: 'Bella Vista Mall', latitude: 18.4480, longitude: -69.9430, address: 'Av. Sarasota, Bella Vista' },
            { id: 'n6', supermarketId: match.supermarketId, name: 'Tiradentes', latitude: 18.4760, longitude: -69.9260, address: 'Av. Tiradentes' },
            { id: 'n7', supermarketId: match.supermarketId, name: 'El Millón', latitude: 18.4650, longitude: -69.9540, address: 'Av. Núñez de Cáceres' }
          ];
        } else {
          storesToCheck = [
            { id: 'default', supermarketId: match.supermarketId, name: 'Principal', latitude: 18.4721, longitude: -69.9417, address: 'Santo Domingo' }
          ];
        }
      }

      for (const store of storesToCheck) {
        // Distance calculation (Haversine simple approximation for RD scale)
        let distance = 0;
        if (store.latitude && store.longitude && lat && lng) {
          const R = 6371; // km
          const dLat = (store.latitude - lat) * (Math.PI/180);
          const dLng = (store.longitude - lng) * (Math.PI/180);
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat * (Math.PI/180)) * Math.cos(store.latitude * (Math.PI/180)) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          distance = R * c;
        }

        branchResults.push({
          supermarketName: match.supermarket.name,
          storeName: store.name,
          address: store.address,
          price: Math.round(currentPrice * 100) / 100,
          distanceKm: distance > 0 ? parseFloat(distance.toFixed(2)) : null,
          inStock: true // Mocked availability
        });
      }
    }

    // To find the cheapest branch regardless of distance
    const cheapestBranch = branchResults.length > 0 ? [...branchResults].sort((a, b) => a.price - b.price)[0] : null;

    // Sort by distance so the closest ones appear at the top
    branchResults.sort((a, b) => {
      return (a.distanceKm || 999) - (b.distanceKm || 999);
    });

    return {
      productId: canonicalProductId,
      productName: product.name,
      cheapestBranch: cheapestBranch,
      branches: branchResults
    };
  }

  async compareList(listId: string) {
    const list = await this.prisma.shoppingList.findUnique({
      where: { id: listId },
      include: {
        items: {
          include: { canonicalProduct: true }
        }
      }
    });

    if (!list) throw new NotFoundException('Lista no encontrada');

    const supermarkets = await this.prisma.supermarket.findMany({
      where: { isActive: true }
    });

    const results = [];

    // Eliminar función local isPrivateLabel, ahora usamos this.isPrivateLabel

    for (const superm of supermarkets) {
      let total = 0;
      const missingItems = [];
      const foundItems = [];

      for (const item of list.items) {
        if (isPrivateLabel(item.canonicalProduct.name, superm.name)) {
          missingItems.push(item.canonicalProduct.name);
          continue;
        }

        const match = await this.prisma.productMatch.findFirst({
          where: {
            canonicalProductId: item.canonicalProductId,
            supermarketId: superm.id
          },
          include: {
            priceHistory: {
              orderBy: { timestamp: 'desc' },
              take: 1
            }
          }
        });

        if (match && match.priceHistory.length > 0) {
          const currentPrice = match.priceHistory[0].price;
          const cost = Math.round(currentPrice * item.quantity * 100) / 100;
          total += cost;
          foundItems.push({
            name: item.canonicalProduct.name,
            quantity: item.quantity,
            unitPrice: Math.round(currentPrice * 100) / 100,
            totalCost: Math.round(cost * 100) / 100
          });
        } else {
          missingItems.push(item.canonicalProduct.name);
        }
      }

      results.push({
        supermarketId: superm.id,
        supermarketName: superm.name,
        logoUrl: superm.logoUrl,
        totalCost: Math.round(total * 100) / 100,
        missingItemsCount: missingItems.length,
        missingItems,
        foundItems
      });
    }

    results.sort((a, b) => {
      if (a.missingItemsCount !== b.missingItemsCount) {
        return a.missingItemsCount - b.missingItemsCount;
      }
      return a.totalCost - b.totalCost;
    });

    const bestOption = results[0];
    const comparableOptions = results.filter(r => r.missingItemsCount === bestOption?.missingItemsCount);
    const worstOption = comparableOptions[comparableOptions.length - 1];
    const maxSavings = worstOption ? Math.round((worstOption.totalCost - bestOption.totalCost) * 100) / 100 : 0;
    const savingsPercentage = worstOption && worstOption.totalCost > 0 
      ? Math.round(((maxSavings / worstOption.totalCost) * 100) * 100) / 100 
      : 0;

    return {
      listId: list.id,
      listName: list.name,
      bestOptionId: bestOption?.supermarketId,
      maxSavings,
      savingsPercentage,
      comparison: results
    };
  }

  async compareQuick(items: any[]) {
    const supermarkets = await this.prisma.supermarket.findMany({
      where: { isActive: true }
    });

    const results = [];

    // Valid items (not custom ones that lack canonicalId)
    const validItems = items.filter(item => !item.isCustom && item.canonicalProductId);

    for (const superm of supermarkets) {
      let total = 0;
      const missingItems = [];
      const foundItems = [];

      for (const item of validItems) {
        const match = await this.prisma.productMatch.findFirst({
          where: {
            canonicalProductId: item.canonicalProductId,
            supermarketId: superm.id
          },
          include: {
            priceHistory: {
              orderBy: { timestamp: 'desc' },
              take: 1
            },
            canonicalProduct: true
          }
        });

        if (match && match.priceHistory.length > 0) {
          if (isPrivateLabel(match.canonicalProduct.name, superm.name)) {
            missingItems.push(match.canonicalProduct.name);
            continue;
          }
          const currentPrice = match.priceHistory[0].price;
          const cost = Math.round(currentPrice * (item.quantity || 1) * 100) / 100;
          total += cost;
          foundItems.push({
            id: item.canonicalProductId,
            name: match.canonicalProduct.name,
            quantity: item.quantity,
            unitPrice: Math.round(currentPrice * 100) / 100,
            totalCost: Math.round(cost * 100) / 100
          });
        } else {
          missingItems.push(item.name || 'Producto desconocido');
        }
      }

      results.push({
        supermarketId: superm.id,
        supermarketName: superm.name,
        logoUrl: superm.logoUrl,
        totalCost: Math.round(total * 100) / 100,
        missingItemsCount: missingItems.length,
        missingItems,
        foundItems
      });
    }

    results.sort((a, b) => {
      if (a.missingItemsCount !== b.missingItemsCount) {
        return a.missingItemsCount - b.missingItemsCount;
      }
      return a.totalCost - b.totalCost;
    });

    const bestOption = results[0];
    const comparableOptions = results.filter(r => r.missingItemsCount === bestOption?.missingItemsCount);
    const worstOption = comparableOptions[comparableOptions.length - 1];
    const maxSavings = worstOption && bestOption ? Math.round((worstOption.totalCost - bestOption.totalCost) * 100) / 100 : 0;
    const savingsPercentage = worstOption && worstOption.totalCost > 0 ? Math.round(((maxSavings / worstOption.totalCost) * 100) * 100) / 100 : 0;

    // Calculate Split Strategy — cheapest store per item
    const splitStoreMap: Record<string, { subtotal: number; items: { name: string; quantity: number; unitPrice: number; totalCost: number }[] }> = {};
    let splitTotal = 0;

    for (const item of validItems) {
      let cheapestCost = Infinity;
      let cheapestStore: string | null = null;
      let cheapestFound: any = null;

      for (const res of results) {
        const found = res.foundItems.find((f: any) => f.id === item.canonicalProductId);
        if (found && found.totalCost < cheapestCost) {
          cheapestCost = found.totalCost;
          cheapestStore = res.supermarketName;
          cheapestFound = found;
        }
      }

      if (cheapestStore && cheapestFound) {
        splitTotal += cheapestCost;
        if (!splitStoreMap[cheapestStore]) {
          splitStoreMap[cheapestStore] = { subtotal: 0, items: [] };
        }
        splitStoreMap[cheapestStore].subtotal += cheapestCost;
        splitStoreMap[cheapestStore].items.push({
          name: cheapestFound.name,
          quantity: cheapestFound.quantity,
          unitPrice: Math.round(cheapestFound.unitPrice * 100) / 100,
          totalCost: Math.round(cheapestCost * 100) / 100,
        });
      }
    }

    const splitStrategy = {
      total: Math.round(splitTotal * 100) / 100,
      storeTotals: Object.fromEntries(
        Object.entries(splitStoreMap).map(([name, data]) => [name, Math.round(data.subtotal * 100) / 100])
      ),
      stores: Object.entries(splitStoreMap).map(([name, data]) => ({
        name,
        subtotal: Math.round(data.subtotal * 100) / 100,
        items: data.items,
      })),
    };

    return {
      listId: 'quick-compare',
      listName: 'Borrador Activo',
      bestOptionId: bestOption?.supermarketId,
      bestOptionName: bestOption?.supermarketName,
      maxSavings,
      savingsPercentage,
      splitStrategy,
      comparison: results
    };
  }

  // Motor Inteligente para comparación a nivel de producto individual
  async compareProduct(canonicalProductId: string) {
    const product = await this.prisma.canonicalProduct.findUnique({
      where: { id: canonicalProductId },
      include: {
        productMatches: {
          include: {
            supermarket: true,
            priceHistory: {
              orderBy: { timestamp: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    if (!product) throw new NotFoundException('Producto no encontrado');

    const results = product.productMatches.map(match => {
      const price = Math.round((match.priceHistory[0]?.price || 0) * 100) / 100;
      let unitPrice = null;
      
      if (product.baseWeight && product.baseWeight > 0) {
        unitPrice = Math.round((price / product.baseWeight) * 100) / 100;
      }
      
      // Score calidad-precio: Si existe precio y base, se calcula. 100 es mejor.
      // Ejemplo: si calidad es PREMIUM, el score sube. Si unitPrice es alto, baja.
      let score = null;
      if (unitPrice !== null) {
        const qualityMultiplier = product.qualityTier === 'PREMIUM' ? 1.2 : product.qualityTier === 'WHITE_LABEL' ? 0.8 : 1.0;
        // Un cálculo arbitrario de ejemplo (inversamente proporcional al precio unitario)
        score = Math.max(0, Math.min(100, 100 - (unitPrice * 5) * qualityMultiplier));
      }

      return {
        supermarketId: match.supermarket.id,
        supermarketName: match.supermarket.name,
        logoUrl: match.supermarket.logoUrl,
        price,
        unitPrice,
        unit: product.baseUnit || 'unidad',
        brand: product.brand,
        qualityTier: product.qualityTier,
        score: score !== null ? Math.round(score) : Math.round(price > 0 ? 50 : 0)
      };
    }).filter(r => r.price > 0 && !isPrivateLabel(product.name, r.supermarketName));

    results.sort((a, b) => a.price - b.price);

    // Deduplicate by supermarketId (keep only the cheapest since it's sorted)
    const deduplicatedResults = [];
    const seenSupermarkets = new Set();
    for (const r of results) {
      if (!seenSupermarkets.has(r.supermarketId)) {
        seenSupermarkets.add(r.supermarketId);
        deduplicatedResults.push(r);
      }
    }

    const maxSavings = deduplicatedResults.length > 1 ? Math.round((deduplicatedResults[deduplicatedResults.length - 1].price - deduplicatedResults[0].price) * 100) / 100 : 0;
    const savingsPercentage = deduplicatedResults.length > 1 ? Math.round(((maxSavings / deduplicatedResults[deduplicatedResults.length - 1].price) * 100) * 100) / 100 : 0;

    return {
      productId: product.id,
      productName: product.name,
      baseWeight: product.baseWeight,
      baseUnit: product.baseUnit,
      bestOptionId: deduplicatedResults.length > 0 ? deduplicatedResults[0].supermarketId : null,
      maxSavings,
      savingsPercentage,
      comparisons: deduplicatedResults
    };
  }
}
