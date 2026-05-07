"use client";

import Link from "next/link";

export function Landing() {
  return (
    <main>
      <header className="container" style={{ padding: "24px 0", display: "flex", justifyContent: "space-between" }}>
        <h2>Nebula Forge AI</h2>
        <Link href="/workspace" className="btn btn-primary" style={{ textDecoration: "none" }}>进入工作台</Link>
      </header>
      <section className="container card" style={{ padding: 32 }}>
        <h1 style={{ fontSize: 42, margin: "0 0 10px" }}>面向设计团队的 AI 图片 SaaS 平台</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>支持官网展示、用户注册登录、订阅套餐与 AI 工作台。内置 GPT-Image-2 生成引擎，适合品牌海报、产品 KV、UI 视觉探索。</p>
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <Link href="/workspace" className="btn btn-primary" style={{ textDecoration: "none" }}>免费开始</Link>
          <button className="btn btn-secondary">查看订阅计划</button>
        </div>
      </section>
    </main>
  );
}
