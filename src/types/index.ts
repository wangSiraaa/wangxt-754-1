export type UserRole = 'cleaner' | 'supervisor' | 'citizen';

export type OdorLevel = 1 | 2 | 3 | 4 | 5;

export type CleanStatus = 'clean' | 'normal' | 'dirty';

export type LegendStatus = 'excellent' | 'good' | 'warning' | 'danger' | 'critical';

export interface Supplies {
  toiletPaper: number;
  handSanitizer: number;
  tissue: number;
}

export interface StatusLegendItem {
  key: string;
  label: string;
  color: string;
  bgColor: string;
  description: string;
}

export interface ToiletPoint {
  id: string;
  name: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  odorLevel: OdorLevel;
  cleanStatus: CleanStatus;
  isOpen: boolean;
  cleanerId: string;
  cleanerName: string;
  supplies: Supplies;
  lastInspection?: string;
  supplyRequested?: boolean;
  legendStatus?: LegendStatus;
  priorityScore?: number;
}

export interface InspectionRecord {
  id: string;
  pointId: string;
  pointName: string;
  inspectorId: string;
  inspectorName: string;
  inspectTime: string;
  odorLevel: OdorLevel;
  cleanStatus: CleanStatus;
  supplyNeeded: boolean;
  remark: string;
  legendStatus?: LegendStatus;
  priorityScore?: number;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  district: string;
}

export interface FilterState {
  district: string;
  odorLevel: string;
  cleanStatus: string;
  isOpen: string;
  keyword: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  cleaner: '保洁员',
  supervisor: '片区主管',
  citizen: '市民监督员',
};

export const ODOR_LABELS: Record<OdorLevel, string> = {
  1: '无异味',
  2: '轻微',
  3: '一般',
  4: '较重',
  5: '严重',
};

export const CLEAN_LABELS: Record<CleanStatus, string> = {
  clean: '清洁',
  normal: '一般',
  dirty: '脏乱',
};

export const LEGEND_LABELS: Record<LegendStatus, string> = {
  excellent: '优秀',
  good: '良好',
  warning: '注意',
  danger: '警告',
  critical: '紧急',
};

export const LEGEND_COLORS: Record<LegendStatus, { color: string; bgColor: string; borderColor: string }> = {
  excellent: { color: '#059669', bgColor: '#ecfdf5', borderColor: '#10b981' },
  good: { color: '#0891b2', bgColor: '#ecfeff', borderColor: '#06b6d4' },
  warning: { color: '#d97706', bgColor: '#fffbeb', borderColor: '#f59e0b' },
  danger: { color: '#dc2626', bgColor: '#fef2f2', borderColor: '#ef4444' },
  critical: { color: '#991b1b', bgColor: '#fef2f2', borderColor: '#b91c1c' },
};

export const STATUS_LEGEND_ITEMS: StatusLegendItem[] = [
  { key: 'excellent', label: '优秀', color: '#059669', bgColor: '#ecfdf5', description: '无异味，清洁，耗材充足' },
  { key: 'good', label: '良好', color: '#0891b2', bgColor: '#ecfeff', description: '轻微异味，整体清洁' },
  { key: 'warning', label: '注意', color: '#d97706', bgColor: '#fffbeb', description: '一般异味，需关注' },
  { key: 'danger', label: '警告', color: '#dc2626', bgColor: '#fef2f2', description: '较重异味，需尽快处理' },
  { key: 'critical', label: '紧急', color: '#991b1b', bgColor: '#fee2e2', description: '异味严重，脏乱，立即处理' },
];

export const calculateLegendStatus = (odorLevel: OdorLevel, cleanStatus: CleanStatus): LegendStatus => {
  if (odorLevel >= 5 || (odorLevel >= 4 && cleanStatus === 'dirty')) return 'critical';
  if (odorLevel >= 4) return 'danger';
  if (odorLevel === 3 || cleanStatus === 'normal') return 'warning';
  if (odorLevel === 2) return 'good';
  return 'excellent';
};

export const calculatePriorityScore = (odorLevel: OdorLevel, cleanStatus: CleanStatus, isOpen: boolean): number => {
  if (!isOpen) return 0;
  let score = odorLevel * 10;
  if (cleanStatus === 'dirty') score += 20;
  else if (cleanStatus === 'normal') score += 10;
  return score;
};
