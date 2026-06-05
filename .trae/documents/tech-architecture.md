## 1. 架构设计

```mermaid
graph TB
    subgraph "前端层"
        A["React + TypeScript + Vite"]
        B["Tailwind CSS"]
        C["Zustand 状态管理"]
        D["React Router"]
    end
    subgraph "数据层"
        E["本地 Mock 数据 (JSON)"]
        F["LocalStorage 持久化"]
    end
    A --> B
    A --> C
    A --> D
    A --> E
    C --> F
```

## 2. 技术说明

- 前端：React@18 + TypeScript + Tailwind CSS@3 + Vite
- 初始化工具：vite-init
- 后端：无（纯前端，本地数据）
- 数据库：无（使用本地 JSON Mock 数据 + LocalStorage 持久化）
- 状态管理：Zustand
- 路由：React Router DOM v6
- 图标：lucide-react
- 地图：Leaflet + react-leaflet（开源地图库）

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| `/` | 巡检首页 - 地图总览 + 点位列表 |
| `/inspect/:id` | 巡检录入 - 填写巡检表单 |
| `/points` | 点位管理 - 筛选、搜索、详情 |
| `/export` | 数据导出 - 筛选导出 CSV |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    "公厕点位" ||--o{ "巡检记录" : "拥有"
    "公厕点位" {
        string id PK
        string name
        string district
        float latitude
        float longitude
        int odorLevel
        string cleanStatus
        boolean isOpen
        string cleanerId
        object supplies
    }
    "巡检记录" {
        string id PK
        string pointId FK
        string inspectorId
        datetime inspectTime
        int odorLevel
        string cleanStatus
        boolean supplyNeeded
        string remark
        string photos
    }
    "耗材信息" {
        string id PK
        string pointId FK
        int toiletPaper
        int handSanitizer
        int tissue
        datetime lastSupplyTime
    }
    "用户" {
        string id PK
        string name
        string role
        string district
    }
```

### 4.2 核心类型定义

```typescript
interface ToiletPoint {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  odorLevel: 1 | 2 | 3 | 4 | 5;
  cleanStatus: 'clean' | 'normal' | 'dirty';
  isOpen: boolean;
  cleanerId: string;
  supplies: {
    toiletPaper: number;
    handSanitizer: number;
    tissue: number;
  };
  lastInspection?: string;
}

interface InspectionRecord {
  id: string;
  pointId: string;
  inspectorId: string;
  inspectorName: string;
  inspectTime: string;
  odorLevel: 1 | 2 | 3 | 4 | 5;
  cleanStatus: 'clean' | 'normal' | 'dirty';
  supplyNeeded: boolean;
  remark: string;
  photos: string[];
}

type UserRole = 'cleaner' | 'supervisor' | 'citizen';
```
