import type { WorkItem } from '../types';

export const getPriorityColor = (priority: WorkItem['priority']) => {
    const priorityColors = {
        critical: 'bg-red-100 text-red-800 border-red-200',
        high: 'bg-orange-100 text-orange-800 border-orange-200',
        medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        low: 'bg-gray-100 text-gray-800 border-gray-200',
    } as const;

    return priorityColors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Import status constants for consistency
import { STATUS_DETAILS } from '../constants/workItemConstants';

// Create a more robust status color mapping
const STATUS_COLOR_MAP = new Map([
    // Standard statuses
    ['to do', 'bg-gray-100 text-gray-800'],
    ['todo', 'bg-gray-100 text-gray-800'],
    ['backlog', 'bg-gray-100 text-gray-800'],
    ['in progress', 'bg-blue-100 text-blue-800'],
    ['in_progress', 'bg-blue-100 text-blue-800'],
    ['review', 'bg-yellow-100 text-yellow-800'],
    ['testing', 'bg-yellow-100 text-yellow-800'],
    ['done', 'bg-green-100 text-green-800'],
    ['completed', 'bg-green-100 text-green-800'],
]);

export const getStatusColor = (status: string): string => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    // First try exact match from constants
    const statusDetail = STATUS_DETAILS.find(s => s.value === status);
    if (statusDetail) {
        return statusDetail.color;
    }

    // Fallback to normalized lookup
    const normalizedStatus = status.toLowerCase().trim();
    return STATUS_COLOR_MAP.get(normalizedStatus) || 'bg-gray-100 text-gray-800';
};

export const getTypeIcon = (type: string) => {
    switch (type) {
        case 'story':
            return '📖';
        case 'task':
            return '✓';
        case 'bug':
            return '🐛';
        case 'epic':
            return '📦';
        default:
            return '📄';
    }
};

export const formatWorkItemDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
    }).format(date);
};

export const isWorkItemOverdue = (dueDate?: Date) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
};

export const getAssigneeName = (assigneeId: string | undefined, teamMembers: Array<{ userId: string }>): string => {
    if (!assigneeId) return 'Unassigned';
    const member = teamMembers.find(m => m.userId === assigneeId);
    return member ? `User ${member.userId.slice(0, 8)}...` : 'Unknown User';
};