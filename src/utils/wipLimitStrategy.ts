import type { WorkflowState, WorkItem } from '../types';

export const WIP_LIMIT_STATUS = {
  NORMAL: 'normal',
  AT_LIMIT: 'at-limit',
  EXCEEDED: 'exceeded',
} as const;

export type WipLimitStatus = typeof WIP_LIMIT_STATUS[keyof typeof WIP_LIMIT_STATUS];

export interface WipLimitChecker {
  checkStatus(stateName: string): WipLimitStatus;
  canAddItem(stateName: string): boolean;
  getStatusMessage(stateName: string): string;
}

export class BoardWipLimitChecker implements WipLimitChecker {
  constructor(
    private workflowStates: WorkflowState[],
    private workItemsByStatus: Record<string, WorkItem[]>
  ) {}

  checkStatus(stateName: string): WipLimitStatus {
    const state = this.workflowStates.find(s => s.name === stateName);
    if (!state?.wipLimit) return WIP_LIMIT_STATUS.NORMAL;
    
    const itemCount = this.workItemsByStatus[stateName]?.length || 0;
    if (itemCount > state.wipLimit) return WIP_LIMIT_STATUS.EXCEEDED;
    if (itemCount === state.wipLimit) return WIP_LIMIT_STATUS.AT_LIMIT;
    return WIP_LIMIT_STATUS.NORMAL;
  }

  canAddItem(stateName: string): boolean {
    const state = this.workflowStates.find(s => s.name === stateName);
    if (!state?.wipLimit) return true;
    
    const itemCount = this.workItemsByStatus[stateName]?.length || 0;
    return itemCount < state.wipLimit;
  }

  getStatusMessage(stateName: string): string {
    const state = this.workflowStates.find(s => s.name === stateName);
    if (!state?.wipLimit) return '';
    
    const itemCount = this.workItemsByStatus[stateName]?.length || 0;
    const status = this.checkStatus(stateName);
    
    switch (status) {
      case WIP_LIMIT_STATUS.EXCEEDED:
        return `WIP Limit: ${itemCount}/${state.wipLimit} (Exceeded!)`;
      case WIP_LIMIT_STATUS.AT_LIMIT:
        return `WIP Limit: ${itemCount}/${state.wipLimit} (At Limit)`;
      default:
        return `WIP Limit: ${itemCount}/${state.wipLimit}`;
    }
  }
}