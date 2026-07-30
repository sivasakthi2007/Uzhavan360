
import { useApp } from '@/context/AppContext';
import JobCard from '@/components/JobCard';

export default function LaborJobsPage() {
  const { activeRole, laborJobs, applyForLaborJob, hireLaborWorker, t } = useApp();

  const isLabor = activeRole === 'labor';
  const isFarmer = activeRole === 'farmer';

  const openJobs = laborJobs.filter((j) => j.status === 'open');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">{t('labor_registry_title')}</h2>
        <p className="text-xs text-earth-400 mt-1">
          {t('labor_registry_desc')}
        </p>
      </div>

      {/* Applied Jobs board for Labor Worker */}
      {isLabor && (
        <div className="space-y-4">
          <div className="border-b border-earth-100 dark:border-earth-900/40 pb-2">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              {t('labor_app_status')}
            </h3>
          </div>
          {laborJobs.filter(j => j.status !== 'open').length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-earth-200 dark:border-earth-800 text-center text-xs text-earth-400 bg-white dark:bg-[#141816]">
              {t('no_active_applications')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {laborJobs.filter(j => j.status !== 'open').map((job) => (
                <JobCard
                  key={job.id}
                  type="labor"
                  job={job}
                  isActionDisabled={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Job Board */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-earth-100 dark:border-earth-900/40 pb-2">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            {t('available_job_postings')} ({openJobs.length})
          </h3>
          <span className="text-[10px] text-earth-400 font-mono">
            {isLabor ? t('jobs_matching_skills') : t('laborer_mode_required')}
          </span>
        </div>

        {openJobs.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-earth-200 dark:border-earth-800 text-center text-xs text-earth-400 bg-white dark:bg-[#141816]">
            {t('no_labor_listed')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {openJobs.map((job) => (
              <JobCard
                key={job.id}
                type="labor"
                job={job}
                actionText={isLabor ? t('apply_position_cta') : undefined}
                onActionClick={isLabor ? () => applyForLaborJob(job.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recruiter / Farmer View details */}
      {isFarmer && laborJobs.length > 0 && (
        <div className="space-y-4">
          <div className="border-b border-earth-100 dark:border-earth-900/40 pb-2">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              {t('manage_job_postings')} ({laborJobs.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {laborJobs.map((job) => {
              const needsHiring = job.status === 'applied';
              return (
                <JobCard
                  key={job.id}
                  type="labor"
                  job={job}
                  actionText={needsHiring ? t('approve_hire_cta') : undefined}
                  onActionClick={needsHiring ? () => hireLaborWorker(job.id) : undefined}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
