import React from 'react';

interface TableComponentProps {
  title?: string;
  description?: string;
  headers: string[];
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function TableComponent({
  title,
  description,
  headers,
  children,
  actions
}: TableComponentProps) {
  return (
    <div className="rounded-2xl border border-[#e6eae7] dark:border-primary-950/20 bg-white dark:bg-[#111714] overflow-hidden shadow-sm">
      {/* Table Header */}
      {(title || description || actions) && (
        <div className="p-5 border-b border-earth-100 dark:border-earth-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#111714]">
          <div>
            {title && <h4 className="text-base font-bold text-foreground tracking-tight">{title}</h4>}
            {description && <p className="text-xs text-earth-400 mt-1">{description}</p>}
          </div>
          {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-earth-100 dark:border-earth-900/40 bg-earth-50/50 dark:bg-earth-950/20">
              {headers.map((h, idx) => (
                <th
                  key={idx}
                  className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-earth-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-100 dark:divide-earth-900/40 text-xs">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}
