// app/api/todos/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(todos);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = body?.title;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'タイトルは必須です' },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.create({
      data: {
        title,
      },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}
