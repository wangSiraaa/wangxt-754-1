export type UserRole = 'cleaner' | 'supervisor' | 'citizen';

export type OdorLevel = 1 | 2 | 3 | 4 | 5;

export type CleanStatus = 'clean' | 'normal' | 'dirty';

export interface Supplies {
  toiletPaper: number;
  handSanitizer: number;
  tissue: number;
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
