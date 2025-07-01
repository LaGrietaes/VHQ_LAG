import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Return mock data to avoid systeminformation issues
  const mockStats = {
    cpu: {
      manufacturer: 'Mock',
      brand: 'Mock CPU',
      speed: 2.4,
      cores: 8,
      physicalCores: 4,
    },
    mem: {
      total: 16 * 1024 * 1024 * 1024, // 16GB
      free: 8 * 1024 * 1024 * 1024,   // 8GB
      used: 8 * 1024 * 1024 * 1024,   // 8GB
      active: 6 * 1024 * 1024 * 1024, // 6GB
    },
    os: {
      platform: 'win32',
      distro: 'Windows',
      release: '10',
      arch: 'x64',
    }
  };

  return NextResponse.json(mockStats);
} 