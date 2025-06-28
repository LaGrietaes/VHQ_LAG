import { NextResponse } from 'next/server';
import si from 'systeminformation';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [cpu, mem, gpu, fsSize, currentLoad] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.graphics(),
      si.fsSize(),
      si.currentLoad()
    ]);

    const cpuTemp = await si.cpuTemperature();

    const mainDisk = fsSize[0];
    const gpuController = gpu.controllers[0];

    const stats = {
      cpu: {
        usage: Math.round(currentLoad.currentLoad),
        temp: cpuTemp.main || 0,
        cores: cpu.cores,
      },
      gpu: {
        usage: gpuController?.utilizationGpu || 0,
        temp: gpuController?.temperatureGpu || 0,
        memory: gpuController?.vram || 0,
      },
      memory: {
        used: parseFloat((mem.used / 1024 / 1024 / 1024).toFixed(1)),
        total: parseFloat((mem.total / 1024 / 1024 / 1024).toFixed(1)),
        percentage: parseFloat(((mem.used / mem.total) * 100).toFixed(1)),
      },
      disk: {
        used: parseFloat((mainDisk.used / 1024 / 1024 / 1024).toFixed(1)),
        total: parseFloat((mainDisk.size / 1024 / 1024 / 1024).toFixed(1)),
        percentage: mainDisk.use,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching system stats:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 