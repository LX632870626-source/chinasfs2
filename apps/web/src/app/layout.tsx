import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "中国足球未来之星",
  description: "发现小球员，追踪青少年赛程。"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
