import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

const TODOS_FILE = path.join(process.cwd(), 'data', 'todos.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(TODOS_FILE);
  await fs.ensureDir(dataDir);
}

// Load todos from file
async function loadTodos() {
  try {
    await ensureDataDirectory();
    if (await fs.pathExists(TODOS_FILE)) {
      const data = await fs.readFile(TODOS_FILE, 'utf-8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading todos:', error);
    return [];
  }
}

// Save todos to file
async function saveTodos(todos: any[]) {
  try {
    await ensureDataDirectory();
    await fs.writeFile(TODOS_FILE, JSON.stringify(todos, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving todos:', error);
    return false;
  }
}

// GET /api/todos - Get all todos
export async function GET() {
  try {
    const todos = await loadTodos();
    return NextResponse.json({ success: true, todos });
  } catch (error) {
    console.error('Error in GET /api/todos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load todos' },
      { status: 500 }
    );
  }
}

// POST /api/todos - Create a new todo
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, deadline, taggedAgents, priority, complexity, description } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Todo text is required' },
        { status: 400 }
      );
    }

    const todos = await loadTodos();
    
    const newTodo = {
      id: Date.now(),
      text,
      done: false,
      deadline,
      taggedAgents,
      priority,
      complexity,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    todos.push(newTodo);
    
    const saved = await saveTodos(todos);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Failed to save todo' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, todo: newTodo });
  } catch (error) {
    console.error('Error in POST /api/todos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}

// PUT /api/todos - Update a todo
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Todo ID is required' },
        { status: 400 }
      );
    }

    const todos = await loadTodos();
    const todoIndex = todos.findIndex(todo => todo.id === id);
    
    if (todoIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Todo not found' },
        { status: 404 }
      );
    }

    todos[todoIndex] = {
      ...todos[todoIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const saved = await saveTodos(todos);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Failed to save todo' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, todo: todos[todoIndex] });
  } catch (error) {
    console.error('Error in PUT /api/todos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

// DELETE /api/todos - Delete a todo
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Todo ID is required' },
        { status: 400 }
      );
    }

    const todos = await loadTodos();
    const filteredTodos = todos.filter(todo => todo.id !== parseInt(id));
    
    if (filteredTodos.length === todos.length) {
      return NextResponse.json(
        { success: false, error: 'Todo not found' },
        { status: 404 }
      );
    }

    const saved = await saveTodos(filteredTodos);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Failed to save todos' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/todos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
} 