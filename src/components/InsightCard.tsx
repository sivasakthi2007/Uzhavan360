'use client';

import { MarketInsight } from '@/context/AppContext';
import { TrendingUp, TrendingDown, ArrowRight, Info } from 'lucide-react';

interface InsightCardProps {
  insight: MarketInsight;
  onActionClick?: () => void;
  actionLabel?: string;
}

export default function InsightCard({ insight, onActionClick, actionLabel }: InsightCardProps) {
  const isUp = insight.trend === 'UP';
  const isDown = insight.trend === 'DOWN';

  return (
    <div className="rounded-2xl border border-[#e6eae7] dark:border-primary-950/20 bg-white dark:bg-[#111714] p-5 shadow-sm hover-card flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-foreground">{insight.crop}</span>
            <span className="text-[10px] font-medium text-earth-400">({insight.region})</span>
          </div>

          {/* Trend Badge */}
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            isUp ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400' :
            isDown ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400' :
            'bg-stone-50 dark:bg-[#232a26] text-stone-700 dark:text-stone-300'
          }`}>
            {isUp && <TrendingUp className="w-3 h-3 text-emerald-500" />}
            {isDown && <TrendingDown className="w-3 h-3 text-red-500" />}
            <span>
              {isUp ? `+${insight.priceChangePercent}%` : isDown ? `${insight.priceChangePercent}%` : 'Stable'}
            </span>
          </span>
        </div>

        {/* Pricing Statistics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4 bg-earth-50/50 dark:bg-earth-950/20 p-3 rounded-xl border border-earth-100 dark:border-earth-900/40">
          <div>
            <span className="text-[9px] text-earth-400 uppercase font-mono tracking-wider block">Gov Market Rate</span>
            <span className="text-sm font-bold text-foreground">₹{insight.govPrice} <span className="text-[10px] font-normal text-earth-400">/ kg</span></span>
          </div>
          <div>
            <span className="text-[9px] text-earth-400 uppercase font-mono tracking-wider block">Local Demand</span>
            <span className={`text-xs font-black uppercase tracking-widest ${
              insight.demand === 'HIGH' ? 'text-primary-600 dark:text-primary-400' :
              insight.demand === 'MEDIUM' ? 'text-blue-500' :
              'text-earth-400'
            }`}>
              {insight.demand}
            </span>
          </div>
        </div>

        {/* Recommendation text */}
        <div className="flex gap-2 text-xs leading-relaxed text-earth-500 dark:text-earth-400 bg-emerald-50/20 dark:bg-emerald-950/10 p-3 rounded-xl border border-primary-500/10">
          <Info className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
          <p className="font-medium">{insight.recommendation}</p>
        </div>
      </div>

      {/* Action Footer */}
      {onActionClick && actionLabel && (
        <div className="mt-5 border-t border-earth-100 dark:border-earth-900/40 pt-4">
          <button
            onClick={onActionClick}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 hover:bg-primary-500 hover:text-white transition-all duration-200 cursor-pointer shadow-sm border-0"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
