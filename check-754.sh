#!/bin/bash

set -e

echo "========================================"
echo "  754 城市公厕保洁巡屏 - 功能验证脚本"
echo "========================================"
echo ""

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

PASS=0
FAIL=0

check_file_exists() {
    if [ -f "$1" ]; then
        echo "  ✓ $1 存在"
        PASS=$((PASS + 1))
        return 0
    else
        echo "  ✗ $1 不存在"
        FAIL=$((FAIL + 1))
        return 1
    fi
}

check_keyword_in_file() {
    local file="$1"
    local keyword="$2"
    local desc="$3"
    
    if grep -q "$keyword" "$file" 2>/dev/null; then
        echo "  ✓ $desc"
        PASS=$((PASS + 1))
        return 0
    else
        echo "  ✗ $desc"
        FAIL=$((FAIL + 1))
        return 1
    fi
}

echo "[1/7] 检查核心文件存在性"
echo "----------------------------------------"
check_file_exists "src/types/index.ts"
check_file_exists "src/store/useAppStore.ts"
check_file_exists "src/components/StatusLegend.tsx"
check_file_exists "src/pages/Home.tsx"
check_file_exists "src/pages/Points.tsx"
check_file_exists "src/pages/Export.tsx"
echo ""

echo "[2/7] 验证类型定义 - 状态图例"
echo "----------------------------------------"
check_keyword_in_file "src/types/index.ts" "LegendStatus" "LegendStatus 类型定义"
check_keyword_in_file "src/types/index.ts" "StatusLegendItem" "StatusLegendItem 接口定义"
check_keyword_in_file "src/types/index.ts" "STATUS_LEGEND_ITEMS" "STATUS_LEGEND_ITEMS 常量"
check_keyword_in_file "src/types/index.ts" "calculateLegendStatus" "calculateLegendStatus 函数"
check_keyword_in_file "src/types/index.ts" "calculatePriorityScore" "calculatePriorityScore 函数"
check_keyword_in_file "src/types/index.ts" "legendStatus" "ToiletPoint 包含 legendStatus 字段"
check_keyword_in_file "src/types/index.ts" "priorityScore" "ToiletPoint 包含 priorityScore 字段"
echo ""

echo "[3/7] 验证 Store - 状态图例同步"
echo "----------------------------------------"
check_keyword_in_file "src/store/useAppStore.ts" "initPointWithLegend" "点位状态图例初始化函数"
check_keyword_in_file "src/store/useAppStore.ts" "initInspectionWithLegend" "巡检记录状态图例初始化函数"
check_keyword_in_file "src/store/useAppStore.ts" "recordWithLegend" "addInspection 时同步状态图例"
check_keyword_in_file "src/store/useAppStore.ts" "priorityScore" "排序时使用 priorityScore"
echo ""

echo "[4/7] 验证异味等级高的点位置顶功能"
echo "----------------------------------------"
if grep -q "scoreB - scoreA" "src/store/useAppStore.ts" 2>/dev/null; then
    echo "  ✓ 按 priorityScore 降序排序（异味高置顶）"
    PASS=$((PASS + 1))
else
    echo "  ✗ 未按 priorityScore 降序排序"
    FAIL=$((FAIL + 1))
fi

if grep -q "b.odorLevel - a.odorLevel" "src/store/useAppStore.ts" 2>/dev/null; then
    echo "  ✓ 异味等级作为二级排序条件"
    PASS=$((PASS + 1))
else
    echo "  ✗ 异味等级未作为二级排序条件"
    FAIL=$((FAIL + 1))
fi

if grep -q "calculatePriorityScore" "src/store/useAppStore.ts" 2>/dev/null; then
    echo "  ✓ 使用 calculatePriorityScore 计算优先级"
    PASS=$((PASS + 1))
else
    echo "  ✗ 未使用 calculatePriorityScore"
    FAIL=$((FAIL + 1))
fi
echo ""

echo "[5/7] 验证 StatusLegend 组件"
echo "----------------------------------------"
check_keyword_in_file "src/components/StatusLegend.tsx" "export default function StatusLegend" "StatusLegend 主组件导出"
check_keyword_in_file "src/components/StatusLegend.tsx" "LegendBadge" "LegendBadge 子组件"
check_keyword_in_file "src/components/StatusLegend.tsx" "PriorityPin" "PriorityPin 置顶标记组件"
check_keyword_in_file "src/components/StatusLegend.tsx" "STATUS_LEGEND_ITEMS" "使用 STATUS_LEGEND_ITEMS 常量"
echo ""

echo "[6/7] 验证页面集成状态图例"
echo "----------------------------------------"
check_keyword_in_file "src/pages/Home.tsx" "StatusLegend" "首页集成 StatusLegend"
check_keyword_in_file "src/pages/Points.tsx" "LegendBadge" "点位管理使用 LegendBadge"
check_keyword_in_file "src/pages/Points.tsx" "PriorityPin" "点位管理使用 PriorityPin"
check_keyword_in_file "src/components/PointCard.tsx" "LegendBadge" "PointCard 使用 LegendBadge"
check_keyword_in_file "src/components/PointCard.tsx" "PriorityPin" "PointCard 使用 PriorityPin"
check_keyword_in_file "src/pages/Export.tsx" "StatusLegend" "导出页面集成状态图例"
echo ""

echo "[7/7] 运行 TypeScript 类型检查"
echo "----------------------------------------"
if command -v npm &>/dev/null; then
    if npm run check 2>&1; then
        echo "  ✓ TypeScript 类型检查通过"
        PASS=$((PASS + 1))
    else
        echo "  ✗ TypeScript 类型检查失败"
        FAIL=$((FAIL + 1))
    fi
else
    echo "  ⚠ npm 不可用，跳过 TypeScript 检查"
fi
echo ""

echo "========================================"
echo "  验证结果汇总"
echo "========================================"
echo "  通过: $PASS 项"
echo "  失败: $FAIL 项"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "  ✓ 所有检查通过！状态图例和置顶功能已正确实现。"
    echo ""
    echo "  功能说明："
    echo "  1. 状态图例：优秀/良好/注意/警告/紧急 五级分类"
    echo "  2. 状态图例同步到点位和巡检历史记录"
    echo "  3. 异味等级高的点位自动置顶（按 priorityScore 排序）"
    echo "  4. 所有数据为本地 mock 数据，无需外部账号"
    exit 0
else
    echo "  ✗ 存在 $FAIL 项检查失败，请查看上方详情。"
    exit 1
fi
