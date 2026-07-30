
import { Product, useApp } from '@/context/AppContext';
import { MapPin, User, Scale, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onBuyClick?: (product: Product) => void;
  isBuyable?: boolean;
}

export default function ProductCard({ product, onBuyClick, isBuyable = false }: ProductCardProps) {
  const { t } = useApp();
  const isOutOfStock = product.stockKg <= 0;

  return (
    <div className="rounded-2xl border border-[#e6eae7] dark:border-[#232a26] bg-white dark:bg-[#141816] overflow-hidden flex flex-col shadow-sm hover-card">
      {/* Product Image */}
      <div className="h-44 relative bg-earth-100 dark:bg-earth-900/60 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-[#111613]/90 text-primary-700 dark:text-primary-400 rounded-full shadow-sm">
            {product.category}
          </span>
        </div>
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="px-4 py-1.5 rounded-lg border border-red-500/20 bg-red-950/80 text-red-400 font-bold text-xs uppercase tracking-widest">
              {t('out_of_stock')}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h4 className="text-base font-bold text-foreground tracking-tight">{product.name}</h4>
            <div className="text-right shrink-0">
              <span className="text-lg font-extrabold text-primary-600 dark:text-primary-400">
                ₹{product.pricePerKg}
              </span>
              <span className="text-[10px] text-earth-400 block -mt-1">{t('per_kg')}</span>
            </div>
          </div>

          <div className="space-y-2 mt-4 text-xs text-earth-500 dark:text-earth-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-earth-400 shrink-0" />
              <span className="truncate">{product.location}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-earth-400 shrink-0" />
              <span className="truncate">{t('farmer_prefix')}: {product.farmerName}</span>
            </div>

            <div className="flex items-center gap-2">
              <Scale className="w-3.5 h-3.5 text-earth-400 shrink-0" />
              <span>{t('available_stock')}: <strong className="text-foreground font-semibold">{product.stockKg.toLocaleString()} {t('kg_unit')}</strong></span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {isBuyable && (
          <div className="mt-5 border-t border-earth-100 dark:border-earth-900/40 pt-4">
            <button
              onClick={() => onBuyClick?.(product)}
              disabled={isOutOfStock}
              className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border-0 ${
                isOutOfStock
                  ? 'bg-earth-100 dark:bg-earth-900/40 text-earth-400 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600 text-white shadow-sm hover:shadow-md'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('place_purchase_order')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
