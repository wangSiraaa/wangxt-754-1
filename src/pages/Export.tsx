import { useState } from 'react';
import { Download, FileText, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import FilterBar from '@/components/FilterBar';
import StatusLegend, { LegendBadge } from '@/components/StatusLegend';
import { ODOR_LABELS, CLEAN_LABELS, LEGEND_LABELS, calculateLegendStatus } from '@/types';
import { DISTRICTS } from '@/data/mock';

export default function Export() {
  const { getFilteredPoints, inspections, currentUser } = useAppStore();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exported, setExported] = useState(false);

  const points = getFilteredPoints();
  const isCitizen = currentUser.role === 'citizen';

  const getFilteredInspections = () => {
    let result = [...inspections];
    if (dateFrom) {
      result = result.filter((i) => i.inspectTime >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((i) => i.inspectTime <= dateTo + ' 23:59');
    }
    const pointIds = new Set(points.map((p) => p.id));
    result = result.filter((i) => pointIds.has(i.pointId));
    return result;
  };

  const exportCSV = () => {
    const data = getFilteredInspections();
    const headers = ['巡检时间', '点位名称', '巡检员', '异味等级', '清洁状态', '状态图例', '优先级分', '需要补给', '备注'];
    const rows = data.map((i) => {
      const legendStatus = i.legendStatus ?? calculateLegendStatus(i.odorLevel, i.cleanStatus);
      return [
        i.inspectTime,
        i.pointName,
        i.inspectorName,
        ODOR_LABELS[i.odorLevel],
        CLEAN_LABELS[i.cleanStatus],
        LEGEND_LABELS[legendStatus],
        String(i.priorityScore ?? 0),
        i.supplyNeeded ? '是' : '否',
        `"${i.remark.replace(/"/g, '""')}"`,
      ];
    });

    const BOM = '\uFEFF';
    const csv = BOM + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `巡检数据_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const filteredInspections = getFilteredInspections();

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h1 className="text-xl font-bold text-slate-800">数据导出</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {isCitizen ? '您没有导出权限' : '按条件筛选并导出巡检数据'}
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">导出配置</h3>

            <FilterBar />

            <div className="mt-4 flex items-end gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">开始日期</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">结束日期</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">数据预览</h3>
              <span className="text-xs text-slate-400">共 {filteredInspections.length} 条记录</span>
            </div>

            {filteredInspections.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <FileText size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">暂无匹配数据</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="mb-4">
                  <StatusLegend compact />
                </div>
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">巡检时间</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">点位</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">巡检员</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">状态图例</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">异味</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">状态</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-slate-500">补给</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInspections.slice(0, 20).map((insp) => (
                      <tr key={insp.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 px-3 text-xs text-slate-600">{insp.inspectTime}</td>
                        <td className="py-2 px-3 text-xs text-slate-700">{insp.pointName}</td>
                        <td className="py-2 px-3 text-xs text-slate-600">{insp.inspectorName}</td>
                        <td className="py-2 px-3">
                          <LegendBadge
                            status={insp.legendStatus ?? calculateLegendStatus(insp.odorLevel, insp.cleanStatus)}
                            size="sm"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <span className={`text-xs ${
                            insp.odorLevel >= 4 ? 'text-red-600 font-medium' : 'text-slate-600'
                          }`}>
                            {ODOR_LABELS[insp.odorLevel]}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            insp.cleanStatus === 'clean' ? 'bg-emerald-50 text-emerald-600' :
                            insp.cleanStatus === 'normal' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {CLEAN_LABELS[insp.cleanStatus]}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs text-slate-600">{insp.supplyNeeded ? '是' : '否'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                {filteredInspections.length > 20 && (
                  <p className="text-xs text-slate-400 text-center mt-3">
                    仅显示前 20 条，导出后将包含全部 {filteredInspections.length} 条
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-slate-50/90 backdrop-blur-sm py-4 -mx-6 px-6 border-t border-slate-200">
            {isCitizen ? (
              <div className="w-full py-3 rounded-xl text-sm font-semibold text-center bg-gray-100 text-gray-400">
                市民监督员无导出权限
              </div>
            ) : exported ? (
              <div className="w-full py-3 rounded-xl text-sm font-semibold text-center bg-emerald-50 text-emerald-600 flex items-center justify-center gap-2">
                <CheckCircle size={16} />
                导出成功
              </div>
            ) : (
              <button
                onClick={exportCSV}
                disabled={filteredInspections.length === 0}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  filteredInspections.length > 0
                    ? 'bg-teal-700 text-white hover:bg-teal-800 shadow-lg shadow-teal-200 active:scale-[0.98]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Download size={16} />
                导出 CSV ({filteredInspections.length} 条)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
