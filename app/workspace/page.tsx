"use client";

import { useState } from "react";

type User = { email: string; plan: "free" | "pro" | "team" };

export default function WorkspacePage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prompt, setPrompt] = useState("未来感产品海报，冷蓝色科技风，玻璃拟态，禁止紫色");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submitAuth = () => {
    if (!email || !password) return;
    const nextUser: User = { email, plan: "free" };
    localStorage.setItem("nf_user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const subscribe = (plan: User["plan"]) => {
    if (!user) return;
    const nextUser = { ...user, plan };
    localStorage.setItem("nf_user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const generate = async () => {
    setLoading(true);
    setImage(null);
    const res = await fetch("/api/generate", {
      method: "POST",
      body: JSON.stringify({ prompt })
    });
    const json = await res.json();
    setImage(json.image ?? null);
    setLoading(false);
  };

  return (
    <main className="container" style={{ padding: "24px 0 44px" }}>
      <h1>AI 设计工作台</h1>
      {!user ? (
        <section className="card" style={{ padding: 20, maxWidth: 460 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <button className={`btn ${mode === "login" ? "btn-primary" : "btn-secondary"}`} onClick={() => setMode("login")}>登录</button>
            <button className={`btn ${mode === "register" ? "btn-primary" : "btn-secondary"}`} onClick={() => setMode("register")}>注册</button>
          </div>
          <label className="label">邮箱</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className="label" style={{ marginTop: 10 }}>密码</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={submitAuth}>
            {mode === "login" ? "登录" : "注册并进入"}
          </button>
        </section>
      ) : (
        <section className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <article className="card" style={{ padding: 20 }}>
            <h3>账号中心</h3>
            <p>{user.email}</p>
            <p style={{ color: "var(--muted)" }}>当前订阅：{user.plan.toUpperCase()}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => subscribe("pro")}>升级 PRO</button>
              <button className="btn btn-secondary" onClick={() => subscribe("team")}>升级 TEAM</button>
            </div>
          </article>
          <article className="card" style={{ padding: 20 }}>
            <h3>AI 图像生成（GPT-Image-2）</h3>
            <label className="label">提示词</label>
            <textarea className="input" rows={6} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            <button className="btn btn-primary" onClick={generate} disabled={loading} style={{ marginTop: 12 }}>
              {loading ? "生成中..." : "生成图片"}
            </button>
            {image ? (
              <img
                src={image}
                alt="AI"
                style={{ marginTop: 16, width: "100%", borderRadius: 12, border: "1px solid var(--line)" }}
              />
            ) : null}
          </article>
        </section>
      )}
    </main>
  );
}
