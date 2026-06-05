import { create } from 'zustand';
import type { ToiletPoint, InspectionRecord, User, UserRole, FilterState } from '@/types';
import { MOCK_POINTS, MOCK_INSPECTIONS, MOCK_USERS } from '@/data/mock';

interface AppState {
  currentUser: User;
  points: ToiletPoint[];
  inspections: InspectionRecord[];
  filters: FilterState;

  setCurrentUser: (user: User) => void;
  setRole: (role: UserRole) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  addInspection: (record: InspectionRecord) => void;
  requestSupply: (pointId: string) => void;
  getFilteredPoints: () => ToiletPoint[];
  getPointById: (id: string) => ToiletPoint | undefined;
  getInspectionsByPointId: (pointId: string) => InspectionRecord[];
}

const DEFAULT_FILTERS: FilterState = {
  district: '全部',
  odorLevel: '全部',
  cleanStatus: '全部',
  isOpen: '全部',
  keyword: '',
};

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: MOCK_USERS[0],
  points: MOCK_POINTS,
  inspections: MOCK_INSPECTIONS,
  filters: { ...DEFAULT_FILTERS },

  setCurrentUser: (user) => set({ currentUser: user }),

  setRole: (role) => {
    const user = MOCK_USERS.find((u) => u.role === role);
    if (user) set({ currentUser: user });
  },

  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),

  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  addInspection: (record) =>
    set((state) => {
      const updatedPoints = state.points.map((p) =>
        p.id === record.pointId
          ? {
              ...p,
              odorLevel: record.odorLevel,
              cleanStatus: record.cleanStatus,
              lastInspection: record.inspectTime,
              supplyRequested: record.supplyNeeded ? false : p.supplyRequested,
            }
          : p
      );
      return {
        inspections: [record, ...state.inspections],
        points: updatedPoints,
      };
    }),

  requestSupply: (pointId) =>
    set((state) => ({
      points: state.points.map((p) =>
        p.id === pointId ? { ...p, supplyRequested: true } : p
      ),
    })),

  getFilteredPoints: () => {
    const { points, filters } = get();
    let result = [...points];

    if (filters.district && filters.district !== '全部') {
      result = result.filter((p) => p.district === filters.district);
    }
    if (filters.odorLevel && filters.odorLevel !== '全部') {
      result = result.filter((p) => String(p.odorLevel) === filters.odorLevel);
    }
    if (filters.cleanStatus && filters.cleanStatus !== '全部') {
      result = result.filter((p) => p.cleanStatus === filters.cleanStatus);
    }
    if (filters.isOpen && filters.isOpen !== '全部') {
      result = result.filter((p) =>
        filters.isOpen === '开放' ? p.isOpen : !p.isOpen
      );
    }
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(kw) ||
          p.address.toLowerCase().includes(kw)
      );
    }

    result.sort((a, b) => b.odorLevel - a.odorLevel);

    return result;
  },

  getPointById: (id) => get().points.find((p) => p.id === id),

  getInspectionsByPointId: (pointId) =>
    get().inspections.filter((i) => i.pointId === pointId),
}));
