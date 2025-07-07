'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, CheckCircle, AlertCircle, Play, Pause, RefreshCw } from 'lucide-react';

interface BatchProgressProps {
  projectPath: string;
  onGenerateBatch: (batchSize: number) => Promise<void>;
}

interface ProgressStats {
  completionPercentage: number;
  remainingTips: number;
  averageQuality: number;
  estimatedTimeToComplete: string;
  nextBatchAvailable: string | null;
}

export function BatchProgressWidget({ projectPath, onGenerateBatch }: BatchProgressProps) {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [canGenerate, setCanGenerate] = useState(true);
  const [reason, setReason] = useState<string>('');
  const [nextAvailable, setNextAvailable] = useState<string | null>(null);
  const [batchSize, setBatchSize] = useState(5);

  // Fetch progress stats
  const fetchStats = async () => {
    try {
      console.log('[BatchProgressWidget] Fetching stats for project:', projectPath);
      
      const response = await fetch('/api/ai/ghost-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'progreso',
          projectPath
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[BatchProgressWidget] API response:', data);
        
        // Parse the response to extract stats
        const statsMatch = data.aiResponse?.match(/Progreso general: (\d+)%/);
        const remainingMatch = data.aiResponse?.match(/Tips restantes: (\d+)/);
        const qualityMatch = data.aiResponse?.match(/Calidad promedio: ([\d.]+)/);
        const timeMatch = data.aiResponse?.match(/Tiempo estimado: (.+)/);
        const nextMatch = data.aiResponse?.match(/Próximo lote disponible: (.+)/);

        console.log('[BatchProgressWidget] Parsed matches:', {
          statsMatch: statsMatch?.[1],
          remainingMatch: remainingMatch?.[1],
          qualityMatch: qualityMatch?.[1],
          timeMatch: timeMatch?.[1],
          nextMatch: nextMatch?.[1]
        });

        if (statsMatch && remainingMatch) {
          const newStats = {
            completionPercentage: parseInt(statsMatch[1]),
            remainingTips: parseInt(remainingMatch[1]),
            averageQuality: qualityMatch ? parseFloat(qualityMatch[1]) : 0,
            estimatedTimeToComplete: timeMatch ? timeMatch[1] : 'N/A',
            nextBatchAvailable: nextMatch ? nextMatch[1] : null
          };
          console.log('[BatchProgressWidget] Setting stats:', newStats);
          setStats(newStats);
        } else {
          // Fallback: set default stats if parsing fails
          console.log('[BatchProgressWidget] Parsing failed, setting default stats');
          setStats({
            completionPercentage: 0,
            remainingTips: 101,
            averageQuality: 0,
            estimatedTimeToComplete: 'N/A',
            nextBatchAvailable: null
          });
        }

        // Check if we can generate
        const canGenerateMatch = data.aiResponse?.match(/❌ No se puede generar/);
        if (canGenerateMatch) {
          setCanGenerate(false);
          const reasonMatch = data.aiResponse?.match(/Razón: (.+)/);
          setReason(reasonMatch ? reasonMatch[1] : 'Error desconocido');
          
          const nextMatch = data.aiResponse?.match(/Próximo lote disponible: (.+)/);
          setNextAvailable(nextMatch ? nextMatch[1] : null);
        } else {
          setCanGenerate(true);
          setReason('');
          setNextAvailable(null);
        }
      } else {
        console.error('[BatchProgressWidget] API response not ok:', response.status, response.statusText);
        // Set default stats on API error
        setStats({
          completionPercentage: 0,
          remainingTips: 101,
          averageQuality: 0,
          estimatedTimeToComplete: 'N/A',
          nextBatchAvailable: null
        });
      }
    } catch (error) {
      console.error('[BatchProgressWidget] Error fetching stats:', error);
      // Set default stats on error
      setStats({
        completionPercentage: 0,
        remainingTips: 101,
        averageQuality: 0,
        estimatedTimeToComplete: 'N/A',
        nextBatchAvailable: null
      });
    }
  };

  // Generate batch
  const handleGenerateBatch = async () => {
    setLoading(true);
    try {
      await onGenerateBatch(batchSize);
      // Refresh stats after generation
      setTimeout(fetchStats, 1000);
    } catch (error) {
      console.error('Error generating batch:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and periodic refresh
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!stats) {
        console.log('[BatchProgressWidget] Timeout reached, setting default stats');
        setStats({
          completionPercentage: 0,
          remainingTips: 101,
          averageQuality: 0,
          estimatedTimeToComplete: 'N/A',
          nextBatchAvailable: null
        });
      }
    }, 10000); // 10 second timeout
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [projectPath, stats]);

  if (!stats) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Cargando progreso...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (percentage >= 50) return <Clock className="h-4 w-4 text-yellow-600" />;
    return <Play className="h-4 w-4 text-blue-600" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {getStatusIcon(stats.completionPercentage)}
            Progreso del Proyecto
          </span>
          <Badge variant={stats.completionPercentage >= 80 ? "default" : "secondary"}>
            {stats.completionPercentage}% Completado
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso general</span>
            <span className={getStatusColor(stats.completionPercentage)}>
              {stats.completionPercentage}%
            </span>
          </div>
          <Progress value={stats.completionPercentage} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.remainingTips}</div>
            <div className="text-xs text-muted-foreground">Tips Restantes</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.averageQuality.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Calidad Promedio</div>
          </div>
        </div>

        {/* Time Estimate */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Tiempo estimado para completar: {stats.estimatedTimeToComplete}</span>
        </div>

        {/* Generation Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Tamaño del lote:</label>
            <select
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value))}
              className="px-2 py-1 border rounded text-sm"
              disabled={!canGenerate || loading}
            >
              <option value={1}>1 tip</option>
              <option value={2}>2 tips</option>
              <option value={3}>3 tips</option>
              <option value={4}>4 tips</option>
              <option value={5}>5 tips</option>
            </select>
          </div>

          {!canGenerate && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {reason}
                {nextAvailable && (
                  <div className="mt-1 text-xs">
                    Próximo lote disponible: {nextAvailable}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleGenerateBatch}
              disabled={!canGenerate || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generar Lote
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={fetchStats}
              disabled={loading}
              size="icon"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* System Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>• Máximo 5 tips por lote</div>
          <div>• 30 minutos de espera entre lotes</div>
          <div>• Máximo 3 lotes por día</div>
          <div>• Control de calidad automático</div>
        </div>
      </CardContent>
    </Card>
  );
} 