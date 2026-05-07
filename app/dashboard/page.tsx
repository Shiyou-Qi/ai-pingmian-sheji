"use client";
import { useEffect, useState } from "react";

const PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "price_pro_placeholder";
const TEAM_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM || "price_team_placeholder";

type User = { id: number; email: string; plan: string };
type Project = { id: number; name: string; created_at: string };
type Img = { id: number; prompt: string; image_data: string; created_at: string };

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authForm, setAuthForm] = useState({ email: "", password: "", mode: "login" });
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [history, setHistory] = useState<Img[]>([]);
  const [prompt, setPrompt] = useState("超现实科技产品广告，青蓝色体积光，金属材质，绝对不要紫色");

  const loadMe = async () => {
    const res = await fetch("/api/auth/me");
    if (res.ok) setUser((await res.json()).user);
  };
  const loadProjects = async () => {
    const res = await fetch("/api/projects");
    if (res.ok) {
      const data = await res.json();
      setProjects(data.projects);
      if (!activeProject && data.projects[0]) setActiveProject(data.projects[0].id);
    }
  };
  const loadHistory = async (projectId: number) => {
    const res = await fetch(`/api/projects/${projectId}/images`);
    if (res.ok) setHistory((await res.json()).images);
  };

  useEffect(() => { loadMe(); }, []);
  useEffect(() => { if (user) loadProjects(); }, [user]);
  useEffect(() => { if (activeProject) loadHistory(activeProject); }, [activeProject]);

  const auth = async () => {
    const url = authForm.mode === "register" ? "/api/auth/register" : "/api/auth/login";
    await fetch(url, { method: "POST", body: JSON.stringify({ email: authForm.email, password: authForm.password }) });
    await loadMe();
  };

  const createProject = async () => {
    await fetch("/api/projects", { method: "POST", body: JSON.stringify({ name: `项目 ${projects.length + 1}` }) });
    await loadProjects();
  };

  const checkout = async (priceId: string) => {
    const res = await fetch("/api/billing/checkout", { method: "POST", body: JSON.stringify({ priceId }) });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const openPortal = async () => {
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const generate = async () => {
    if (!activeProject) return;
    await fetch(`/api/projects/${activeProject}/images`, { method: "POST", body: JSON.stringify({ prompt }) });
    await loadHistory(activeProject);
  };

  if (!user) {
    return <main className="container card" style={{ padding: 20, marginTop: 40 }}>
      <h2>登录/注册</h2>
      <input className="input" placeholder="邮箱" onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
      <input className="input" placeholder="密码" type="password" style={{ marginTop: 8 }} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button className="btn btn-secondary" onClick={() => setAuthForm({ ...authForm, mode: "login" })}>登录</button>
        <button className="btn btn-secondary" onClick={() => setAuthForm({ ...authForm, mode: "register" })}>注册</button>
        <button className="btn btn-primary" onClick={auth}>提交</button>
      </div>
    </main>;
  }

  return (
    <main className="container" style={{ padding: "24px 0" }}>
      <h2>控制台 · {user.email} · {user.plan.toUpperCase()}</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button className="btn btn-secondary" onClick={() => checkout(PRO_PRICE_ID)}>升级 PRO</button>
        <button className="btn btn-secondary" onClick={() => checkout(TEAM_PRICE_ID)}>升级 TEAM</button>
        <button className="btn btn-primary" onClick={openPortal}>计费门户</button>
      </div>
      <section className="grid" style={{ gridTemplateColumns: "280px 1fr" }}>
        <aside className="card" style={{ padding: 12 }}>
          <button className="btn btn-primary" onClick={createProject}>新建项目</button>
          {projects.map((p) => <div key={p.id} style={{ marginTop: 10 }}>
            <button className="btn btn-secondary" onClick={() => setActiveProject(p.id)}>{p.name}</button>
          </div>)}
        </aside>
        <article className="card" style={{ padding: 16 }}>
          <h3>AI 生成与历史记录</h3>
          <textarea className="input" rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={generate}>生成并保存</button>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 16 }}>
            {history.map((h) => <div className="card" style={{ padding: 10 }} key={h.id}>
              <p style={{ fontSize: 12, color: "var(--muted)" }}>{new Date(h.created_at).toLocaleString()}</p>
              <p>{h.prompt}</p>
              <img src={h.image_data} alt={h.prompt} style={{ width: "100%", borderRadius: 8 }} />
            </div>)}
          </div>
        </article>
      </section>
    </main>
  );
}
