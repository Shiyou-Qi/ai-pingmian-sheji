"use client";

import { createElement, useState } from "react";

type User = { email: string; plan: "free" | "pro" | "team" };

export default function WorkspacePage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prompt, setPrompt] = useState("未来感产品海报，冷蓝色科技风，玻璃拟态，禁止紫色");
  const [image, setImage] = useState<string | null>(null);

  const submitAuth = () => {
    if (!email || !password) return;
    const nextUser: User = { email, plan: "free" };
    localStorage.setItem("nf_user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const generate = async () => {
    const res = await fetch("/api/generate", { method: "POST", body: JSON.stringify({ prompt }) });
    const json = await res.json();
    setImage(json.image ?? null);
  };

  return createElement(
    "main",
    { className: "container", style: { padding: "24px 0 44px" } },
    createElement("h1", null, "AI 设计工作台"),
    !user
      ? createElement(
          "section",
          { className: "card", style: { padding: 20, maxWidth: 460 } },
          createElement("div", { style: { display: "flex", gap: 8, marginBottom: 12 } },
            createElement("button", { className: `btn ${mode === "login" ? "btn-primary" : "btn-secondary"}`, onClick: () => setMode("login") }, "登录"),
            createElement("button", { className: `btn ${mode === "register" ? "btn-primary" : "btn-secondary"}`, onClick: () => setMode("register") }, "注册")
          ),
          createElement("input", { className: "input", placeholder: "邮箱", value: email, onChange: (e: any) => setEmail(e.target.value) }),
          createElement("input", { className: "input", type: "password", placeholder: "密码", value: password, onChange: (e: any) => setPassword(e.target.value), style: { marginTop: 8 } }),
          createElement("button", { className: "btn btn-primary", style: { marginTop: 12 }, onClick: submitAuth }, mode === "login" ? "登录" : "注册并进入")
        )
      : createElement(
          "section",
          { className: "card", style: { padding: 20 } },
          createElement("p", null, `当前用户：${user.email} / ${user.plan.toUpperCase()}`),
          createElement("textarea", { className: "input", rows: 5, value: prompt, onChange: (e: any) => setPrompt(e.target.value) }),
          createElement("button", { className: "btn btn-primary", style: { marginTop: 12 }, onClick: generate }, "生成图片"),
          image ? createElement("img", { src: image, alt: "AI", style: { marginTop: 14, width: "100%", borderRadius: 12 } }) : null
        )
  );
}
