---
inclusion: always
---

# Project Management Platform

A comprehensive project management web application supporting multiple
methodologies (Scrum, Kanban, Waterfall, Custom) with real-time collaboration
<<<<<<< HEAD
and analytics. Currently implementing core backlog management, sprint planning,
and board views.
=======
and analytics. Features complete backlog management, sprint planning, board views,
Gantt charts, daily standups, and sprint retrospectives with comprehensive
error handling and type safety.
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

## Product Conventions

### User Experience Principles

- **Mobile-first responsive design** using Tailwind CSS breakpoints with
  touch-friendly interactions
- **Real-time updates** via Supabase subscriptions for collaborative features
<<<<<<< HEAD
  (planned for task 15)
=======
  (planned for task 15) with optimistic UI updates
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
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
<<<<<<< HEAD
=======
- **Comprehensive feature set**: Complete implementation of core PM features:
  - Product backlog with drag-and-drop prioritization
  - Sprint management with burndown analytics
  - Kanban and Scrum boards with WIP limits
  - Gantt charts with critical path analysis
  - Daily standups with participation tracking
  - Sprint retrospectives with action item management
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

## Code Style & Patterns

### Component Design

- **Compound components** for complex UI (e.g., `ProductBacklog.Header`,
<<<<<<< HEAD
  `WorkItemCard.Actions`)
- **Loading states and error boundaries** for all async operations with
  user-friendly error messages
- **Co-located tests** in `__tests__` folders with comprehensive coverage
- **React.memo()** for expensive renders, especially in drag-and-drop interfaces
  and large lists
- **Custom hooks** for separation of concerns (e.g., `useBacklogModals`,
  `useBacklogOperations`)
=======
  `WorkItemCard.Actions`, `GanttChart.Controls`)
- **Loading states and error boundaries** for all async operations with
  user-friendly error messages and custom error classes
- **Co-located tests** in `__tests__` folders with comprehensive coverage (89.6% pass rate)
- **React.memo()** for expensive renders, especially in drag-and-drop interfaces
  and large lists (boards, backlog, Gantt charts)
- **Custom hooks** for separation of concerns (e.g., `useBacklogModals`,
  `useBacklogOperations`, `useBoardDragDrop`, `useGanttData`)
- **Accessibility-first design** with WCAG 2.1 AA compliance, keyboard navigation,
  and screen reader support
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

### State Management

- **Local component state** for UI-only concerns (modals, form inputs, selection
  state)
- **Custom hooks** for business logic and API interactions with proper error
  handling
- **Service layer** for direct Supabase client operations with optimistic
<<<<<<< HEAD
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
=======
  updates and comprehensive error handling
- **Form validation** using custom `useFormValidation` hook with real-time
  feedback and type-safe validation
- **Context providers** for global state (authentication, project context)

### Data Patterns

- **Direct Supabase client** operations in service layer with experimental
  BaseRepository pattern available but disabled
- **Optimistic updates** with error recovery for better UX (implemented in
  backlog, boards, and sprint management)
- **Comprehensive error handling** with custom error classes, user-friendly messages,
  and retry mechanisms via `useErrorHandler` hook
- **Batch operations** for bulk updates (implemented in backlog bulk edit)
- **Type-safe API calls** with comprehensive TypeScript interfaces and runtime validation
- **Database functions** for complex business logic (workflow validation, analytics)
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

### Security & Performance

- **Row Level Security (RLS)** enforced at database level with comprehensive
  policies
- **Input validation** on both client and server with TypeScript type guards
- **Lazy loading** for heavy components (Gantt charts, large datasets) - planned
- **Loading skeletons** and proper loading states for better UX
- **Drag-and-drop optimization** using @dnd-kit with keyboard accessibility
<<<<<<< HEAD
=======
  and touch support (backlog, boards)
- **Performance monitoring** with strategic React.memo() usage and debounced operations
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

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
<<<<<<< HEAD
  level
- **Audit trail**: Created/updated timestamps on all entities with user
  attribution
- **Soft deletes**: Important entities support soft deletion to maintain history
- **Validation**: Client-side validation with server-side enforcement via RLS
  policies
=======
  level with cascading deletes where appropriate
- **Audit trail**: Created/updated timestamps on all entities with user
  attribution via database triggers
- **Soft deletes**: Important entities support soft deletion to maintain history
- **Validation**: Client-side validation with server-side enforcement via RLS
  policies and database constraints
- **Business logic enforcement**: Database functions validate workflow transitions,
  WIP limits, and sprint constraints
- **Type safety**: Runtime type validation using type guards for data integrity

## Sprint and Retrospective Management

### Sprint Lifecycle

- **Sprint planning**: Capacity-based planning with velocity calculations
- **Sprint execution**: Real-time progress tracking with burndown charts
- **Sprint completion**: Automatic handling of incomplete items
- **Sprint analytics**: Velocity tracking and performance metrics

### Retrospective Process

- **Structured feedback**: Categorized feedback collection (went well, needs improvement, action items)
- **Action item tracking**: Follow-up management with status tracking
- **Template system**: Customizable retrospective formats
- **Team participation**: Collaborative feedback and discussion

### Daily Standup Management

- **Scheduled standups**: Automated scheduling and notifications
- **Participation tracking**: Individual status updates (yesterday/today/blockers)
- **Attendance management**: Participation status and history
- **Integration**: Links to sprint and work item context

## Chart and Visualization Rules

### Gantt Chart Constraints

- **Dependency management**: Task dependencies with automatic date adjustments
- **Critical path**: Automatic calculation and highlighting
- **Resource allocation**: Team member workload visualization
- **Timeline navigation**: Interactive timeline with zoom and pan

### Burndown Chart Rules

- **Sprint-based**: Tracks remaining work over sprint duration
- **Real-time updates**: Reflects current sprint progress
- **Velocity integration**: Historical velocity for planning
- **Completion tracking**: Story points vs. time visualization

## Quality Assurance Standards

### Testing Requirements

- **Unit test coverage**: Comprehensive testing for all components and services
- **Integration testing**: Complete user workflow testing
- **Test co-location**: Tests placed in `__tests__` folders with components
- **Mock strategy**: Consistent mocking of external dependencies (Supabase, React Router)
- **Test utilities**: Centralized test setup and utilities in `src/setupTests.ts`
- **Current metrics**: 89.6% test pass rate with ongoing improvements

### Error Handling Standards

- **Custom error classes**: Structured error hierarchy with HTTP status codes
- **User-friendly messages**: Clear, actionable error messages for users
- **Error boundaries**: React error boundaries for graceful failure handling
- **Retry mechanisms**: Automatic retry for transient failures
- **Error logging**: Comprehensive error tracking and monitoring

### Performance Standards

- **Loading states**: All async operations show appropriate loading indicators
- **Optimistic updates**: Immediate UI feedback with error recovery
- **Debounced operations**: Search and filtering optimized for performance
- **Memory management**: Proper cleanup of subscriptions and event listeners
- **Bundle optimization**: Code splitting and lazy loading for large components

## Development Workflow Standards

### Code Organization

- **Feature-based structure**: Components organized by domain functionality
- **Single responsibility**: Each component and hook has a clear, focused purpose
- **Consistent naming**: PascalCase for components, camelCase for functions and hooks
- **Import organization**: Structured imports (external, internal, relative)
- **Export patterns**: Default exports for components, named exports for utilities

### Documentation Requirements

- **Component documentation**: Clear prop interfaces and usage examples
- **Hook documentation**: Purpose, parameters, and return value documentation
- **Service documentation**: API method documentation with error handling
- **Type documentation**: Comprehensive TypeScript interfaces and types
- **README maintenance**: Keep project documentation current with implementation

### Security Standards

- **Input sanitization**: All user inputs validated and sanitized
- **Authentication checks**: Protected routes and API endpoints
- **Permission validation**: Role-based access control enforcement
- **Data encryption**: Sensitive data encrypted in transit and at rest
- **Environment security**: Proper handling of environment variables and secrets
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
