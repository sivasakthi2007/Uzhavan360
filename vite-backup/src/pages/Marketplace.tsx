import { useState } from 'react';
import { useApp, Product } from '@/context/AppContext';
import ProductCard from '@/components/ProductCard';
import FilterBar from '@/components/FilterBar';
import OrderModal from '@/components/OrderModal';
import { Leaf, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function MarketplacePage() {
  const { products, placeOrder, activeRole, buyerType, userName, t } = useApp();

  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Order modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState('');

  const categories = [
    { id: 'All', label: t('cat_all') },
    { id: 'Vegetables', label: t('cat_vegetables') },
    { id: 'Fruits', label: t('cat_fruits') },
    { id: 'Grains', label: t('cat_grains') },
    { id: 'Spices', label: t('cat_spices') }
  ];

  // Map buyerType to product targetChannel
  // buyerType: 'customer' | 'hotel' | 'retail' | 'marriage'
  // targetChannel: 'b2c' | 'hotel' | 'retail' | 'marriage'
  const currentChannel = buyerType === 'customer' ? 'b2c' : buyerType;

  // Filter products by search, category, location, AND strictly targetChannel
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchValue.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesLocation = selectedLocation === '' || p.location === selectedLocation;
    
    // Strict channel isolation for buyers
    const matchesChannel = p.targetChannel === currentChannel;

    return matchesSearch && matchesCategory && matchesLocation && matchesChannel;
  });

  // Extract unique locations from filtered/valid channel products
  const channelProducts = products.filter(p => p.targetChannel === currentChannel);
  const locations = Array.from(new Set(channelProducts.map((p) => p.location)));

  const handleBuyClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleConfirmOrder = (quantity: number, deliveryAddress: string) => {
    if (!selectedProduct) return;
    placeOrder(selectedProduct.id, quantity, userName, deliveryAddress);
    
    setSuccessOrderId(`ORD-${Date.now().toString().slice(-4)}`);
    setShowOrderSuccess(true);
    setTimeout(() => setShowOrderSuccess(false), 5000);
  };

  const getChannelLabel = () => {
    switch (buyerType) {
      case 'hotel': return t('channel_hotel');
      case 'retail': return t('channel_retail');
      case 'marriage': return t('channel_marriage');
      default: return t('channel_b2c');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 px-2.5 py-0.5 rounded-full">
            {t('active_channel')}: {getChannelLabel()}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight mt-1">
            {t('direct_marketplace_title')}
          </h2>
          <p className="text-xs text-earth-400 mt-0.5">
            {t('direct_marketplace_desc')}
          </p>
        </div>
        {showOrderSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-xl animate-fade-in shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-primary-500 shrink-0" />
            <span>{t('success_order_placed').replace('{id}', successOrderId)}</span>
          </div>
        )}
      </div>

      {/* Warning if trying to browse without correct buyer role */}
      {activeRole !== 'buyer' && (
        <div className="p-4 rounded-xl border border-amber-500/10 bg-amber-50/15 text-xs flex items-start gap-2 text-amber-700">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{t('viewing_as_warning').replace('{role}', activeRole)}</span>
        </div>
      )}

      {/* Filter Options */}
      <FilterBar
        searchPlaceholder={t('search_crops_placeholder').replace('{channel}', buyerType === 'customer' ? 'B2C' : 'B2B')}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        locations={locations}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
      />

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-earth-200 dark:border-earth-880 text-center">
          <Leaf className="w-8 h-8 text-earth-300 dark:text-earth-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">{t('no_crops_found')}</p>
          <p className="text-xs text-earth-400 mt-1">{t('no_crops_found_desc').replace('{channel}', getChannelLabel())}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              isBuyable={activeRole === 'buyer'}
              onBuyClick={handleBuyClick}
            />
          ))}
        </div>
      )}

      {/* BuyingEscrow Modal */}
      <OrderModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmOrder}
      />
    </div>
  );
}
