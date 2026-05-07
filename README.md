# Nebula Forge AI SaaS

## 功能完成度
- 官网营销页 + 控制台
- JWT 注册登录（Postgres）
- 项目管理 + 团队协作
- GPT-Image-2 生成与历史记录
- Stripe 订阅：Checkout、Webhook 自动升降级、计费门户
- 团队席位限制（按 plan 限制项目成员）

## Stripe 订阅流程
1. 前端调用 `/api/billing/checkout` 获取 Checkout URL。
2. Stripe 回调 `/api/billing/webhook`。
3. Webhook 根据 `price_id` 更新 `subscriptions` 并同步用户 `plan`。
4. 控制台可通过 `/api/billing/portal` 进入计费门户。

## 启动
```bash
npm install
cp .env.example .env.local
npm run dev
```

## 安全说明
- 已将 Next.js 固定到包含 CVE-2025-66478 修复的版本（`15.5.7`）。
- 已将 React 固定到修复对应 RSC 漏洞的版本（`19.1.2`）。
