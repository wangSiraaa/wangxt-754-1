import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, AlertTriangle, PackageX, CheckCircle, ArrowLeft, Send } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { OdorLevel, CleanStatus, InspectionRecord } from '@/types';
import { ODOR_LABELS, CLEAN_LABELS } from '@/types';

export default function Inspection() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPointById, currentUser, addInspection, requestSupply } = useAppStore();

  const point = id ? getPointById(id) : undefined;

  const [odorLevel, setOdorLevel] = useState<OdorLevel>(1);
  const [cleanStatus, setCleanStatus] = useState<CleanStatus>('clean');
  const [supplyNeeded, setSupplyNeeded] = useState(false);
  const [remark, setRemark] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showCloseAlert, setShowCloseAlert] = useState(false);

  useEffect(() => {
    if (point && !point.isOpen) {
      setShowCloseAlert(true);
    }
  }, [point]);

  if (!point) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-slate-500">点位不存在</p>
          <button onClick={() => navigate('/')} className="mt-4 text-teal-600 text-sm hover:underline">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const isSupplyLow = point.supplies.toiletPaper < 15 || point.supplies.handSanitizer < 15 || point.supplies.tissue < 15;
  const handleSubmit = () => {
    if (!point.isOpen) return;

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const record: InspectionRecord = {
      id: `i${Date.now()}`,
      pointId: point.id,
      pointName: point.name,
      inspectorId: currentUser.id,
      inspectorName: currentUser.name,
      inspectTime: timeStr,
      odorLevel,
      cleanStatus,
      supplyNeeded,
      remark,
    };

    addInspection(record);
    if (supplyNeeded) {
      requestSupply(point.id);
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <CheckCircle size={64} className="mx-auto text-emerald-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800">巡检提交成功</h2>
          <p className="text-sm text-slate-500 mt-2">{point.name} · {ODOR_LABELS[odorLevel]}</p>
          {(odorLevel >= 4 || cleanStatus === 'dirty') && (
            <div className="mt-3 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2">
              <AlertTriangle size={16} />
              已标记为异常，将通知片区主管
            </div>
          )}
          <button
            onClick={() => navigate('/')}
            className="mt-6 bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-teal-800 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">巡检录入</h1>
            <p className="text-sm text-slate-500 mt-0.5">{point.name} · {point.address}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {!point.isOpen && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-6 flex items-start gap-4">
            <div className="bg-red-100 p-3 rounded-full">
              <Lock size={24} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-red-700 text-lg">该点位已关闭</h3>
              <p className="text-sm text-red-600 mt-1">关闭的点位禁止提交巡检记录。如需重新开放，请联系片区主管。</p>
            </div>
          </div>
        )}

        <div className="max-w-2xl space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">点位信息</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-400">片区：</span><span className="text-slate-700">{point.district}</span></div>
              <div><span className="text-slate-400">状态：</span><span className={point.isOpen ? 'text-emerald-600' : 'text-red-600'}>{point.isOpen ? '开放' : '关闭'}</span></div>
              <div><span className="text-slate-400">保洁员：</span><span className="text-slate-700">{point.cleanerName}</span></div>
              <div><span className="text-slate-400">上次巡检：</span><span className="text-slate-700">{point.lastInspection || '暂无'}</span></div>
            </div>
          </div>

          <div className={`bg-white border rounded-xl p-5 ${point.isOpen ? 'border-slate-200' : 'border-slate-100 opacity-50 pointer-events-none'}`}>
            <h3 className="text-sm font-semibold text-slate-700 mb-4">异味等级</h3>
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as OdorLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setOdorLevel(level)}
                  className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                    odorLevel === level
                      ? level >= 4
                        ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                        : level === 3
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                        : 'bg-teal-600 text-white shadow-lg shadow-teal-200'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-lg">{'★'.repeat(level)}</div>
                  <div className="text-xs mt-1">{ODOR_LABELS[level]}</div>
                </button>
              ))}
            </div>
          </div>

          <div className={`bg-white border rounded-xl p-5 ${point.isOpen ? 'border-slate-200' : 'border-slate-100 opacity-50 pointer-events-none'}`}>
            <h3 className="text-sm font-semibold text-slate-700 mb-4">清洁状态</h3>
            <div className="flex gap-3">
              {(['clean', 'normal', 'dirty'] as CleanStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setCleanStatus(status)}
                  className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                    cleanStatus === status
                      ? status === 'clean'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                        : status === 'normal'
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                        : 'bg-red-500 text-white shadow-lg shadow-red-200'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {CLEAN_LABELS[status]}
                </button>
              ))}
            </div>
          </div>

          <div className={`bg-white border rounded-xl p-5 ${point.isOpen ? 'border-slate-200' : 'border-slate-100 opacity-50 pointer-events-none'}`}>
            <h3 className="text-sm font-semibold text-slate-700 mb-4">耗材情况</h3>
            <div className="space-y-3">
              {[
                { label: '厕纸', value: point.supplies.toiletPaper },
                { label: '洗手液', value: point.supplies.handSanitizer },
                { label: '纸巾', value: point.supplies.tissue },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-14">{label}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        value < 15 ? 'bg-red-500' : value < 40 ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${value < 15 ? 'text-red-500' : 'text-slate-500'}`}>
                    {value}%
                  </span>
                </div>
              ))}
            </div>

            {isSupplyLow && (
              <div className="mt-4 flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={supplyNeeded}
                    onChange={(e) => setSupplyNeeded(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm text-slate-700">标记需要补给</span>
                </label>
                {supplyNeeded && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <PackageX size={12} />
                    将提交补给请求
                  </span>
                )}
              </div>
            )}
          </div>

          <div className={`bg-white border rounded-xl p-5 ${point.isOpen ? 'border-slate-200' : 'border-slate-100 opacity-50 pointer-events-none'}`}>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">备注</h3>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="请输入巡检备注..."
              rows={3}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 resize-none"
            />
          </div>

          <div className="sticky bottom-0 bg-slate-50/90 backdrop-blur-sm py-4 -mx-6 px-6 border-t border-slate-200">
            <button
              onClick={handleSubmit}
              disabled={!point.isOpen}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                point.isOpen
                  ? 'bg-teal-700 text-white hover:bg-teal-800 shadow-lg shadow-teal-200 active:scale-[0.98]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {point.isOpen ? (
                <>
                  <Send size={16} />
                  提交巡检
                </>
              ) : (
                <>
                  <Lock size={16} />
                  点位已关闭，无法提交
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
