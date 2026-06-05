import { useState, useCallback } from 'react';
import { Map, List, AlertTriangle, PackageX, ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';
import MapView from '@/components/MapView';
import PointCard from '@/components/PointCard';
import FilterBar from '@/components/FilterBar';
import type { ToiletPoint } from '@/types';

export default function Home() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const { currentUser, getFilteredPoints } = useAppStore();
  const navigate = useNavigate();

  const points = getFilteredPoints();
  const anomalyCount = points.filter((p) => p.odorLevel >= 4 && p.isOpen).length;
  const supplyLowCount = points.filter(
    (p) => (p.supplies.toiletPaper < 15 || p.supplies.handSanitizer < 15 || p.supplies.tissue < 15) && p.isOpen
  ).length;
  const closedCount = points.filter((p) => !p.isOpen).length;

  const isCitizen = currentUser.role === 'citizen';

  const handlePointClick = useCallback(
    (point: ToiletPoint) => {
      if (isCitizen) return;
      navigate(`/inspect/${point.id}`);
    },
    [navigate, isCitizen]
  );

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">巡检总览</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {isCitizen ? '公示信息查看' : `${currentUser.district}片区 · ${currentUser.name}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-xs font-medium">
              <AlertTriangle size={14} />
              {anomalyCount} 异常
            </div>
            <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full text-xs font-medium">
              <PackageX size={14} />
              {supplyLowCount} 待补给
            </div>
            <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs font-medium">
              <ShieldCheck size={14} />
              {closedCount} 已关闭
            </div>
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'map' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Map size={14} />
                地图
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'list' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <List size={14} />
                列表
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <FilterBar />

        {viewMode === 'map' ? (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 240px)' }}>
            <MapView points={points} onPointClick={handlePointClick} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {points.map((point) => (
              <PointCard key={point.id} point={point} />
            ))}
            {points.length === 0 && (
              <div className="col-span-full text-center py-16 text-slate-400">
                <Map size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">暂无符合条件的点位</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
