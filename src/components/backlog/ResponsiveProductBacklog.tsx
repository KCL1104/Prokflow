import { useState, useCallback } from 'react';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Loading } from '../common/Loading';
import { Icon } from '../common/Icon';
import { Button } from '../ui/button';
import { ResponsiveModal, ResponsiveDrawer } from '../common/ResponsiveModal';
import { ResponsiveContainer, ResponsiveStack } from '../layout/ResponsiveLayout';
import { useResponsive } from '../../hooks/useResponsive';
import { useWorkItems } from '../../hooks/useWorkItems';
import { useBacklogOperations } from '../../hooks/useBacklogOperations';
import { useBacklogFiltering } from '../../hooks/useBacklogFiltering';
import { useBacklogSelection } from '../../hooks/useBacklogSelection';
import type { WorkItem, CreateWorkItemRequest, TeamMember } from '../../types';
import type { WorkItemFormData } from '../../types/forms';

interface ResponsiveProductBacklogProps {
  projectId: string;
  teamMembers?: TeamMember[];
  className?: string;
}

interface MobileBacklogItemProps {
  item: WorkItem;
  index: number;
  isSelected: boolean;
  isSelectionMode: boolean;
  onTap: () => void;
  onLongPress: () => void;
}

interface TabletBacklogListProps {
  items: WorkItem[];
  selectedItems: Set<string>;
  isSelectionMode: boolean;
  onItemSelect: (itemId: string, selected: boolean) => void;
  onItemClick: (item: WorkItem) => void;
}

interface DesktopBacklogTableProps {
  items: WorkItem[];
  selectedItems: Set<string>;
  isSelectionMode: boolean;
  onItemSelect: (itemId: string, selected: boolean) => void;
  onItemClick: (item: WorkItem) => void;
}

interface BacklogFiltersProps {
  filters: Record<string, unknown>;
  onFiltersChange: (filters: Record<string, unknown>) => void;
  workItems: WorkItem[];
  compact?: boolean;
}

interface WorkItemFormProps {
  onSave: (data: WorkItemFormData) => Promise<void>;
  onCancel: () => void;
}

interface WorkItemDetailsProps {
  item: WorkItem;
  onEdit: (item: WorkItem) => void;
  onDelete: (item: WorkItem) => void;
}

export function ResponsiveProductBacklog({
  projectId,
  teamMembers: _teamMembers = [],
  className = ''
}: ResponsiveProductBacklogProps) {
  const { isMobile, isTablet } = useResponsive();
  
  const { workItems, loading, error, createWorkItem, updateWorkItem } = useWorkItems(projectId);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { filteredWorkItems } = useBacklogFiltering({ workItems });

  const { selectedItems, handleSelectItem, handleSelectAll, clearSelection } = useBacklogSelection({ 
    filteredWorkItems 
  });

  const operations = useBacklogOperations({
    onReorderWorkItems: async (workItemIds: string[]) => {
      // Implementation would go here
      console.log('Reorder work items:', workItemIds);
    },
    onBulkUpdate: async (workItemIds: string[], updates: Partial<WorkItem>) => {
      // Implementation would go here
      console.log('Bulk update:', workItemIds, updates);
    },
    onUpdateWorkItem: async (id: string, data: Partial<WorkItem>) => {
      await updateWorkItem(id, data);
    },
    onDeleteWorkItem: async (id: string) => {
      // Implementation would go here
      console.log('Delete work item:', id);
    }
  });

  // Mobile-specific handlers
  const handleItemLongPress = useCallback((item: WorkItem) => {
    if (isMobile && !isSelectionMode) {
      setIsSelectionMode(true);
      handleSelectItem(item.id, true);
    }
  }, [isMobile, isSelectionMode, handleSelectItem]);

  const handleItemTap = useCallback((item: WorkItem) => {
    if (isSelectionMode) {
      handleSelectItem(item.id, !selectedItems.has(item.id));
    } else {
      setSelectedItem(item);
    }
  }, [isSelectionMode, handleSelectItem, selectedItems]);

  const handleSelectAllItems = useCallback(() => {
    handleSelectAll();
  }, [handleSelectAll]);

  const handleExitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    clearSelection();
  }, [clearSelection]);

  // Drag and drop handlers
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    await operations.handleDragEnd(event, filteredWorkItems);
  }, [operations, filteredWorkItems]);

  const handleCreateWorkItem = useCallback(async (data: WorkItemFormData) => {
    if (!data.projectId) {
      throw new Error('Project ID is required');
    }
    const createData: CreateWorkItemRequest = {
      ...data,
      projectId: data.projectId,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined
    };
    await createWorkItem(createData);
    setShowCreateModal(false);
  }, [createWorkItem]);

  const handleDeleteWorkItem = useCallback(async (item: WorkItem) => {
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      await operations.handleDeleteItem(item);
      setSelectedItem(null);
    }
  }, [operations]);

  if (loading) {
    return (
      <ResponsiveContainer>
        <div className="flex items-center justify-center py-12">
          <Loading size="large" />
        </div>
      </ResponsiveContainer>
    );
  }

  if (error) {
    return (
      <ResponsiveContainer>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <Icon name="alert-circle" className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </ResponsiveContainer>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Backlog</h1>
            <p className="text-sm text-gray-600">
              {filteredWorkItems.length} items
              {isSelectionMode && ` • ${selectedItems.size} selected`}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {isSelectionMode ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSelectAllItems}
                >
                  All
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExitSelectionMode}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowFilters(true)}
                >
                  <Icon name="filter" className="h-4 w-4" />
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Icon name="plus" className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search backlog items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Selection Actions */}
        {isSelectionMode && selectedItems.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedItems.size} items selected
              </span>
              <div className="flex space-x-2">
                <Button size="sm" variant="secondary">
                  Edit
                </Button>
                <Button size="sm" variant="secondary">
                  Move
                </Button>
                <Button size="sm" variant="secondary" className="text-red-600">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Backlog Items */}
        <div className="space-y-2">
          {filteredWorkItems.map((item, index) => (
            <MobileBacklogItem
              key={item.id}
              item={item}
              index={index}
              isSelected={selectedItems.has(item.id)}
              isSelectionMode={isSelectionMode}
              onTap={() => handleItemTap(item)}
              onLongPress={() => handleItemLongPress(item)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredWorkItems.length === 0 && (
          <div className="text-center py-12">
            <Icon name="list" className="mx-auto text-gray-300 mb-4 h-12 w-12" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {workItems.length === 0 ? 'No backlog items yet' : 'No matching items'}
            </h3>
            <p className="text-gray-600 mb-6">
              {workItems.length === 0
                ? 'Create your first backlog item to get started.'
                : 'Try adjusting your search or filters.'
              }
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create First Item
            </Button>
          </div>
        )}

        {/* Mobile Modals */}
        <ResponsiveDrawer
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          title="Filter Items"
          position="bottom"
        >
          <BacklogFilters
            filters={{}}
            onFiltersChange={() => {}}
            workItems={workItems}
            compact
          />
        </ResponsiveDrawer>

        <ResponsiveModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Work Item"
          size="full"
        >
          <WorkItemForm
            onSave={handleCreateWorkItem}
            onCancel={() => setShowCreateModal(false)}
          />
        </ResponsiveModal>

        <ResponsiveDrawer
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title="Work Item Details"
          position="bottom"
          size="lg"
        >
          {selectedItem && (
            <WorkItemDetails
              item={selectedItem}
              onEdit={(_item) => {
                setSelectedItem(null);
                // Open edit modal
              }}
              onDelete={handleDeleteWorkItem}
            />
          )}
        </ResponsiveDrawer>
      </div>
    );
  }

  // Tablet and Desktop Layout
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <ResponsiveStack
        direction={{ base: 'column', md: 'row' }}
        justify="between"
        align="start"
        spacing={4}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Backlog</h1>
          <p className="text-gray-600 mt-1">
            Prioritize and manage your work items
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Icon name="filter" className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Icon name="plus" className="h-4 w-4 mr-2" />
            Create Item
          </Button>
        </div>
      </ResponsiveStack>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search backlog items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <BacklogFilters
              filters={{}}
              onFiltersChange={() => {}}
              workItems={workItems}
            />
          </div>
        )}
      </div>

      {/* Backlog Table/List */}
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredWorkItems.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {isTablet ? (
              <TabletBacklogList
                items={filteredWorkItems}
                selectedItems={selectedItems}
                isSelectionMode={isSelectionMode}
                onItemSelect={handleSelectItem}
                onItemClick={setSelectedItem}
              />
            ) : (
              <DesktopBacklogTable
                items={filteredWorkItems}
                selectedItems={selectedItems}
                isSelectionMode={isSelectionMode}
                onItemSelect={handleSelectItem}
                onItemClick={setSelectedItem}
              />
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Empty State */}
      {filteredWorkItems.length === 0 && (
        <div className="text-center py-12">
          <Icon name="list" className="mx-auto text-gray-300 mb-4 h-16 w-16" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {workItems.length === 0 ? 'No backlog items yet' : 'No matching items'}
          </h3>
          <p className="text-gray-600 mb-6">
            {workItems.length === 0
              ? 'Create your first backlog item to get started.'
              : 'Try adjusting your search or filters.'
            }
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            Create First Item
          </Button>
        </div>
      )}

      {/* Desktop Modals */}
      <ResponsiveModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Work Item"
        size="lg"
      >
        <WorkItemForm
          onSave={handleCreateWorkItem}
          onCancel={() => setShowCreateModal(false)}
        />
      </ResponsiveModal>
    </div>
  );
}

// Mobile-specific components would be implemented here
function MobileBacklogItem({ 
  item, 
  index: _index, 
  isSelected, 
  isSelectionMode, 
  onTap, 
  onLongPress 
}: MobileBacklogItemProps) {
  return (
    <div 
      className={`p-4 border rounded-lg ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
      onClick={onTap}
      onTouchStart={() => {
        // Handle long press for mobile
        const timer = setTimeout(onLongPress, 500);
        const cleanup = () => clearTimeout(timer);
        document.addEventListener('touchend', cleanup, { once: true });
        document.addEventListener('touchmove', cleanup, { once: true });
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{item.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
        </div>
        {isSelectionMode && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="ml-2"
          />
        )}
      </div>
    </div>
  );
}

function TabletBacklogList({ 
  items, 
  selectedItems, 
  isSelectionMode, 
  onItemSelect, 
  onItemClick 
}: TabletBacklogListProps) {
  return (
    <div className="divide-y divide-gray-200">
      {items.map(item => (
        <div key={item.id} className="p-4 hover:bg-gray-100 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {isSelectionMode && (
              <input
                type="checkbox"
                checked={selectedItems.has(item.id)}
                onChange={(e) => onItemSelect(item.id, e.target.checked)}
              />
            )}
            <div className="flex-1" onClick={() => onItemClick(item)}>
              <h4 className="font-medium text-gray-900">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DesktopBacklogTable({ 
  items, 
  selectedItems, 
  isSelectionMode, 
  onItemSelect, 
  onItemClick 
}: DesktopBacklogTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-white border-b-2 border-gray-300">
          <tr>
            {isSelectionMode && <th className="w-12 px-6 py-3"></th>}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estimate
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map(item => (
            <tr key={item.id} className="hover:bg-gray-100">
              {isSelectionMode && (
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={(e) => onItemSelect(item.id, e.target.checked)}
                  />
                </td>
              )}
              <td className="px-6 py-4 cursor-pointer" onClick={() => onItemClick(item)}>
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 capitalize">{item.type}</td>
              <td className="px-6 py-4 text-sm text-gray-900 capitalize">{item.priority}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{item.estimate || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BacklogFilters({ 
  filters: _filters, 
  onFiltersChange: _onFiltersChange, 
  workItems: _workItems, 
  compact 
}: BacklogFiltersProps) {
  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <select className="w-full border border-gray-300 rounded-md px-3 py-2">
          <option value="all">All Types</option>
          <option value="story">Story</option>
          <option value="task">Task</option>
          <option value="bug">Bug</option>
          <option value="epic">Epic</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Priority
        </label>
        <select className="w-full border border-gray-300 rounded-md px-3 py-2">
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>
  );
}

function WorkItemForm({ onSave, onCancel }: WorkItemFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      title,
      description,
      type: 'story',
      priority: 'medium',
      labels: []
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          rows={3}
        />
      </div>
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Create
        </Button>
      </div>
    </form>
  );
}

function WorkItemDetails({ item, onEdit, onDelete }: WorkItemDetailsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
        <p className="text-gray-600 mt-1">{item.description}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm font-medium text-gray-500">Type</span>
          <p className="text-sm text-gray-900 capitalize">{item.type}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Priority</span>
          <p className="text-sm text-gray-900 capitalize">{item.priority}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Estimate</span>
          <p className="text-sm text-gray-900">{item.estimate || 'Not set'}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Status</span>
          <p className="text-sm text-gray-900">{item.status}</p>
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="secondary" onClick={() => onEdit(item)}>
          Edit
        </Button>
        <Button variant="destructive" onClick={() => onDelete(item)}>
          Delete
        </Button>
      </div>
    </div>
  );
}
