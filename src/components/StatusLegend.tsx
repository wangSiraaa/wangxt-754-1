import { useState } from 'react';
import { Info, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { STATUS_LEGEND_ITEMS, LEGEND_LABELS, LEGEND_COLORS } from '@/types';
import type { LegendStatus, StatusLegendItem } from '@/types';

interface StatusLegendProps {
  showTitle?: boolean;
  compact?: boolean;
}

export default function StatusLegend({ showTitle = true, compact = false }: StatusLegendProps) {
  const [expanded, setExpanded] = useState(true);

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_LEGEND_ITEMS.map((item) => (
          <div key={item.key} className="flex items-center gap-1.5" title={item.description}>
            <div
              className="w-3 h-3 rounded-full border-2"
              style={{
                backgroundColor: item.bgColor,
                borderColor: item.color,
              }}
            />
            <span className="text-xs text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Info size={16} className="text-teal-600" />
          {showTitle && <span className="text-sm font-semibold text-slate-700">状态图例</span>}
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-slate-400" />
        ) : (
          <ChevronDown size={16} className="text-slate-400" />
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {STATUS_LEGEND_ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                style={{
                  backgroundColor: item.bgColor,
                  borderColor: item.color,
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </div>
                <p className="text-xs text-slate-400 truncate">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface LegendBadgeProps {
  status: LegendStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function LegendBadge({ status, showLabel = true, size = 'sm' }: LegendBadgeProps) {
  const colors = LEGEND_COLORS[status];
  const label = LEGEND_LABELS[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses}`}
      style={{
        backgroundColor: colors.bgColor,
        color: colors.color,
        border: `1px solid ${colors.borderColor}`,
      }}
    >
      <span
        className="rounded-full"
        style={{
          width: size === 'sm' ? '6px' : '8px',
          height: size === 'sm' ? '6px' : '8px',
          backgroundColor: colors.color,
        }}
      />
      {showLabel && label}
    </span>
  );
}

interface PriorityPinProps {
  priorityScore: number;
  odorLevel: number;
}

export function PriorityPin({ priorityScore, odorLevel }: PriorityPinProps) {
  const isHighPriority = priorityScore >= 50 || odorLevel >= 4;

  if (!isHighPriority) return null;

  return (
    <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-medium animate-pulse">
      <AlertCircle size={12} />
      置顶
    </span>
  );
}
