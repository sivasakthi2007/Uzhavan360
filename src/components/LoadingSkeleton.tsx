'use client';

interface LoadingSkeletonProps {
  type: 'card' | 'list' | 'detail';
  count?: number;
}

export default function LoadingSkeleton({ type, count = 3 }: LoadingSkeletonProps) {
  const renderCards = () => {
    return Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="rounded-3xl border border-earth-200 dark:border-primary-950/20 bg-white dark:bg-[#111714] p-5 space-y-4 shadow-sm animate-pulse"
      >
        <div className="h-40 bg-earth-100 dark:bg-earth-900 rounded-2xl w-full" />
        <div className="space-y-2">
          <div className="h-4 bg-earth-200 dark:bg-earth-850 rounded-md w-3/4" />
          <div className="h-3 bg-earth-100 dark:bg-earth-900 rounded-md w-1/2" />
        </div>
        <div className="border-t border-earth-100 dark:border-earth-900/40 pt-4 flex items-center justify-between">
          <div className="h-5 bg-earth-200 dark:bg-earth-850 rounded-md w-1/4" />
          <div className="h-8 bg-earth-200 dark:bg-earth-850 rounded-xl w-1/3" />
        </div>
      </div>
    ));
  };

  const renderList = () => {
    return (
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-earth-150 dark:border-earth-900/30 bg-white dark:bg-[#111714] flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-earth-100 dark:bg-earth-900 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3.5 bg-earth-200 dark:bg-earth-850 rounded-md w-1/3" />
                <div className="h-2.5 bg-earth-100 dark:bg-earth-900 rounded-md w-1/4" />
              </div>
            </div>
            <div className="h-6 bg-earth-200 dark:bg-earth-850 rounded-full w-16" />
          </div>
        ))}
      </div>
    );
  };

  const renderDetail = () => {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-64 bg-earth-100 dark:bg-earth-900 rounded-3xl w-full" />
        <div className="space-y-3">
          <div className="h-6 bg-earth-200 dark:bg-earth-850 rounded-md w-1/2" />
          <div className="h-4 bg-earth-100 dark:bg-earth-900 rounded-md w-1/3" />
        </div>
        <hr className="border-earth-200 dark:border-primary-950/20" />
        <div className="space-y-2">
          <div className="h-3 bg-earth-100 dark:bg-earth-900 rounded-md w-full" />
          <div className="h-3 bg-earth-100 dark:bg-earth-900 rounded-md w-full" />
          <div className="h-3 bg-earth-100 dark:bg-earth-900 rounded-md w-3/4" />
        </div>
      </div>
    );
  };

  return (
    <div className={type === 'card' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'w-full'}>
      {type === 'card' && renderCards()}
      {type === 'list' && renderList()}
      {type === 'detail' && renderDetail()}
    </div>
  );
}
