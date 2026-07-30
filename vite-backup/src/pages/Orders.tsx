
import { useApp } from '@/context/AppContext';
import TableComponent from '@/components/TableComponent';
import StatusBadge from '@/components/StatusBadge';
import { ClipboardList } from 'lucide-react';

export default function OrdersPage() {
  const { activeRole, orders, products, rentalItems, returnRentalItem, t } = useApp();

  // Filter orders based on user role
  const getRoleOrders = () => {
    if (activeRole === 'farmer') {
      return orders.filter((o) => o.farmerId === 'farmer_1');
    } else if (activeRole === 'buyer') {
      return orders.filter((o) => o.buyerId === 'buyer_1');
    }
    return orders; // default show all for sandbox visibility
  };

  const roleOrders = getRoleOrders();

  if (activeRole === 'vendor') {
    const rentedItems = rentalItems.filter(r => r.vendorId === 'vendor_1' && r.status === 'rented');
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Title */}
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">{t('vendor_lease_tab')}</h2>
          <p className="text-xs text-earth-400 mt-1">
            Track active machinery lease agreements and client payouts.
          </p>
        </div>

        {/* Leases Table */}
        {rentedItems.length === 0 ? (
          <div className="p-12 rounded-2xl border border-dashed border-earth-200 dark:border-earth-800 text-center">
            <ClipboardList className="w-8 h-8 text-earth-300 dark:text-earth-700 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">No active lease agreements</p>
            <p className="text-xs text-earth-400 mt-1">Your machinery inventory is currently available for rental bookings.</p>
          </div>
        ) : (
          <TableComponent 
            title="Active Leases & Agreements" 
            description="Secure payments are auto-released upon checkout verification."
            headers={[
              "Agreement ID", 
              "Machinery / Tool", 
              "Category", 
              "Daily Rental Rate", 
              "Location", 
              "Fulfillment Status", 
              "Actions"
            ]}
          >
            {rentedItems.map((item) => (
              <tr key={item.id} className="hover:bg-earth-50/50 dark:hover:bg-earth-900/10">
                <td className="px-6 py-4 font-mono font-bold text-foreground">{item.id.toUpperCase()}</td>
                <td className="px-6 py-4 font-bold text-foreground">{item.name}</td>
                <td className="px-6 py-4 font-medium capitalize">{item.category}</td>
                <td className="px-6 py-4 font-black text-primary-600 dark:text-primary-400">
                  ₹{item.pricePerDay.toLocaleString('en-IN')} / day
                </td>
                <td className="px-6 py-4 text-earth-500 font-semibold">{item.location}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 rounded-full">
                    Leased Out
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => returnRentalItem(item.id)}
                    className="py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[10px] font-bold cursor-pointer border-0 shadow-sm transition-all"
                  >
                    Release Lease
                  </button>
                </td>
              </tr>
            ))}
          </TableComponent>
        )}
      </div>
    );
  }


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">{t('escrow_title')}</h2>
        <p className="text-xs text-earth-400 mt-1">
          {activeRole === 'farmer' ? t('escrow_farmer_desc') :
           activeRole === 'buyer' ? t('escrow_buyer_desc') :
           t('escrow_sandbox_desc')}
        </p>
      </div>

      {/* Orders Table */}
      {roleOrders.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-earth-200 dark:border-earth-800 text-center">
          <ClipboardList className="w-8 h-8 text-earth-300 dark:text-earth-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">{t('no_orders')}</p>
          <p className="text-xs text-earth-400 mt-1">{t('no_orders_desc')}</p>
        </div>
      ) : (
        <TableComponent 
          title={t('escrow_table_title')} 
          description={t('escrow_table_desc')}
          headers={[
            t('col_agreement_id'), 
            t('col_crop'), 
            t('col_counterparty'), 
            t('col_quantity'), 
            t('col_valuation'), 
            t('col_status'), 
            t('col_created')
          ]}
        >
          {roleOrders.map((o) => {
            const timeStr = new Date(o.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            });
            const relativeProduct = products.find(p => p.id === o.productId);
            
            return (
              <tr key={o.id} className="hover:bg-earth-50/50 dark:hover:bg-earth-900/10">
                <td className="px-6 py-4 font-mono font-bold text-foreground">{o.id}</td>
                <td className="px-6 py-4 font-bold text-foreground">{o.productName}</td>
                <td className="px-6 py-4 font-medium">
                  {activeRole === 'farmer' ? o.buyerName : (relativeProduct?.farmerName || 'Basavaraj Gowda')}
                </td>
                <td className="px-6 py-4 font-semibold text-foreground">{o.quantity} {t('kg_unit')}</td>
                <td className="px-6 py-4 font-black text-primary-600 dark:text-primary-400">
                  ₹{o.totalPrice.toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-6 py-4 font-mono text-[10px] text-earth-400">
                  {timeStr}
                </td>
              </tr>
            );
          })}
        </TableComponent>
      )}
    </div>
  );
}
