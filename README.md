# Nexus of Notions (NoN)

一个基于 Nuxt 3 + Vue 3 + Tailwind CSS 的奇思妙想收集平台，使用 Vercel PostgreSQL 作为数据库。

## 项目理念

Nexus of Notions (NoN) 是一个用于收集、管理和展示各种奇思妙想的平台。每个功能模块都是你脑海中的一个想法，通过技术实现成为现实。

## 功能模块

### 📊 体重记录系统 (Weight Tracker)
- **功能描述**: 跟踪体重变化，保持健康生活
- **核心特性**: 
  - 体重记录管理 - 添加、查看体重记录
  - 可视化图表 - 使用 Chart.js 展示体重变化趋势
  - 数据表格 - 详细的体重记录列表
  - API 接口 - 支持外部程序调用添加体重记录
  - 响应式设计 - 适配各种设备屏幕
  - 现代 UI - 使用 Tailwind CSS 构建美观界面

### 🚀 更多模块开发中...
- 待添加的奇思妙想功能模块

## 技术栈

- **前端框架**: Nuxt 3 + Vue 3
- **样式框架**: Tailwind CSS
- **图表库**: Chart.js + vue-chartjs
- **数据库**: Vercel PostgreSQL + Prisma ORM
- **开发语言**: TypeScript

## 项目结构

```
components/              # Vue 组件
├── AddWeightForm.vue    # 体重记录表单
├── WeightChart.vue      # 体重图表
└── WeightTable.vue      # 体重表格
lib/                     # 工具库
└── db.ts               # 数据库操作
pages/                   # 页面
├── index.vue           # 主页面
└── weight-tracker.vue  # 体重记录页面
server/                  # API 路由
└── api/                # API 路由
    └── weight/         # 体重相关 API
        └── route.ts
prisma/                  # 数据库模型
└── schema.prisma       # Prisma schema
```

## 快速开始

### 1. 运行设置脚本

```bash
./setup.sh
```

### 2. 配置环境变量

编辑 `.env` 文件，填入你的数据库连接信息（只需要配置 `POSTGRES_URL`）。

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量（参考 env.example）
4. 部署项目

## 开发理念

### 🧠 奇思妙想驱动开发
每个功能模块都源于一个想法，通过技术实现成为现实。

### 🔧 模块化设计
- 每个功能模块独立开发
- 共享技术栈和基础设施
- 便于扩展和维护

### 🎨 用户体验优先
- 简洁直观的界面设计
- 响应式布局适配各种设备
- 流畅的交互体验

## 许可证

MIT License