// app/todos/page.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';

type Todo = {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
};

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初回ロードで一覧取得
  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/todos');
        if (!res.ok) {
          throw new Error('Failed to fetch todos');
        }
        const data: Todo[] = await res.json();
        setTodos(data);
      } catch (err) {
        console.error(err);
        setError('TODOの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  // 追加
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (!res.ok) {
        throw new Error('Failed to create todo');
      }

      const newTodo: Todo = await res.json();
      setTodos((prev) => [newTodo, ...prev]);
      setTitle('');
    } catch (err) {
      console.error(err);
      setError('TODOの追加に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  // done の切り替え
  const toggleDone = async (todo: Todo) => {
    setError(null);
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ done: !todo.done }),
      });

      if (!res.ok) {
        throw new Error('Failed to update todo');
      }

      const updated: Todo = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      console.error(err);
      setError('TODOの更新に失敗しました');
    }
  };

  // 削除
  const deleteTodo = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete todo');
      }

      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      setError('TODOの削除に失敗しました');
    }
  };

  return (
    <main
      style={{
        maxWidth: 600,
        margin: '40px auto',
        padding: '0 16px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
        TODO リスト（Next.js + Prisma）
      </h1>

      <p style={{ marginBottom: 16, color: '#555' }}>
        /api/todos 経由で SQLite（Prisma）と連携するサンプルです。
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
        }}
      >
        <input
          type='text'
          placeholder='やることを入力...'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 4,
            border: '1px solid #ccc',
            fontSize: 14,
          }}
        />
        <button
          type='submit'
          disabled={submitting || !title.trim()}
          style={{
            padding: '8px 16px',
            borderRadius: 4,
            border: 'none',
            backgroundColor: submitting || !title.trim() ? '#ccc' : '#2563eb',
            color: 'white',
            cursor: submitting || !title.trim() ? 'default' : 'pointer',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          追加
        </button>
      </form>

      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: '8px 12px',
            borderRadius: 4,
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <p>読み込み中...</p>
      ) : todos.length === 0 ? (
        <p>TODO はまだありません。</p>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {todos.map((todo) => (
            <li
              key={todo.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 4,
                border: '1px solid #e5e7eb',
                backgroundColor: todo.done ? '#f3f4f6' : 'white',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flex: 1,
                  cursor: 'pointer',
                }}
              >
                <input
                  type='checkbox'
                  checked={todo.done}
                  onChange={() => toggleDone(todo)}
                />
                <span
                  style={{
                    textDecoration: todo.done ? 'line-through' : 'none',
                    color: todo.done ? '#6b7280' : '#111827',
                  }}
                >
                  {todo.title}
                </span>
              </label>
              <button
                onClick={() => deleteTodo(todo.id)}
                style={{
                  marginLeft: 12,
                  padding: '4px 8px',
                  borderRadius: 4,
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
