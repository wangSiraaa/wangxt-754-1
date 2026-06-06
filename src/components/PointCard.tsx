import { useNavigate } from 'react-router-dom';
import { AlertTriangle, PackageX, Clock, Lock } from 'lucide-react';
import type { ToiletPoint } from '@/types';
import { ODOR_LABELS, CLEAN_LABELS, calculateLegendStatus, calculatePriorityScore } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { LegendBadge, PriorityPin } from '@/components/StatusLegend';

interface PointCardProps {
  point: ToiletPoint;
}

export default function PointCard({ point }: PointCardProps) {
  const navigate = useNavigate();
  const { currentUser, requestSupply } = useAppStore();
  const isAnomaly = point.odorLevel >= 4;
  const isWarning = point.odorLevel === 3;
  const isSupplyLow = point.supplies.toiletPaper < 15 || point.supplies.handSanitizer < 15 || point.supplies.tissue < 15;
  const isCitizen = currentUser.role === 'citizen';

  const odorColor = point.odorLevel >= 4 ? 'text-red-600' : point.odorLevel === 3 ? 'text-amber-600' : point.odorLevel >= 2 ? 'text-emerald-600' : 'text-teal-600';

  const borderClass = !point.isOpen
    ? 'border-gray-300 opacity-60'
    : isAnomaly
    ? 'border-red-400 ring-2 ring-red-200'
    : isWarning
    ? 'border-amber-300'
    : 'border-slate-200';

  const handleClick = () => {
    if (isCitizen) return;
    navigate(`/inspect/${point.id}`);
  };

  return (
    <div
      className={`relative bg-white rounded-xl border-2 ${borderClass} p-4 transition-all duration-300 ${
        !isCitizen ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'
      } ${
        isAnomaly && point.isOpen ? 'animate-pulse-subtle' : ''
      }`}
      onClick={handleClick}
    >
      {!point.isOpen && (
        <div className="absolute inset-0 bg-gray-100/60 rounded-xl flex items-center justify-center z-10">
          <div className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <Lock size={16} />
            点位已关闭，禁止巡检
          </div>
        </div>
      )}

      {isAnomaly && point.isOpen && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 z-20">
          <AlertTriangle size={12} />
          异常
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">{point.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{point.address}</p>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            point.isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {point.isOpen ? '开放' : '关闭'}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500">异味</span>
          <span className={`text-xs font-bold ${odorColor}`}>
            {'★'.repeat(point.odorLevel)}
            {'☆'.repeat(5 - point.odorLevel)}
          </span>
          <span className={`text-xs ${odorColor}`}>{ODOR_LABELS[point.odorLevel]}</span>
        </div>
        <span
          className={`text-xs px-1.5 py-0.5 rounded ${
            point.cleanStatus === 'clean'
              ? 'bg-emerald-50 text-emerald-700'
              : point.cleanStatus === 'normal'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {CLEAN_LABELS[point.cleanStatus]}
        </span>
        <LegendBadge
          status={point.legendStatus ?? calculateLegendStatus(point.odorLevel, point.cleanStatus)}
          size="sm"
        />
        <PriorityPin
          priorityScore={point.priorityScore ?? calculatePriorityScore(point.odorLevel, point.cleanStatus, point.isOpen)}
          odorLevel={point.odorLevel}
        />
      </div>

      {isSupplyLow && point.isOpen && !isCitizen && (
        <div className="flex items-center gap-2 mt-2">
          <PackageX size={14} className="text-amber-500" />
          <span className="text-xs text-amber-600">耗材不足</span>
          {!point.supplyRequested ? (
            <button
              className="ml-auto text-xs bg-amber-500 text-white px-2.5 py-1 rounded-full hover:bg-amber-600 transition-colors animate-pulse flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                requestSupply(point.id);
              }}
            >
              <PackageX size={12} />
              补给
            </button>
          ) : (
            <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
              已请求补给
            </span>
          )}
        </div>
      )}

      {!isCitizen && point.lastInspection && (
        <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
          <Clock size={12} />
          <span>最近巡检: {point.lastInspection}</span>
        </div>
      )}

      <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
        {!isCitizen && <span>保洁: {point.cleanerName}</span>}
        {!isCitizen && (
          <span className="text-slate-300 mx-1">·</span>
        )}
        {!isCitizen && (
          <span>片区: {point.district}</span>
        )}
        {isCitizen && <span>{point.district}</span>}
      </div>
    </div>
  );
}
