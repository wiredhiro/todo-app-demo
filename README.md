# TODO アプリ（Next.js + Prisma + SQLite）

Next.js（App Router）と Prisma、SQLite を使った **フルスタック TODO アプリ** です。  
バックエンド API（CRUD）とフロント UI をひととおり実装し、  
**Next.js × Prisma の構成を最小で体験** できます。

---

## 🚀 技術スタック

- **Next.js 14（App Router）**
- **React 18**
- **TypeScript**
- **Prisma ORM**
- **SQLite（ローカル開発用）**
- **Next.js Route Handlers（API Routes v2）**
- **Node.js 18+**

---

## 📦 機能一覧（CRUD）

### ✔ 一覧取得（GET `/api/todos`）

Prisma を利用して Todo を SQLite から取得し、作成日の降順で返します。

### ✔ 新規作成（POST `/api/todos`）

リクエスト JSON の `title` を受け取り、DB に保存します。

### ✔ 更新（PATCH `/api/todos/:id`）

Todo の `done` または `title` を更新できます。

### ✔ 削除（DELETE `/api/todos/:id`）

指定された ID の Todo を削除します。

---

## 📁 ディレクトリ構成

app/
api/
todos/
route.ts ← GET・POST
[id]/
route.ts ← PATCH・DELETE
todos/
page.tsx ← フロント UI（一覧・追加・更新・削除）
layout.tsx
page.tsx
lib/
prisma.ts ← Prisma Client（Singleton）
prisma/
schema.prisma ← Prisma スキーマ
dev.db ← SQLite DB
.env ← DATABASE_URL

---

## 🛠 セットアップ

### 1. 依存インストール

```bash
npm install
```

### 2. DB セットアップ

.env を作成：

```bash
DATABASE_URL="file:./prisma/dev.db"
```

マイグレーション実行：

```bash
npx prisma migrate dev --name init
```

### 3. 開発サーバー起動

```bash
npm run dev
```

### 4. TODO アプリにアクセス

```bash
http://localhost:3000/todos
```

⸻

🧩 Prisma Client（lib/prisma.ts）

Next.js の開発環境で PrismaClient が多重生成されるのを避けるための Singleton パターンを使用：

import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
globalForPrisma.prisma ||
new PrismaClient({
log: ["query"],
});

if (process.env.NODE_ENV !== "production") {
globalForPrisma.prisma = prisma;
}

⸻

📡 API 実装

▶ /api/todos/route.ts（GET・POST）

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
const todos = await prisma.todo.findMany({
orderBy: { createdAt: "desc" },
});
return NextResponse.json(todos);
}

export async function POST(req: Request) {
const { title } = await req.json();
const todo = await prisma.todo.create({
data: { title },
});
return NextResponse.json(todo, { status: 201 });
}

▶ /api/todos/[id]/route.ts（PATCH・DELETE）

Next.js の仕様に合わせて params を await して展開：

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { id: string };

export async function PATCH(
req: Request,
context: { params: Promise<RouteParams> }
) {
const { id } = await context.params;
const numericId = Number(id);

const { title, done } = await req.json();

const updated = await prisma.todo.update({
where: { id: numericId },
data: { title, done },
});

return NextResponse.json(updated);
}

export async function DELETE(
\_req: Request,
context: { params: Promise<RouteParams> }
) {
const { id } = await context.params;
const numericId = Number(id);

await prisma.todo.delete({ where: { id: numericId } });

return NextResponse.json({ success: true });
}

⸻

🖥 フロント UI（app/todos/page.tsx）
• 初回ロードで一覧を fetch
• 追加フォーム
• チェックボックスで done トグル
• 削除ボタン
• 状態管理：useState / useEffect

（フルコードはプロジェクト内に記載）

⸻

🎯 学べるポイント
• Next.js App Router の基本的なページ構成
• Route Handlers を使った API 実装（GET/POST/PATCH/DELETE）
• Prisma ORM × SQLite によるデータ永続化
• TypeScript での型安全なフルスタック開発
• フロントとバックエンドのデータ連携
• Next.js のサーバーコンポーネントとクライアントコンポーネントの使い分け
• Prisma Client の Singleton パターン

⸻

🧑‍💻 作成者

Hiroshi Ogawa
React / Next.js フロントエンドエンジニア

⸻

```

```
