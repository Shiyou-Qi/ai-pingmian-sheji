import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className="container" style={{ padding: "72px 0 48px" }}>
        <h1 style={{ fontSize: 48 }}>Nebula Forge AI 设计云</h1>
        <p style={{ color: "var(--muted)", maxWidth: 700 }}>完整 SaaS 架构：官网营销、注册登录、订阅计费、项目协作、图像历史与控制台工作流。设计语言采用深空蓝+青色科技风（禁用紫色）。</p>
        <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
          <Link href="/dashboard" className="btn btn-primary" style={{ textDecoration: "none" }}>进入控制台</Link>
          <Link href="/workspace" className="btn btn-secondary" style={{ textDecoration: "none" }}>打开旧版工作台</Link>
        </div>
      </section>
    </main>
  );
}
