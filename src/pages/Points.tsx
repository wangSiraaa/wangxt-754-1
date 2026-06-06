import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Clock, MapPin, PackageX, Lock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import FilterBar from '@/components/FilterBar';
import StatusLegend, { LegendBadge, PriorityPin } from '@/components/StatusLegend';
import { ODOR_LABELS, CLEAN_LABELS, calculateLegendStatus, calculatePriorityScore } from '@/types';

export default function Points() {
  const { getFilteredPoints, getInspectionsByPointId, currentUser, requestSupply } = useAppStore();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const points = getFilteredPoints();
  const selectedPoint = selectedId ? points.find((p) => p.id === selectedId) : null;
  const inspections = selectedId ? getInspectionsByPointId(selectedId) : [];
  const isCitizen = currentUser.role === 'citizen';

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h1 className="text-xl font-bold text-slate-800">点位管理</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {isCitizen ? '公示信息查看模式' : '查看和管理所有巡检点位'}
        </p>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className="w-2/5 border-r border-slate-200 overflow-auto p-4">
          <div className="mb-4">
            <StatusLegend showTitle={false} />
          </div>
          <FilterBar />
          <div className="space-y-2">
            {points.map((point) => {
              const isAnomaly = point.odorLevel >= 4;
              const isSupplyLow = point.supplies.toiletPaper < 15 || point.supplies.handSanitizer < 15 || point.supplies.tissue < 15;

              return (
                <div
                  key={point.id}
                  onClick={() => setSelectedId(point.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border-2 ${
                    selectedId === point.id
                      ? 'border-teal-500 bg-teal-50'
                      : !point.isOpen
                      ? 'border-gray-200 bg-gray-50/50 opacity-60'
                      : isAnomaly
                      ? 'border-red-200 bg-red-50/30 hover:border-red-300'
                      : 'border-slate-200 bg-white hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-slate-800">{point.name}</h3>
                        {!point.isOpen && (
                          <span className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Lock size={10} />
                            关闭
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs ${
                          point.odorLevel >= 4 ? 'text-red-600 font-bold' : point.odorLevel === 3 ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          异味: {ODOR_LABELS[point.odorLevel]}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          point.cleanStatus === 'clean' ? 'bg-emerald-50 text-emerald-600' :
                          point.cleanStatus === 'normal' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                        }`}>
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
                        {!isCitizen && isSupplyLow && point.isOpen && (
                          <span className="text-xs text-amber-600 flex items-center gap-0.5">
                            <PackageX size={10} />
                            缺耗材
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{point.district} · {point.address}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {selectedPoint ? (
            <div className="space-y-5">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{selectedPoint.name}</h2>
                    <div className="flex items-center gap-1 mt-1 text-sm text-slate-500">
                      <MapPin size={14} />
                      {selectedPoint.address}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      selectedPoint.isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {selectedPoint.isOpen ? '开放' : '关闭'}
                    </span>
                    {!isCitizen && selectedPoint.isOpen && (
                      <button
                        onClick={() => navigate(`/inspect/${selectedPoint.id}`)}
                        className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        开始巡检
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className={`text-2xl font-bold ${
                      selectedPoint.odorLevel >= 4 ? 'text-red-500' : selectedPoint.odorLevel === 3 ? 'text-amber-500' : 'text-teal-600'
                    }`}>
                      {selectedPoint.odorLevel}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">异味等级</div>
                    <div className="text-xs text-slate-400">{ODOR_LABELS[selectedPoint.odorLevel]}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className={`text-2xl font-bold ${
                      selectedPoint.cleanStatus === 'clean' ? 'text-emerald-500' : selectedPoint.cleanStatus === 'normal' ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {CLEAN_LABELS[selectedPoint.cleanStatus]}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">清洁状态</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-slate-700">{selectedPoint.district}</div>
                    <div className="text-xs text-slate-500 mt-1">所属片区</div>
                    {!isCitizen && (
                      <div className="text-xs text-slate-400">保洁: {selectedPoint.cleanerName}</div>
                    )}
                  </div>
                </div>
              </div>

              {!isCitizen && (
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">耗材库存</h3>
                  <div className="space-y-3">
                    {[
                      { label: '厕纸', value: selectedPoint.supplies.toiletPaper },
                      { label: '洗手液', value: selectedPoint.supplies.handSanitizer },
                      { label: '纸巾', value: selectedPoint.supplies.tissue },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className="text-sm text-slate-600 w-16">{label}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              value < 15 ? 'bg-red-500' : value < 40 ? 'bg-amber-400' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${value < 15 ? 'text-red-500' : 'text-slate-500'}`}>
                          {value}%
                        </span>
                      </div>
                    ))}
                  </div>
                  {(selectedPoint.supplies.toiletPaper < 15 || selectedPoint.supplies.handSanitizer < 15 || selectedPoint.supplies.tissue < 15) && selectedPoint.isOpen && (
                    <div className="mt-4">
                      {!selectedPoint.supplyRequested ? (
                        <button
                          onClick={() => requestSupply(selectedPoint.id)}
                          className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors flex items-center gap-2"
                        >
                          <PackageX size={16} />
                          请求补给
                        </button>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2">
                          <PackageX size={16} />
                          已请求补给
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">历史巡检记录</h3>
                {inspections.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">暂无巡检记录</p>
                ) : (
                  <div className="space-y-2">
                    {inspections.map((insp) => (
                      <div key={insp.id} className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Clock size={14} className="text-slate-400" />
                            <span className="text-xs text-slate-500">{insp.inspectTime}</span>
                            <LegendBadge
                              status={insp.legendStatus ?? calculateLegendStatus(insp.odorLevel, insp.cleanStatus)}
                              size="sm"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              insp.odorLevel >= 4 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                            }`}>
                              异味: {ODOR_LABELS[insp.odorLevel]}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              insp.cleanStatus === 'clean' ? 'bg-emerald-50 text-emerald-600' :
                              insp.cleanStatus === 'normal' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                            }`}>
                              {CLEAN_LABELS[insp.cleanStatus]}
                            </span>
                          </div>
                        </div>
                        {!isCitizen && (
                          <>
                            <p className="text-xs text-slate-600 mt-1.5">{insp.remark}</p>
                            <p className="text-xs text-slate-400 mt-1">巡检员: {insp.inspectorName}</p>
                            {insp.priorityScore !== undefined && insp.priorityScore > 0 && (
                              <p className="text-xs text-slate-400">优先级分: {insp.priorityScore}</p>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <MapPin size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">请从左侧选择一个点位查看详情</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
