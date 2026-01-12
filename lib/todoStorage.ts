// lib/todoStorage.ts
// 環境変数で localStorage / DB を切り替えるストレージサービス

export type Todo = {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
};

const STORAGE_KEY = 'todos-demo';
const isLocalMode = process.env.NEXT_PUBLIC_STORAGE_MODE === 'local';

// localStorage 用のヘルパー関数
function getLocalTodos(): Todo[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveLocalTodos(todos: Todo[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function generateId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// ストレージサービス
export const todoStorage = {
  isLocalMode,

  async getAll(): Promise<Todo[]> {
    if (isLocalMode) {
      return getLocalTodos();
    }
    const res = await fetch('/api/todos');
    if (!res.ok) throw new Error('Failed to fetch todos');
    return res.json();
  },

  async create(title: string): Promise<Todo> {
    if (isLocalMode) {
      const todos = getLocalTodos();
      const newTodo: Todo = {
        id: generateId(),
        title,
        done: false,
        createdAt: new Date().toISOString(),
      };
      saveLocalTodos([newTodo, ...todos]);
      return newTodo;
    }
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to create todo');
    return res.json();
  },

  async update(id: number, data: Partial<Pick<Todo, 'title' | 'done'>>): Promise<Todo> {
    if (isLocalMode) {
      const todos = getLocalTodos();
      const index = todos.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Todo not found');
      const updated = { ...todos[index], ...data };
      todos[index] = updated;
      saveLocalTodos(todos);
      return updated;
    }
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update todo');
    return res.json();
  },

  async delete(id: number): Promise<void> {
    if (isLocalMode) {
      const todos = getLocalTodos();
      saveLocalTodos(todos.filter((t) => t.id !== id));
      return;
    }
    const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete todo');
  },
};
