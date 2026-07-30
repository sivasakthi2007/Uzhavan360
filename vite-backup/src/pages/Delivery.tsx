
import { useApp } from '@/context/AppContext';
import JobCard from '@/components/JobCard';
import { Truck, Map } from 'lucide-react';

export default function DeliveryJobsPage() {
  const { activeRole, deliveryJobs, acceptDeliveryJob, completeDelivery, userName, t } = useApp();

  const isDriver = activeRole === 'delivery';

  const availableJobs = deliveryJobs.filter((j) => j.status === 'available');
  
  // Jobs accepted by the logged-in driver Suresh Kumar
  const driverActiveJobs = deliveryJobs.filter(
    (j) => j.driverId === 'driver_1' && j.status !== 'delivered'
  );
  
  const completedJobs = deliveryJobs.filter(
    (j) => j.driverId === 'driver_1' && j.status === 'delivered'
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">{t('delivery_title')}</h2>
        <p className="text-xs text-earth-400 mt-1">
          {t('delivery_board_desc')}
        </p>
      </div>

      {/* Driver active assignments */}
      {isDriver && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-earth-100 dark:border-earth-900/40 pb-2">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              {t('current_dispatches')} ({driverActiveJobs.length})
            </h3>
            <span className="text-[10px] text-primary-600 dark:text-primary-400 font-bold uppercase tracking-wider bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded">
              {t('active_transit')}
            </span>
          </div>

          {driverActiveJobs.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-earth-200 dark:border-earth-800 text-center text-xs text-earth-400 bg-white dark:bg-[#141816]">
              {t('no_active_routes')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {driverActiveJobs.map((job) => (
                <div key={job.id} className="space-y-4">
                  <JobCard
                    type="delivery"
                    job={job}
                    actionText={t('confirm_delivery_cta')}
                    onActionClick={() => completeDelivery(job.id)}
                  />

                  {/* Route Map Simulation */}
                  <div className="p-4 rounded-2xl border border-[#e6eae7] dark:border-[#232a26] bg-white dark:bg-[#141816] shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-earth-400 flex items-center gap-1">
                        <Map className="w-3.5 h-3.5" />
                        {t('simulated_live_transit')}
                      </span>
                      <span className="text-[9px] font-mono text-primary-600 dark:text-primary-400 font-semibold animate-pulse">
                        ● {t('gps_tracking_live')}
                      </span>
                    </div>
                    {/* SVG map representation */}
                    <div className="h-28 bg-earth-50 dark:bg-earth-950/60 rounded-xl relative overflow-hidden border border-earth-100 dark:border-earth-900/20 flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full text-earth-200 dark:text-earth-800" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 20 60 Q 150 10 280 80 T 400 30" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                        <path d="M 20 60 Q 150 10 280 80" fill="none" stroke="var(--color-primary-500)" strokeWidth="3" />
                      </svg>
                      
                      <div className="absolute left-[15px] top-[48px] p-1 bg-white dark:bg-[#141816] rounded-full border border-primary-500/20 text-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                      </div>
                      <span className="absolute left-[30px] top-[30px] text-[8px] font-mono font-bold bg-white/90 dark:bg-black/90 px-1 py-0.2 rounded border shadow-sm">{t('pickup_hub')}</span>

                      {/* Moving Truck */}
                      <div className="absolute left-[135px] top-[25px] p-1.5 bg-primary-500 text-white rounded-full shadow-md animate-pulse">
                        <Truck className="w-3.5 h-3.5" />
                      </div>

                      <div className="absolute left-[265px] top-[68px] p-1 bg-white dark:bg-[#141816] rounded-full border border-primary-500/20 text-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block" />
                      </div>
                      <span className="absolute left-[280px] top-[75px] text-[8px] font-mono font-bold bg-white/90 dark:bg-black/90 px-1 py-0.2 rounded border shadow-sm">{t('dropoff_dest')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Available Jobs list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-earth-100 dark:border-earth-900/40 pb-2">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            {t('available_dispatch_routes')} ({availableJobs.length})
          </h3>
          <span className="text-[10px] text-earth-400 font-mono">
            {isDriver ? t('select_routes_matching') : t('driver_mode_required')}
          </span>
        </div>

        {availableJobs.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-earth-200 dark:border-earth-800 text-center text-xs text-earth-400 bg-white dark:bg-[#141816]">
            {t('no_avail_routes')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableJobs.map((job) => (
              <JobCard
                key={job.id}
                type="delivery"
                job={job}
                actionText={isDriver ? t('accept_route_cta') : undefined}
                onActionClick={isDriver ? () => acceptDeliveryJob(job.id, userName) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed jobs history */}
      {isDriver && completedJobs.length > 0 && (
        <div className="space-y-4">
          <div className="border-b border-earth-100 dark:border-earth-900/40 pb-2">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              {t('completed_history')} ({completedJobs.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedJobs.map((job) => (
              <JobCard
                key={job.id}
                type="delivery"
                job={job}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
