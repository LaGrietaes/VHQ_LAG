import { NextResponse } from 'next/server';
import si from 'systeminformation';

export const dynamic = 'force-dynamic';

async function getCpuInfo() {
    try {
        const cpu = await Promise.race([
            si.cpu(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
        ]);
        return {
            manufacturer: cpu.manufacturer,
            brand: cpu.brand,
            speed: cpu.speed,
            cores: cpu.cores,
            physicalCores: cpu.physicalCores,
        };
    } catch (error) {
        console.warn('Could not retrieve CPU info:', error);
        return { 
            manufacturer: 'Unknown',
            brand: 'Unknown',
            speed: 0,
            cores: 0,
            physicalCores: 0,
            error: 'Could not retrieve CPU info' 
        };
    }
}

async function getMemInfo() {
    try {
        const mem = await Promise.race([
            si.mem(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
        ]);
        return {
            total: mem.total,
            free: mem.free,
            used: mem.used,
            active: mem.active,
        };
    } catch (error) {
        console.warn('Could not retrieve Memory info:', error);
        return { 
            total: 0,
            free: 0,
            used: 0,
            active: 0,
            error: 'Could not retrieve Memory info' 
        };
    }
}

async function getOsInfo() {
    try {
        const os = await Promise.race([
            si.osInfo(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
        ]);
        return {
            platform: os.platform,
            distro: os.distro,
            release: os.release,
            arch: os.arch,
        };
    } catch (error) {
        console.warn('Could not retrieve OS info:', error);
        return { 
            platform: 'Unknown',
            distro: 'Unknown',
            release: 'Unknown',
            arch: 'Unknown',
            error: 'Could not retrieve OS info' 
        };
    }
}

export async function GET() {
  try {
    const [cpu, mem, os] = await Promise.all([
        getCpuInfo(),
        getMemInfo(),
        getOsInfo(),
    ]);
    
    const stats = { cpu, mem, os };

    return NextResponse.json(stats);
  } catch (e) {
    console.error("Failed to fetch any system stats:", e);
    return NextResponse.json({ 
        cpu: { error: 'Failed to fetch CPU info' },
        mem: { error: 'Failed to fetch Memory info' },
        os: { error: 'Failed to fetch OS info' }
    }, { status: 200 }); // Return 200 with error data instead of 500
  }
} 