import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静的HTMLとしてエクスポート（さくらレンタルサーバー用）
  output: "export",
  // 画像最適化を無効化（静的エクスポートでは使えない）
  images: {
    unoptimized: true,
  },
  // ベースパス（サブディレクトリにデプロイする場合は設定）
  // basePath: "/todo-app-demo",
};

export default nextConfig;
