import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function GET() {
  try {
    const res = await fetch('http://localhost:11434/api/tags', { method: 'GET', timeout: 2000 });
    if (res.ok) {
      return NextResponse.json({ running: true });
    }
    return NextResponse.json({ running: false });
  } catch (e) {
    return NextResponse.json({ running: false });
  }
}

export async function POST() {
  try {
    // Intenta iniciar Ollama en background
    const proc = spawn('ollama', ['serve'], {
      detached: true,
      stdio: 'ignore',
    });
    proc.unref();
    return NextResponse.json({ started: true });
  } catch (e: any) {
    return NextResponse.json({ started: false, error: e?.message || 'Error al iniciar Ollama' });
  }
} 