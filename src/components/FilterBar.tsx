import { Search, X, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { DISTRICTS } from '@/data/mock';
import { CLEAN_LABELS } from '@/types';
import type { CleanStatus } from '@/types';

const ODOR_OPTIONS = ['全部', '1', '2', '3', '4', '5'];
const ODOR_DISPLAY: Record<string, string> = {
  '全部': '全部异味',
  '1': '1-无异味',
  '2': '2-轻微',
  '3': '3-一般',
  '4': '4-较重',
  '5': '5-严重',
};
const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '全部', label: '全部状态' },
  ...Object.entries(CLEAN_LABELS).map(([k, v]) => ({ value: k, label: v })),
];
const OPEN_OPTIONS = ['全部', '开放', '关闭'];

export default function FilterBar() {
  const { filters, setFilters, resetFilters } = useAppStore();

  const hasFilters =
    filters.district !== '全部' ||
    filters.odorLevel !== '全部' ||
    filters.cleanStatus !== '全部' ||
    filters.isOpen !== '全部' ||
    filters.keyword !== '';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">筛选条件</h3>
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 transition-colors"
          >
            <RotateCcw size={12} />
            重置
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500">片区</label>
          <select
            value={filters.district}
            onChange={(e) => setFilters({ district: e.target.value })}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          >
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d === '全部' ? '全部片区' : d}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500">异味等级</label>
          <select
            value={filters.odorLevel}
            onChange={(e) => setFilters({ odorLevel: e.target.value })}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          >
            {ODOR_OPTIONS.map((o) => (
              <option key={o} value={o}>{ODOR_DISPLAY[o]}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500">清洁状态</label>
          <select
            value={filters.cleanStatus}
            onChange={(e) => setFilters({ cleanStatus: e.target.value as CleanStatus | '全部' })}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500">开放状态</label>
          <select
            value={filters.isOpen}
            onChange={(e) => setFilters({ isOpen: e.target.value })}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          >
            {OPEN_OPTIONS.map((o) => (
              <option key={o} value={o}>{o === '全部' ? '全部' : o}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs text-slate-500">搜索</label>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => setFilters({ keyword: e.target.value })}
              placeholder="搜索点位名称或地址..."
              className="w-full text-xs border border-slate-200 rounded-lg pl-8 pr-8 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
            {filters.keyword && (
              <button
                onClick={() => setFilters({ keyword: '' })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
