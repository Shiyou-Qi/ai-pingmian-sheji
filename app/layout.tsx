import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nebula Forge AI",
  description: "AI 设计图片 SaaS 平台"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
