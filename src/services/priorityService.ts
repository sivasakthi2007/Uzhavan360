import { Product, RentalItem, LaborJob } from '@/context/AppContext';

export interface FilterOptions {
  district?: string;
  village?: string;
  category?: string;
  maxPrice?: number;
  minRating?: number;
  availability?: string; // 'available' | 'all'
  date?: string;
}

// ─── 1. Products Prioritization & Sorting ────────────────────────────
export function prioritizeProducts(
  products: Product[],
  userDistrict: string,
  userVillage: string,
  sortOption: string,
  filters: FilterOptions
): Product[] {
  // Apply Search Filters
  let filtered = [...products];

  if (filters.district && filters.district !== 'all') {
    filtered = filtered.filter(p => p.district?.toLowerCase() === filters.district?.toLowerCase() || p.location?.toLowerCase().includes(filters.district?.toLowerCase() || ''));
  }
  if (filters.village && filters.village !== 'all') {
    filtered = filtered.filter(p => p.village?.toLowerCase() === filters.village?.toLowerCase() || p.location?.toLowerCase().includes(filters.village?.toLowerCase() || ''));
  }
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(p => p.category.toLowerCase() === filters.category?.toLowerCase());
  }
  if (filters.maxPrice) {
    filtered = filtered.filter(p => p.pricePerKg <= (filters.maxPrice || Infinity));
  }
  if (filters.minRating) {
    filtered = filtered.filter(p => (p.farmerRating || 0) >= (filters.minRating || 0));
  }
  if (filters.availability === 'available') {
    filtered = filtered.filter(p => p.stockKg > 0);
  }

  // Calculate Intelligent Priority Score (if sorting by Recommended)
  const productsWithScore = filtered.map(p => {
    let score = 0;

    // 1. Available Products
    if (p.stockKg > 0) score += 1000;
    
    // 2. Nearby Products (same district / village or close distance)
    const isSameDistrict = p.district?.toLowerCase() === userDistrict.toLowerCase();
    const isSameVillage = p.village?.toLowerCase() === userVillage.toLowerCase();
    if (isSameVillage) score += 500;
    else if (isSameDistrict) score += 300;
    
    if (p.distanceKm !== undefined && p.distanceKm < 15) {
      score += (15 - p.distanceKm) * 20; // Up to +300 points for proximity
    }

    // 3. Recommended Products
    if (p.isRecommended) score += 250;

    // 4. Recently Added
    if (p.isNew) score += 100;
    if (p.createdAt) {
      const daysAgo = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysAgo < 3) score += 80;
    }

    // 5. Highest Rated Farmers
    if (p.farmerRating && p.farmerRating >= 4.5) {
      score += (p.farmerRating - 4.5) * 400; // E.g. rating 4.8 adds +120 points
    }

    // 6. Best Price (weighted lower price)
    if (p.pricePerKg < 40) score += 50;

    // 7. Trending Products
    if (p.salesCount && p.salesCount >= 100) score += 30;
    if (p.isTrending) score += 30;

    return { product: p, score };
  });

  // Apply Sorting
  productsWithScore.sort((a, b) => {
    switch (sortOption) {
      case 'Newest':
      case 'newest':
        return new Date(b.product.createdAt || '').getTime() - new Date(a.product.createdAt || '').getTime();
      
      case 'Price Low → High':
      case 'price_asc':
        return a.product.pricePerKg - b.product.pricePerKg;

      case 'Price High → Low':
      case 'price_desc':
        return b.product.pricePerKg - a.product.pricePerKg;

      case 'Nearest':
      case 'nearest':
        return (a.product.distanceKm || 0) - (b.product.distanceKm || 0);

      case 'Highest Rated':
      case 'rating_desc':
        return (b.product.farmerRating || 0) - (a.product.farmerRating || 0);

      case 'Most Popular':
      case 'popular':
        return (b.product.salesCount || 0) - (a.product.salesCount || 0);

      case 'Recommended':
      case 'recommended':
      default:
        return b.score - a.score;
    }
  });

  return productsWithScore.map(x => x.product);
}

// ─── 2. Equipment Prioritization & Sorting ───────────────────────────
export function prioritizeEquipment(
  equipment: RentalItem[],
  userDistrict: string,
  userVillage: string,
  sortOption: string,
  filters: FilterOptions
): RentalItem[] {
  // Apply Search Filters
  let filtered = [...equipment];

  // Hide unavailable equipment by default unless specified
  if (filters.availability === 'all') {
    // Keep all
  } else {
    // Default: Hide unavailable (rented or maintenance)
    filtered = filtered.filter(item => item.status === 'available');
  }

  if (filters.district && filters.district !== 'all') {
    filtered = filtered.filter(item => item.district?.toLowerCase() === filters.district?.toLowerCase());
  }
  if (filters.village && filters.village !== 'all') {
    filtered = filtered.filter(item => item.village?.toLowerCase() === filters.village?.toLowerCase());
  }
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(item => item.category === filters.category || item.equipmentType === filters.category);
  }
  if (filters.maxPrice) {
    filtered = filtered.filter(item => item.pricePerDay <= (filters.maxPrice || Infinity));
  }
  if (filters.minRating) {
    filtered = filtered.filter(item => item.ownerRating >= (filters.minRating || 0));
  }

  // Calculate Weighted Priority
  const equipWithScore = filtered.map(item => {
    let score = 0;

    // 1. Available Today
    if (item.status === 'available') score += 1000;

    // 2. Nearby Equipment
    const isSameDistrict = item.district?.toLowerCase() === userDistrict.toLowerCase();
    const isSameVillage = item.village?.toLowerCase() === userVillage.toLowerCase();
    if (isSameVillage) score += 500;
    else if (isSameDistrict) score += 300;

    if (item.distanceKm !== undefined && item.distanceKm < 15) {
      score += (15 - item.distanceKm) * 20;
    }

    // 3. Highest Rated Owners
    if (item.ownerRating && item.ownerRating >= 4.5) {
      score += (item.ownerRating - 4.5) * 400;
    }

    // 4. Lowest Price (Daily Rate)
    if (item.pricePerDay < 3000) score += 100;

    // 5. Recently Added
    if (item.createdAt) {
      const daysAgo = (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysAgo < 7) score += 80;
    }

    return { item, score };
  });

  // Apply Sorting
  equipWithScore.sort((a, b) => {
    switch (sortOption) {
      case 'Nearest':
      case 'nearest':
        return (a.item.distanceKm || 0) - (b.item.distanceKm || 0);

      case 'Price':
      case 'price_asc':
        return a.item.pricePerDay - b.item.pricePerDay;

      case 'Rating':
      case 'rating_desc':
        return b.item.ownerRating - a.item.ownerRating;

      case 'Recommended':
      case 'recommended':
      default:
        return b.score - a.score;
    }
  });

  return equipWithScore.map(x => x.item);
}

// ─── 3. Labor Jobs Prioritization & Sorting ──────────────────────────
export function prioritizeJobs(
  jobs: LaborJob[],
  userDistrict: string,
  userVillage: string,
  sortOption: string,
  filters: FilterOptions
): LaborJob[] {
  // Apply Search Filters
  let filtered = [...jobs];

  // Hide completed, cancelled, expired by default
  filtered = filtered.filter(j => j.status !== 'completed' && j.status !== 'cancelled');

  if (filters.district && filters.district !== 'all') {
    filtered = filtered.filter(j => j.district?.toLowerCase() === filters.district?.toLowerCase());
  }
  if (filters.village && filters.village !== 'all') {
    filtered = filtered.filter(j => j.village?.toLowerCase() === filters.village?.toLowerCase());
  }
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(j => j.category === filters.category);
  }
  if (filters.maxPrice) {
    filtered = filtered.filter(j => j.wages <= (filters.maxPrice || Infinity));
  }
  if (filters.minRating) {
    filtered = filtered.filter(j => (j.farmerRating || 0) >= (filters.minRating || 0));
  }

  // Calculate Weighted Priority
  const jobsWithScore = filtered.map(j => {
    let score = 0;

    // 1. Open Jobs
    if (j.status === 'open') score += 1000;

    // 2. Nearby Jobs
    const isSameDistrict = j.district?.toLowerCase() === userDistrict.toLowerCase();
    const isSameVillage = j.village?.toLowerCase() === userVillage.toLowerCase();
    if (isSameVillage) score += 500;
    else if (isSameDistrict) score += 300;

    if (j.distanceKm !== undefined && j.distanceKm < 15) {
      score += (15 - j.distanceKm) * 20;
    }

    // 3. Urgent Jobs
    if (j.isUrgent) score += 300;

    // 4. Higher Wage
    if (j.wages >= 400) score += (j.wages - 400) * 2;

    // 5. Recently Posted
    if (j.createdAt) {
      const daysAgo = (Date.now() - new Date(j.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysAgo < 5) score += 100;
    }

    return { job: j, score };
  });

  // Apply Sorting
  jobsWithScore.sort((a, b) => {
    switch (sortOption) {
      case 'Nearest':
      case 'nearest':
        return (a.job.distanceKm || 0) - (b.job.distanceKm || 0);

      case 'Wage':
      case 'wage_desc':
        return b.job.wages - a.job.wages;

      case 'Latest':
      case 'latest':
        return new Date(b.job.createdAt || '').getTime() - new Date(a.job.createdAt || '').getTime();

      case 'Recommended':
      case 'recommended':
      default:
        return b.score - a.score;
    }
  });

  return jobsWithScore.map(x => x.job);
}
