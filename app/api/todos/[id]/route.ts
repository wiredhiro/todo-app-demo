// app/api/todos/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteParams = {
  id: string;
};

// PATCH /api/todos/:id
export async function PATCH(
  req: Request,
  context: { params: Promise<RouteParams> }
) {
  const { id } = await context.params; // ← ここポイント！
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: 'IDが不正です' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { title, done } = body as {
      title?: string;
      done?: boolean;
    };

    const data: { title?: string; done?: boolean } = {};
    if (typeof title === 'string') data.title = title;
    if (typeof done === 'boolean') data.done = done;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: '更新する項目がありません' },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.update({
      where: { id: numericId },
      data,
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

// DELETE /api/todos/:id
export async function DELETE(
  _req: Request,
  context: { params: Promise<RouteParams> }
) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: 'IDが不正です' }, { status: 400 });
  }

  try {
    await prisma.todo.delete({
      where: { id: numericId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}
