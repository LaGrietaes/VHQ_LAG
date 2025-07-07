// Progress Tracker for Ghost Agent - Batch Generation System
export interface TipProgress {
  projectPath: string;
  totalPlanned: number;
  currentGenerated: number;
  lastGeneratedNumber: number;
  batchSize: number;
  lastBatchDate: string;
  qualityScore: number;
  notes: string[];
}

export interface BatchConfig {
  maxBatchSize: number;
  minQualityScore: number;
  cooldownMinutes: number;
  maxDailyBatches: number;
}

export class ProgressTracker {
  private static readonly STORAGE_KEY = 'ghost_agent_progress';
  private static readonly DEFAULT_CONFIG: BatchConfig = {
    maxBatchSize: 5,
    minQualityScore: 0.8,
    cooldownMinutes: 30,
    maxDailyBatches: 3
  };

  // Get progress for a specific project
  static async getProgress(projectPath: string): Promise<TipProgress | null> {
    try {
      const allProgress = await this.getAllProgress();
      return allProgress.find(p => p.projectPath === projectPath) || null;
    } catch (error) {
      console.error('[ProgressTracker] Error getting progress:', error);
      return null;
    }
  }

  // Update progress after generating a batch
  static async updateProgress(
    projectPath: string, 
    generatedCount: number, 
    lastTipNumber: number,
    qualityScore: number = 0.8
  ): Promise<TipProgress> {
    try {
      const allProgress = await this.getAllProgress();
      let progress = allProgress.find(p => p.projectPath === projectPath);

      if (!progress) {
        // Create new progress entry
        progress = {
          projectPath,
          totalPlanned: 101, // 101 tips total
          currentGenerated: 0,
          lastGeneratedNumber: 0,
          batchSize: 5,
          lastBatchDate: new Date().toISOString(),
          qualityScore: 0,
          notes: []
        };
        allProgress.push(progress);
      }

      // Update progress
      progress.currentGenerated += generatedCount;
      progress.lastGeneratedNumber = lastTipNumber;
      progress.lastBatchDate = new Date().toISOString();
      progress.qualityScore = (progress.qualityScore + qualityScore) / 2; // Average
      progress.notes.push(`Generated batch of ${generatedCount} tips (${new Date().toISOString()})`);

      // Keep only last 10 notes
      if (progress.notes.length > 10) {
        progress.notes = progress.notes.slice(-10);
      }

      await this.saveAllProgress(allProgress);
      return progress;
    } catch (error) {
      console.error('[ProgressTracker] Error updating progress:', error);
      throw error;
    }
  }

  // Check if we can generate a new batch
  static async canGenerateBatch(projectPath: string, requestedBatchSize: number): Promise<{
    canGenerate: boolean;
    reason?: string;
    suggestedBatchSize?: number;
    nextAvailableTime?: string;
  }> {
    try {
      const progress = await this.getProgress(projectPath);
      const config = this.DEFAULT_CONFIG;

      if (!progress) {
        return {
          canGenerate: true,
          suggestedBatchSize: Math.min(requestedBatchSize, config.maxBatchSize)
        };
      }

      // Check if we've reached the total planned
      if (progress.currentGenerated >= progress.totalPlanned) {
        return {
          canGenerate: false,
          reason: 'Ya se han generado todos los tips planeados (101)'
        };
      }

      // Check cooldown period
      const lastBatchTime = new Date(progress.lastBatchDate);
      const cooldownMs = config.cooldownMinutes * 60 * 1000;
      const timeSinceLastBatch = Date.now() - lastBatchTime.getTime();

      if (timeSinceLastBatch < cooldownMs) {
        const nextAvailable = new Date(lastBatchTime.getTime() + cooldownMs);
        return {
          canGenerate: false,
          reason: `Debes esperar ${config.cooldownMinutes} minutos entre lotes`,
          nextAvailableTime: nextAvailable.toISOString()
        };
      }

      // Check daily batch limit
      const today = new Date().toDateString();
      const todayBatches = progress.notes.filter(note => 
        note.includes(today) && note.includes('Generated batch')
      ).length;

      if (todayBatches >= config.maxDailyBatches) {
        return {
          canGenerate: false,
          reason: `Límite diario alcanzado (${config.maxDailyBatches} lotes por día)`
        };
      }

      // Check quality score
      if (progress.qualityScore < config.minQualityScore) {
        return {
          canGenerate: false,
          reason: `Calidad insuficiente (${progress.qualityScore.toFixed(2)} < ${config.minQualityScore})`
        };
      }

      // Suggest appropriate batch size
      const remainingTips = progress.totalPlanned - progress.currentGenerated;
      const suggestedBatchSize = Math.min(
        requestedBatchSize,
        config.maxBatchSize,
        remainingTips
      );

      return {
        canGenerate: true,
        suggestedBatchSize
      };
    } catch (error) {
      console.error('[ProgressTracker] Error checking batch generation:', error);
      return {
        canGenerate: false,
        reason: 'Error al verificar progreso'
      };
    }
  }

  // Get generation statistics
  static async getStats(projectPath: string): Promise<{
    progress: TipProgress | null;
    stats: {
      completionPercentage: number;
      remainingTips: number;
      averageQuality: number;
      estimatedTimeToComplete: string;
      nextBatchAvailable: string | null;
    };
  }> {
    try {
      const progress = await this.getProgress(projectPath);
      
      if (!progress) {
        return {
          progress: null,
          stats: {
            completionPercentage: 0,
            remainingTips: 101,
            averageQuality: 0,
            estimatedTimeToComplete: 'N/A',
            nextBatchAvailable: null
          }
        };
      }

      const completionPercentage = (progress.currentGenerated / progress.totalPlanned) * 100;
      const remainingTips = progress.totalPlanned - progress.currentGenerated;
      
      // Estimate time to complete (assuming 5 tips per batch, 30 min cooldown)
      const remainingBatches = Math.ceil(remainingTips / 5);
      const estimatedMinutes = remainingBatches * 30;
      const estimatedTimeToComplete = this.formatTime(estimatedMinutes);

      // Check next available time
      const lastBatchTime = new Date(progress.lastBatchDate);
      const cooldownMs = this.DEFAULT_CONFIG.cooldownMinutes * 60 * 1000;
      const nextAvailable = new Date(lastBatchTime.getTime() + cooldownMs);
      const nextBatchAvailable = nextAvailable > new Date() ? nextAvailable.toISOString() : null;

      return {
        progress,
        stats: {
          completionPercentage: Math.round(completionPercentage),
          remainingTips,
          averageQuality: Math.round(progress.qualityScore * 100) / 100,
          estimatedTimeToComplete,
          nextBatchAvailable
        }
      };
    } catch (error) {
      console.error('[ProgressTracker] Error getting stats:', error);
      throw error;
    }
  }

  // Get all progress data
  private static async getAllProgress(): Promise<TipProgress[]> {
    try {
      // In a real implementation, this would use a database
      // For now, we'll use a simple in-memory approach
      const stored = globalThis.ghostAgentProgress || [];
      return stored;
    } catch (error) {
      console.error('[ProgressTracker] Error getting all progress:', error);
      return [];
    }
  }

  // Save all progress data
  private static async saveAllProgress(progress: TipProgress[]): Promise<void> {
    try {
      // In a real implementation, this would save to a database
      // For now, we'll use a simple in-memory approach
      globalThis.ghostAgentProgress = progress;
    } catch (error) {
      console.error('[ProgressTracker] Error saving progress:', error);
      throw error;
    }
  }

  // Format time in a human-readable way
  private static formatTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minutos`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    } else {
      const days = Math.floor(minutes / 1440);
      const remainingHours = Math.floor((minutes % 1440) / 60);
      return `${days}d ${remainingHours}h`;
    }
  }

  // Reset progress for a project (for testing)
  static async resetProgress(projectPath: string): Promise<void> {
    try {
      const allProgress = await this.getAllProgress();
      const filtered = allProgress.filter(p => p.projectPath !== projectPath);
      await this.saveAllProgress(filtered);
    } catch (error) {
      console.error('[ProgressTracker] Error resetting progress:', error);
      throw error;
    }
  }
}

// Extend global to store progress (simple in-memory storage)
declare global {
  var ghostAgentProgress: TipProgress[] | undefined;
} 