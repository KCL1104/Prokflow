/**
 * Performance Monitoring System
 * Tracks and reports performance metrics for production optimization
 */

import { config, performanceLog } from '../config/environment';

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];

  public recordMetric(name: string, value: number, metadata?: Record<string, unknown>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date(),
      metadata
    };

    this.metrics.push(metric);
    
    if (config.app.debug) {
      performanceLog(name, value);
    }

    // Keep metrics array manageable
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-50);
    }
  }

  public startTimer(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration);
    };
  }

  public measureAsync<T>(name: string, asyncFn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    
    return asyncFn().finally(() => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration);
    });
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions
export const recordMetric = (name: string, value: number, metadata?: Record<string, unknown>) => {
  performanceMonitor.recordMetric(name, value, metadata);
};

export const startTimer = (name: string) => {
  return performanceMonitor.startTimer(name);
};

export const measureAsync = <T>(name: string, asyncFn: () => Promise<T>) => {
  return performanceMonitor.measureAsync(name, asyncFn);
};