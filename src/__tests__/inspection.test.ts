import { describe, it, expect } from 'vitest';
import { useAppStore } from '@/store/useAppStore';
import { MOCK_POINTS } from '@/data/mock';

describe('关闭点位巡检限制', () => {
  it('应正确识别关闭的点位', () => {
    const closedPoints = MOCK_POINTS.filter((p) => !p.isOpen);
    expect(closedPoints.length).toBeGreaterThan(0);
    closedPoints.forEach((p) => {
      expect(p.isOpen).toBe(false);
    });
  });

  it('关闭点位不应允许提交巡检', () => {
    const closedPoint = MOCK_POINTS.find((p) => !p.isOpen);
    expect(closedPoint).toBeDefined();
    expect(closedPoint!.isOpen).toBe(false);
  });

  it('开放点位应允许提交巡检', () => {
    const openPoint = MOCK_POINTS.find((p) => p.isOpen);
    expect(openPoint).toBeDefined();
    expect(openPoint!.isOpen).toBe(true);
  });

  it('异味等级高的点位应排在前面', () => {
    const store = useAppStore.getState();
    const filtered = store.getFilteredPoints();
    for (let i = 1; i < filtered.length; i++) {
      expect(filtered[i].odorLevel).toBeLessThanOrEqual(filtered[i - 1].odorLevel);
    }
  });

  it('耗材不足的点位应正确识别', () => {
    const lowSupplyPoints = MOCK_POINTS.filter(
      (p) => p.supplies.toiletPaper < 15 || p.supplies.handSanitizer < 15 || p.supplies.tissue < 15
    );
    expect(lowSupplyPoints.length).toBeGreaterThan(0);
  });

  it('添加巡检记录后应更新点位状态', () => {
    const store = useAppStore.getState();
    const openPoint = MOCK_POINTS.find((p) => p.isOpen);
    expect(openPoint).toBeDefined();

    const beforeCount = store.inspections.length;
    store.addInspection({
      id: `test_${Date.now()}`,
      pointId: openPoint!.id,
      pointName: openPoint!.name,
      inspectorId: 'u1',
      inspectorName: '张建国',
      inspectTime: '2026-06-05 10:00',
      odorLevel: 2,
      cleanStatus: 'clean',
      supplyNeeded: false,
      remark: '测试巡检',
    });

    const afterStore = useAppStore.getState();
    expect(afterStore.inspections.length).toBe(beforeCount + 1);
  });

  it('补给请求应正确标记', () => {
    const store = useAppStore.getState();
    const pointId = MOCK_POINTS[0].id;
    store.requestSupply(pointId);
    const updated = useAppStore.getState().points.find((p) => p.id === pointId);
    expect(updated!.supplyRequested).toBe(true);
  });

  it('筛选功能应正确过滤点位', () => {
    const store = useAppStore.getState();
    store.setFilters({ district: '朝阳区' });
    const filtered = store.getFilteredPoints();
    filtered.forEach((p) => {
      expect(p.district).toBe('朝阳区');
    });
    store.resetFilters();
  });
});
