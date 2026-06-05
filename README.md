# 城市公厕保洁巡检系统

面向市政环卫场景的公厕清洁巡检管理前端平台。

## 功能特性

- **三角色视图**：保洁员维护点位、片区主管查看状态、市民监督员查看公示
- **地图+列表双视图**：基于 Leaflet 的地图总览与卡片列表切换
- **异味等级置顶**：异味等级高的点位自动排序到最前
- **异常高亮**：异味≥4 红色脉冲边框 + 置顶标记，3 级橙色边框
- **耗材补给**：耗材不足显示黄色闪烁补给按钮，点击标记补给请求
- **关闭点位禁止巡检**：关闭的点位灰色覆盖 + 禁止提交提示 + 按钮禁用
- **巡检录入**：完整巡检表单（异味等级、清洁状态、耗材情况、备注）
- **点位筛选**：按片区、异味等级、清洁状态、开放状态、关键词筛选
- **数据导出**：按条件筛选并导出 CSV 文件

## 技术栈

- React 18 + TypeScript
- Vite
- Tailwind CSS 3
- Zustand (状态管理)
- React Router DOM v6
- Leaflet + react-leaflet (地图)
- Lucide React (图标)

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 类型检查
npm run check
```

## Docker 部署

```bash
# 构建镜像
docker build -t toilet-inspection .

# 运行容器
docker run -d -p 8080:80 toilet-inspection
```

访问 http://localhost:8080

## 项目结构

```
src/
├── components/      # 通用组件
│   ├── Layout.tsx   # 侧边栏布局
│   ├── MapView.tsx  # Leaflet 地图
│   ├── PointCard.tsx # 点位卡片
│   └── FilterBar.tsx # 筛选栏
├── pages/           # 页面
│   ├── Home.tsx     # 巡检总览（地图+列表）
│   ├── Inspection.tsx # 巡检录入
│   ├── Points.tsx   # 点位管理
│   └── Export.tsx   # 数据导出
├── store/           # Zustand 状态
│   └── useAppStore.ts
├── data/            # Mock 数据
│   └── mock.ts
├── types/           # TypeScript 类型
│   └── index.ts
├── App.tsx          # 路由配置
└── main.tsx         # 入口文件
```

## 角色权限

| 角色 | 巡检录入 | 查看状态 | 耗材补给 | 数据导出 |
|------|----------|----------|----------|----------|
| 保洁员 | ✅ | 自己负责的点位 | ✅ | ✅ |
| 片区主管 | ✅ | 片区所有点位 | ✅ | ✅ |
| 市民监督员 | ❌ | 公示信息 | ❌ | ❌ |

## 关闭点位巡检限制

- 关闭点位在列表中显示灰色半透明覆盖层
- 关闭点位在巡检录入页顶部显示红色警告
- 关闭点位的巡检表单区域变灰且不可操作
- 提交按钮禁用，显示"点位已关闭，无法提交"
