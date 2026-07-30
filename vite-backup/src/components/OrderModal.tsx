import React, { useState, useEffect } from 'react';
import { Product, useApp } from '@/context/AppContext';
import { X, MapPin, ShieldCheck, Truck } from 'lucide-react';

interface OrderModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, deliveryAddress: string) => void;
}

export default function OrderModal({ product, isOpen, onClose, onConfirm }: OrderModalProps) {
  const { t } = useApp();
  const [quantity, setQuantity] = useState(10);
  const [address, setAddress] = useState('Central Bazaar Hub, Madurai Rural, TN');
  const [error, setError] = useState('');

  // Reset values when a new product is selected
  useEffect(() => {
    if (product) {
      setQuantity(Math.min(50, product.stockKg));
      setError('');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const orderValue = product.pricePerKg * quantity;
  const deliveryWage = Math.round(orderValue * 0.05 + 150); // 5% + base 150 INR

  const handleQuantityChange = (val: number) => {
    if (val <= 0) {
      setError(t('qty_greater_zero'));
    } else if (val > product.stockKg) {
      setError(t('only_stock_available').replace('{stock}', product.stockKg.toString()));
    } else {
      setError('');
    }
    setQuantity(val);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0 || quantity > product.stockKg) {
      setError(t('invalid_qty_msg'));
      return;
    }
    if (!address.trim()) {
      setError(t('provide_address_msg'));
      return;
    }

    onConfirm(quantity, address);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg rounded-2xl border border-[#e6eae7] dark:border-[#232a26] bg-white dark:bg-[#141816] shadow-2xl p-6 overflow-hidden z-10 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-earth-100 dark:border-earth-900/40 pb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{t('confirm_purchase_order')}</h3>
            <p className="text-xs text-earth-400 mt-0.5">{t('smart_escrow_system')}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-earth-400 hover:text-foreground hover:bg-earth-100 dark:hover:bg-earth-900/40 cursor-pointer border-0 bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePlaceOrder} className="mt-5 space-y-4">
          {/* Crop Profile Summary */}
          <div className="flex gap-4 p-3 rounded-xl bg-earth-50 dark:bg-earth-950/20 border border-earth-100 dark:border-earth-900/40">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-16 h-16 object-cover rounded-lg shrink-0" 
            />
            <div className="overflow-hidden">
              <h4 className="font-bold text-sm text-foreground truncate">{product.name}</h4>
              <p className="text-xs text-earth-500 dark:text-earth-400 truncate">{t('farmer_prefix')}: {product.farmerName}</p>
              <div className="flex gap-4 mt-1.5 text-xs">
                <span>{t('price')}: <strong className="text-primary-600 dark:text-primary-400">₹{product.pricePerKg}/{t('kg_unit')}</strong></span>
                <span>{t('stock')}: <strong>{product.stockKg} {t('kg_unit')}</strong></span>
              </div>
            </div>
          </div>

          {/* Quantity selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-earth-400 block mb-1.5">
              {t('order_qty_kg')}
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleQuantityChange(Math.max(10, quantity - 10))}
                className="w-10 h-10 rounded-xl border border-earth-200 dark:border-earth-800 flex items-center justify-center text-lg font-bold hover:bg-earth-50 dark:hover:bg-earth-900/40 cursor-pointer text-foreground bg-transparent"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
                className="flex-1 h-10 rounded-xl border border-earth-200 dark:border-earth-800 text-center font-bold text-sm text-foreground focus:ring-1 focus:ring-primary-500 bg-transparent"
              />
              <button
                type="button"
                onClick={() => handleQuantityChange(Math.min(product.stockKg, quantity + 10))}
                className="w-10 h-10 rounded-xl border border-earth-200 dark:border-earth-800 flex items-center justify-center text-lg font-bold hover:bg-earth-50 dark:hover:bg-earth-900/40 cursor-pointer text-foreground bg-transparent"
              >
                +
              </button>
            </div>
            {error && <p className="text-xs text-red-500 font-semibold mt-1.5">{error}</p>}
          </div>

          {/* Delivery Location input */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-earth-400 block mb-1.5">
              {t('dest_address_label')}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-earth-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t('enter_drop_loc_placeholder')}
                className="w-full h-10 rounded-xl border border-earth-200 dark:border-earth-800 bg-transparent pl-10 pr-4 text-xs font-medium text-foreground focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Pricing Ledger Breakdown */}
          <div className="p-4 rounded-xl border border-[#e6eae7] dark:border-[#232a26] bg-white dark:bg-[#141816] space-y-2.5">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-earth-400 pb-1.5 border-b border-earth-100 dark:border-earth-900/20">
              {t('ledger_breakdown_title')}
            </h5>
            <div className="flex justify-between text-xs">
              <span className="text-earth-500 dark:text-earth-400">{t('produce_subtotal')} ({quantity} {t('kg_unit')} × ₹{product.pricePerKg})</span>
              <span className="font-semibold text-foreground">₹{orderValue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-earth-500 dark:text-earth-400 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-earth-400" />
                {t('logistics_fare')}
              </span>
              <span className="font-semibold text-primary-600 dark:text-primary-400">+₹{deliveryWage.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[9px] text-earth-400 bg-earth-50 dark:bg-earth-950/40 p-2 rounded-lg leading-normal flex items-start gap-1">
              <ShieldCheck className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
              <span>{t('logistics_fare_desc')}</span>
            </div>
            <div className="border-t border-earth-100 dark:border-earth-900/20 pt-2 flex justify-between items-baseline">
              <span className="text-sm font-bold text-foreground">{t('total_escrow_debit')}</span>
              <span className="text-lg font-black text-primary-600 dark:text-primary-400">₹{(orderValue).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Confirm Actions */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-earth-200 dark:border-earth-800 text-xs font-bold hover:bg-earth-50 dark:hover:bg-earth-900/40 cursor-pointer text-foreground bg-transparent"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={!!error || quantity <= 0}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border-0 ${
                !!error || quantity <= 0
                  ? 'bg-earth-100 dark:bg-earth-900/40 text-earth-400 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600 text-white shadow-sm hover:shadow-md'
              }`}
            >
              {t('auth_escrow_place_order')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
