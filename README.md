This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# B站主播直播主题建议系统设计文档

## 系统概述
这是一个面向B站主播粉丝的直播主题建议收集系统。粉丝可以提交建议并对其他建议进行投票，帮助主播更好地了解粉丝的兴趣和需求。

## 功能需求

### 核心功能
1. 建议提交
   - 用户可以提交文本形式的建议
   - 每条建议需要包含标题和详细内容
   - 记录提交时间和提交者信息

2. 建议展示
   - 列表形式展示所有建议
   - 支持分页加载
   - 显示每条建议的投票数据

3. 投票功能
   - 用户可以对每条建议投赞成票或反对票
   - 每个用户对同一建议只能投一票
   - 实时更新投票计数

## 技术架构

### 技术选型
- 框架：Next.js 13+ (App Router)
  - 全栈框架，支持服务端渲染
  - 内置API路由功能
  - 优秀的开发体验

- UI框架：
  - Tailwind CSS（样式设计）
  - shadcn/ui（UI组件库）

- 数据库：
  - Upstash Redis（高性能分布式缓存和数据库）
  - 内置投票计数器功能
  - 全球分布式部署

### 数据模型

```typescript
// 建议数据结构
interface Suggestion {
  id: string
  title: string
  content: string
  createdAt: string
  upVotes: number
  downVotes: number
}

// Redis 键值设计
suggestions:list - 存储所有建议的有序集合
suggestion:{id} - 存储单个建议的详细信息
votes:{suggestionId}:{userId} - 存储用户对特定建议的投票记录
```

### 系统架构
1. 前端
   - 使用Next.js的App Router进行页面路由
   - 采用服务端组件优先的策略
   - 使用React Server Components减少客户端JavaScript体积

2. 后端API
   - 使用Next.js的API Routes处理请求
   - 实现RESTful API接口
   - 主要接口：
     - POST /api/suggestions - 创建建议
     - GET /api/suggestions - 获取建议列表
     - POST /api/suggestions/:id/vote - 投票

3. 数据库
   - 使用Upstash Redis作为主数据库
   - 利用Redis原子操作保证投票准确性
   - 使用Redis Sorted Sets实现排序功能
   - 通过Redis TTL机制管理临时数据

## 部署方案

### 部署平台
选择Vercel平台进行部署：
- 完整支持Next.js项目
- 与Upstash Redis完美集成
- 自动化部署流程
- 全球CDN分发
- 零配置SSL证书

### 部署流程
1. 代码托管
   - 使用GitHub托管源代码
   - 配置GitHub Actions进行CI/CD

2. 环境配置
   - 在Vercel中配置环境变量
   - 设置Upstash Redis连接信息

3. 部署步骤
   - 推送代码到GitHub主分支
   - Vercel自动触发构建和部署
   - 自动配置Upstash Redis连接

## 扩展性考虑
1. 性能优化
   - 实现数据缓存
   - 优化数据库查询
   - 使用边缘函数优化全球访问

2. 未来功能
   - 用户认证系统
   - 评论功能
   - 建议分类
   - 搜索功能

## 开发计划
1. 项目初始化
   - 创建Next.js项目
   - 配置Tailwind CSS
   - 设置Upstash Redis

2. 核心功能开发
   - 实现建议提交功能
   - 开发建议列表展示
   - 实现投票系统

3. UI/UX优化
   - 实现响应式设计
   - 添加加载状态
   - 优化交互体验

4. 测试和部署
   - 编写单元测试
   - 进行性能测试
   - 部署到Vercel