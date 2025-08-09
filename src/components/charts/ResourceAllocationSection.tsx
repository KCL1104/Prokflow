import React, { useState, useMemo } from 'react';
import { ResourceAllocationChart } from './ResourceAllocationChart';
import { Loading } from '../common/Loading';
import { Icon } from '../common/Icon';
import { Button } from '../ui/button';
import { useTeamMembers } from '../../hooks/useTeamMembers';
import type { WorkItem } from '../../types';

interface ResourceAllocationSectionProps {
  projectId: string;
  workItems: WorkItem[];
  onMemberClick?: (memberId: string) => void;
  className?: string;
}

interface MemberWorkloadDetails {
  memberId: string;
  memberName: string;
  email: string;
  assignedTasks: WorkItem[];
  completedTasks: WorkItem[];
  activeTasks: WorkItem[];
  totalEstimate: number;
  remainingWork: number;
  utilization: number;
  isOverAllocated: boolean;
}

export const ResourceAllocationSection: React.FC<ResourceAllocationSectionProps> = ({
  projectId,
  workItems,
  onMemberClick,
  className = ''
}) => {
  const { teamMembers, loading, error } = useTeamMembers(projectId);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Calculate detailed workload information
  const memberWorkloads = useMemo((): MemberWorkloadDetails[] => {
    return teamMembers.map(member => {
      const assignedTasks = workItems.filter(item => item.assigneeId === member.userId);
      const completedTasks = assignedTasks.filter(item => item.status === 'Done');
      const activeTasks = assignedTasks.filter(item => item.status !== 'Done');
      
      const totalEstimate = assignedTasks.reduce((sum, item) => sum + (item.estimate || 0), 0);
      const remainingWork = activeTasks.reduce((sum, item) => sum + (item.estimate || 0), 0);
      
      const currentCapacity = 40; // 40 hours per week
      const utilization = currentCapacity > 0 ? (remainingWork / currentCapacity) * 100 : 0;
      const isOverAllocated = utilization > 100;

      return {
        memberId: member.userId,
        memberName: member.user.fullName || member.user.email,
        email: member.user.email,
        assignedTasks,
        completedTasks,
        activeTasks,
        totalEstimate,
        remainingWork,
        utilization,
        isOverAllocated,
      };
    });
  }, [teamMembers, workItems]);

  const selectedMemberDetails = useMemo(() => {
    if (!selectedMemberId) return null;
    return memberWorkloads.find(member => member.memberId === selectedMemberId);
  }, [selectedMemberId, memberWorkloads]);

  const handleMemberClick = (memberId: string) => {
    setSelectedMemberId(memberId);
    setShowDetails(true);
    onMemberClick?.(memberId);
  };

  const handleRebalanceRecommendations = () => {
    // Find over-allocated and under-allocated members
    const overAllocated = memberWorkloads.filter(member => member.isOverAllocated);
    const underAllocated = memberWorkloads.filter(member => member.utilization < 60);
    
    if (overAllocated.length === 0) {
      alert('No over-allocated team members found.');
      return;
    }

    let recommendations = 'Resource Rebalancing Recommendations:\n\n';
    
    overAllocated.forEach(member => {
      recommendations += `🔴 ${member.memberName} (${Math.round(member.utilization)}% utilized)\n`;
      recommendations += `   - Consider reassigning ${Math.ceil((member.utilization - 100) / 100 * 40)} hours of work\n`;
      recommendations += `   - Active tasks: ${member.activeTasks.length}\n\n`;
    });

    if (underAllocated.length > 0) {
      recommendations += 'Available for additional work:\n';
      underAllocated.forEach(member => {
        const availableCapacity = Math.floor((100 - member.utilization) / 100 * 40);
        recommendations += `🟢 ${member.memberName} (${Math.round(member.utilization)}% utilized, ${availableCapacity}h available)\n`;
      });
    }

    alert(recommendations);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="h-64 flex items-center justify-center">
          <Loading size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="h-64 flex items-center justify-center bg-red-50 rounded-md">
          <div className="text-center text-red-500">
            <Icon name="alert-circle" className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Error loading team data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Resource Allocation Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Resource Allocation</h3>
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRebalanceRecommendations}
            >
              <Icon name="zap" className="h-4 w-4 mr-2" />
              Rebalance
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Icon name="list" className="h-4 w-4 mr-2" />
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>
        </div>

        <ResourceAllocationChart
          workItems={workItems}
          teamMembers={teamMembers}
          onMemberClick={handleMemberClick}
        />
      </div>

      {/* Detailed Member Information */}
      {showDetails && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Member Details</h3>
          
          {selectedMemberDetails ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedMemberDetails.memberName}</h4>
                  <p className="text-sm text-gray-600">{selectedMemberDetails.email}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedMemberDetails.isOverAllocated 
                    ? 'bg-red-100 text-red-800' 
                    : selectedMemberDetails.utilization > 80
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {Math.round(selectedMemberDetails.utilization)}% Utilized
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Total Tasks</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedMemberDetails.assignedTasks.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedMemberDetails.completedTasks.length}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Active Tasks</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedMemberDetails.activeTasks.length}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Remaining Work</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedMemberDetails.remainingWork}h</p>
                </div>
              </div>

              {/* Active Tasks List */}
              {selectedMemberDetails.activeTasks.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Active Tasks</h5>
                  <div className="space-y-2">
                    {selectedMemberDetails.activeTasks.slice(0, 5).map(task => (
                      <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          <p className="text-xs text-gray-600">{task.status} • {task.priority} priority</p>
                        </div>
                        <div className="text-sm text-gray-600">
                          {task.estimate || 0}h
                        </div>
                      </div>
                    ))}
                    {selectedMemberDetails.activeTasks.length > 5 && (
                      <p className="text-sm text-gray-600">
                        +{selectedMemberDetails.activeTasks.length - 5} more tasks
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="users" className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Click on a team member in the chart above to see details</p>
            </div>
          )}
        </div>
      )}

      {/* Team Overview Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Overview</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Tasks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaining Work
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {memberWorkloads.map(member => (
                <tr 
                  key={member.memberId}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleMemberClick(member.memberId)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{member.memberName}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            member.isOverAllocated ? 'bg-red-500' :
                            member.utilization > 80 ? 'bg-yellow-500' :
                            member.utilization > 60 ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(member.utilization, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900">{Math.round(member.utilization)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.activeTasks.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.remainingWork}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      member.isOverAllocated 
                        ? 'bg-red-100 text-red-800' 
                        : member.utilization > 80
                        ? 'bg-yellow-100 text-yellow-800'
                        : member.utilization > 60
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {member.isOverAllocated ? 'Over-allocated' :
                       member.utilization > 80 ? 'High utilization' :
                       member.utilization > 60 ? 'Normal' : 'Available'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};