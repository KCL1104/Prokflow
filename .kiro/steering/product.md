---
inclusion: always
---

# Project Management Platform

A comprehensive project management web application supporting multiple
methodologies (Scrum, Kanban, Waterfall, Custom) with real-time collaboration
and analytics. Currently implementing core backlog management, sprint planning,
and board views.

## Product Conventions

### User Experience Principles

- **Mobile-first responsive design** using Tailwind CSS breakpoints with
  touch-friendly interactions
- **Real-time updates** via Supabase subscriptions for collaborative features
  (planned for task 15)
- **Progressive disclosure** - show essential information first, details on
  demand
- **Consistent navigation patterns** across all project methodologies with
  project-specific routing
- **Accessibility compliance** (WCAG 2.1 AA) for all interactive elements
  including keyboard navigation and screen readers
- **Optimistic UI updates** with error recovery for better perceived performance

### Feature Architecture

- **Multi-methodology support**: Each methodology
  (Scrum/Kanban/Waterfall/Custom) shares core entities but has specialized views
  and workflows
- **Project-specific routing**: All feature routes are scoped to projects
  (`/projects/:projectId/backlog`)
- **Role-based access**: Project Owner, Team Lead, Team Member, Viewer roles
  with granular permissions (database schema ready)
- **Real-time collaboration**: Live cursors, instant updates, and conflict
  resolution for concurrent editing (planned)
- **Audit trail**: All project changes tracked with user attribution and
  timestamps via database triggers

## Code Style & Patterns

### Component Design

- **Compound components** for complex UI (e.g., `ProductBacklog.Header`,
  `WorkItemCard.Actions`)
- **Loading states and error boundaries** for all async operations with
  user-friendly error messages
- **Co-located tests** in `__tests__` folders with comprehensive coverage
- **React.memo()** for expensive renders, especially in drag-and-drop interfaces
  and large lists
- **Custom hooks** for separation of concerns (e.g., `useBacklogModals`,
  `useBacklogOperations`)

### State Management

- **Local component state** for UI-only concerns (modals, form inputs, selection
  state)
- **Custom hooks** for business logic and API interactions with proper error
  handling
- **Service layer** for direct Supabase client operations with optimistic
  updates
- **Form validation** using custom `useFormValidation` hook with real-time
  feedback

### Data Patterns

- **Direct Supabase client** operations in service layer (no repository pattern
  currently)
- **Optimistic updates** with error recovery for better UX (implemented in
  backlog)
- **Proper error handling** with user-friendly messages and retry mechanisms
- **Batch operations** for bulk updates (implemented in backlog bulk edit)
- **Type-safe API calls** with comprehensive TypeScript interfaces

### Security & Performance

- **Row Level Security (RLS)** enforced at database level with comprehensive
  policies
- **Input validation** on both client and server with TypeScript type guards
- **Lazy loading** for heavy components (Gantt charts, large datasets) - planned
- **Loading skeletons** and proper loading states for better UX
- **Drag-and-drop optimization** using @dnd-kit with keyboard accessibility

## Business Rules

### Project Lifecycle

- **Project ownership**: Projects must have at least one team member with Owner
  role
- **Methodology changes**: Can be changed only by Project Owners (database
  schema supports this)
- **Project archival**: Archived projects are read-only but maintain full
  history
- **Project deletion**: Requires confirmation and cascades to all related data
  via foreign keys

### Work Item Management

- **Backlog prioritization**: Work items can be reordered via drag-and-drop with
  automatic position updates
- **Story point estimation**: Planning poker-style estimation with Fibonacci
  sequence (1, 2, 3, 5, 8, 13, 21)
- **Bulk operations**: Multiple work items can be updated simultaneously
  (priority, assignee, labels, status)
- **Work item lifecycle**: Items can be moved between backlog and sprints with
  proper state transitions

### Team Management

- **Multi-project membership**: Team members can be assigned to multiple
  projects with different roles
- **Capacity planning**: Considers member availability across all projects
  (planned for sprint management)
- **Role-based permissions**: Team leads can manage members within their
  projects only
- **User invitations**: Expire after 7 days (database schema supports this)

### Workflow Constraints

- **Scrum**: Sprints cannot overlap, must have defined start/end dates (database
  constraints enforced)
- **Kanban**: WIP limits enforced per column, configurable by team leads
  (planned)
- **Waterfall**: Phase dependencies must be respected, no parallel execution
  (planned)
- **Custom**: Flexible rules defined per project, validated at runtime via
  workflow engine

### Data Integrity

- **Referential integrity**: All foreign key relationships enforced at database
  level
- **Audit trail**: Created/updated timestamps on all entities with user
  attribution
- **Soft deletes**: Important entities support soft deletion to maintain history
- **Validation**: Client-side validation with server-side enforcement via RLS
  policies
