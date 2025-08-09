import { useMemo } from 'react';
import type { WorkItem } from '../types';

interface GanttTask {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  dependencies: string[];
  assignee?: string;
  priority: WorkItem['priority'];
  status: string;
  estimate: number;
  actualTime: number;
  isCriticalPath: boolean;
  isMilestone: boolean;
}

interface CriticalPathResult {
  path: string[];
  duration: number;
}

export const useGanttData = (workItems: WorkItem[]) => {
  // Transform work items to Gantt tasks
  const ganttTasks = useMemo((): GanttTask[] => {
    return workItems
      .filter(item => item.dueDate) // Only show items with due dates
      .map(item => {
        const startDate = item.createdAt;
        const endDate = item.dueDate!;
        const progress = item.status === 'Done' ? 100 : 
                        item.actualTime && item.estimate ? (item.actualTime / item.estimate) * 100 : 0;

        return {
          id: item.id,
          title: item.title,
          startDate,
          endDate,
          progress: Math.min(progress, 100),
          dependencies: item.dependencies,
          assignee: item.assigneeId,
          priority: item.priority,
          status: item.status,
          estimate: item.estimate || 0,
          actualTime: item.actualTime || 0,
          isCriticalPath: false, // Will be calculated
          isMilestone: item.type === 'epic' || item.estimate === 0
        };
      })
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [workItems]);

  // Calculate critical path using topological sort and longest path algorithm
  const criticalPath = useMemo((): CriticalPathResult => {
    if (ganttTasks.length === 0) {
      return { path: [], duration: 0 };
    }

    // Build adjacency list for dependencies
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    const taskMap = new Map<string, GanttTask>();

    // Initialize
    ganttTasks.forEach(task => {
      graph.set(task.id, []);
      inDegree.set(task.id, 0);
      taskMap.set(task.id, task);
    });

    // Build dependency graph
    ganttTasks.forEach(task => {
      task.dependencies.forEach(depId => {
        if (graph.has(depId)) {
          graph.get(depId)!.push(task.id);
          inDegree.set(task.id, (inDegree.get(task.id) || 0) + 1);
        }
      });
    });

    // Topological sort with longest path calculation
    const queue: string[] = [];
    const distances = new Map<string, number>();
    const predecessors = new Map<string, string>();

    // Find nodes with no incoming edges
    inDegree.forEach((degree, taskId) => {
      if (degree === 0) {
        queue.push(taskId);
        distances.set(taskId, taskMap.get(taskId)?.estimate || 0);
      }
    });

    // Process nodes in topological order
    while (queue.length > 0) {
      const currentId = queue.shift()!;

      const currentDistance = distances.get(currentId) || 0;

      graph.get(currentId)?.forEach(neighborId => {
        const neighborTask = taskMap.get(neighborId)!;
        const newDistance = currentDistance + (neighborTask.estimate || 0);
        
        if (!distances.has(neighborId) || newDistance > distances.get(neighborId)!) {
          distances.set(neighborId, newDistance);
          predecessors.set(neighborId, currentId);
        }

        inDegree.set(neighborId, (inDegree.get(neighborId) || 0) - 1);
        if (inDegree.get(neighborId) === 0) {
          queue.push(neighborId);
        }
      });
    }

    // Find the task with maximum distance (end of critical path)
    let maxDistance = 0;
    let endTask = '';
    distances.forEach((distance, taskId) => {
      if (distance > maxDistance) {
        maxDistance = distance;
        endTask = taskId;
      }
    });

    // Reconstruct critical path
    const path: string[] = [];
    let current = endTask;
    while (current) {
      path.unshift(current);
      current = predecessors.get(current) || '';
    }

    return { path, duration: maxDistance };
  }, [ganttTasks]);

  // Update critical path flags
  const tasksWithCriticalPath = useMemo(() => {
    return ganttTasks.map(task => ({
      ...task,
      isCriticalPath: criticalPath.path.includes(task.id)
    }));
  }, [ganttTasks, criticalPath]);

  return {
    ganttTasks,
    criticalPath,
    tasksWithCriticalPath
  };
};