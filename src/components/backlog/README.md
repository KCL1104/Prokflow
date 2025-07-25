# Product Backlog Components

This directory contains the components for the product backlog interface, implementing task 7.3 from the project management platform specification.

## Components

### ProductBacklog

The main component that provides a comprehensive product backlog interface with the following features:

- **Prioritized backlog list** with drag-and-drop reordering using @dnd-kit
- **Advanced filtering and search** by type, priority, assignee, and text search
- **Bulk editing capabilities** for multiple work items
- **Story point estimation interface** with standard Fibonacci sequence and custom values
- **Real-time collaboration** support through callback props

#### Props

```typescript
interface ProductBacklogProps {
  projectId: string;
  workItems: WorkItem[];
  teamMembers: TeamMember[];
  isLoading?: boolean;
  onCreateWorkItem: (data: WorkItemFormData) => Promise<void>;
  onUpdateWorkItem: (id: string, data: Partial<WorkItem>) => Promise<void>;
  onDeleteWorkItem: (id: string) => Promise<void>;
  onReorderWorkItems: (workItemIds: string[]) => Promise<void>;
  onBulkUpdate: (workItemIds: string[], updates: Partial<WorkItem>) => Promise<void>;
}
```

#### Features

- **Drag & Drop Reordering**: Uses @dnd-kit for accessible drag and drop functionality
- **Multi-select**: Checkbox-based selection with select all functionality
- **Advanced Filtering**: Filter by type, priority, assignee, and search text
- **Bulk Operations**: Edit multiple items simultaneously
- **Story Estimation**: Dedicated estimation modal for story points
- **Responsive Design**: Mobile-first design with Tailwind CSS

### BulkEditModal

A modal component for editing multiple work items simultaneously.

#### Features

- **Priority Updates**: Change priority for multiple items
- **Status Changes**: Update status across selected items
- **Assignee Management**: Assign or unassign multiple items
- **Label Management**: Add labels to multiple items
- **Validation**: Form validation with user feedback

#### Props

```typescript
interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  teamMembers: TeamMember[];
  onSubmit: (updates: Partial<WorkItem>) => Promise<void>;
}
```

### EstimationModal

A specialized modal for story point estimation with both standard and custom options.

#### Features

- **Standard Story Points**: Fibonacci sequence (0, 0.5, 1, 2, 3, 5, 8, 13, 21, 34, ?)
- **Custom Estimates**: Allow any numeric value
- **Visual Warnings**: Highlight large stories that should be broken down
- **Estimation Guidelines**: Built-in help text for better estimates
- **Form Validation**: Prevent invalid estimates

#### Props

```typescript
interface EstimationModalProps {
  isOpen: boolean;
  onClose: () => void;
  workItem: WorkItem | null;
  onSubmit: (estimate: number) => Promise<void>;
}
```

## Usage Example

```typescript
import { ProductBacklog } from './components/backlog';

function BacklogPage() {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const handleCreateWorkItem = async (data: WorkItemFormData) => {
    const newItem = await workItemService.createWorkItem(data);
    setWorkItems(prev => [newItem, ...prev]);
  };

  const handleUpdateWorkItem = async (id: string, updates: Partial<WorkItem>) => {
    const updated = await workItemService.updateWorkItem(id, updates);
    setWorkItems(prev => prev.map(item => item.id === id ? updated : item));
  };

  const handleReorderWorkItems = async (workItemIds: string[]) => {
    // Optimistically update UI
    const reordered = workItemIds.map(id => workItems.find(item => item.id === id)!);
    setWorkItems(reordered);
    
    // Persist to backend
    await workItemService.reorderWorkItems(projectId, workItemIds);
  };

  const handleBulkUpdate = async (ids: string[], updates: Partial<WorkItem>) => {
    const promises = ids.map(id => workItemService.updateWorkItem(id, updates));
    const updated = await Promise.all(promises);
    
    setWorkItems(prev => prev.map(item => {
      const updatedItem = updated.find(u => u.id === item.id);
      return updatedItem || item;
    }));
  };

  return (
    <ProductBacklog
      projectId={projectId}
      workItems={workItems}
      teamMembers={teamMembers}
      onCreateWorkItem={handleCreateWorkItem}
      onUpdateWorkItem={handleUpdateWorkItem}
      onDeleteWorkItem={handleDeleteWorkItem}
      onReorderWorkItems={handleReorderWorkItems}
      onBulkUpdate={handleBulkUpdate}
    />
  );
}
```

## Dependencies

- **@dnd-kit/core**: Core drag and drop functionality
- **@dnd-kit/sortable**: Sortable list implementation
- **@dnd-kit/utilities**: CSS utilities for drag and drop
- **@dnd-kit/modifiers**: Drag constraints and modifiers
- **React**: UI framework
- **TypeScript**: Type safety

## Testing

The components include comprehensive test suites covering:

- **Unit Tests**: Individual component functionality
- **Integration Tests**: Component interaction workflows
- **Accessibility Tests**: Screen reader and keyboard navigation
- **Edge Cases**: Empty states, loading states, error handling

Run tests with:
```bash
npm test -- src/components/backlog
```

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Proper ARIA labels and roles
- **Focus Management**: Logical focus order and visible focus indicators
- **Color Contrast**: Sufficient contrast ratios for all text
- **Drag & Drop**: Keyboard alternatives for drag and drop operations

## Performance Considerations

- **Virtualization**: Consider implementing virtual scrolling for large backlogs
- **Memoization**: Components use React.memo() where appropriate
- **Debounced Search**: Search input is debounced to reduce API calls
- **Optimistic Updates**: UI updates immediately before API confirmation
- **Lazy Loading**: Heavy components are loaded on demand

## Future Enhancements

- **Keyboard Shortcuts**: Add hotkeys for common operations
- **Advanced Filtering**: Date ranges, custom fields, saved filters
- **Batch Operations**: More bulk operations (delete, move to sprint)
- **Export/Import**: CSV/Excel export and import functionality
- **Templates**: Work item templates for common patterns
- **Analytics**: Backlog health metrics and insights