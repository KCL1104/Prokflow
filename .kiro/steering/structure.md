---
inclusion: always
---

# Project Structure & Architecture

## Directory Organization

### Source Code (`src/`)

- `components/` - Reusable UI components organized by domain
<<<<<<< HEAD
  - `auth/` - Authentication forms and components
  - `backlog/` - Product backlog management (ProductBacklog, BulkEditModal, EstimationModal)
  - `common/` - Shared UI components (Button, Modal, Loading, Icon)
  - `error/` - Error boundaries and error handling components
  - `layout/` - Application layout components (Sidebar, Header, AppLayout, Breadcrumbs)
  - `routing/` - Route protection and navigation components
  - `work-items/` - Work item management (WorkItemCard, WorkItemForm, WorkItemList)
- `pages/` - Route-level components with dedicated folders per feature
  - `Auth/` - Authentication pages (login, signup, reset password)
  - `Dashboard/` - Main dashboard page
  - `Projects/` - Project management pages
  - `BacklogPage.tsx` - Product backlog page
  - `Board/`, `Gantt/`, `Reports/`, `Settings/` - Feature pages (placeholders)
- `hooks/` - Custom React hooks for business logic and state management
  - `useAuth.ts` - Authentication state management
  - `useBacklog*` - Backlog-specific hooks (filtering, modals, operations, selection)
  - `useFormValidation.ts` - Form validation logic
- `services/` - API layer and external service integrations (Supabase)
  - Direct Supabase client operations (no repository pattern currently)
=======
  - `auth/` - Authentication forms and components (LoginForm, SignupForm, ResetPasswordForm, ProtectedRoute)
  - `backlog/` - Product backlog management (ProductBacklog, BulkEditModal, EstimationModal, ProductBacklogProvider)
  - `board/` - Board views (KanbanBoard, ScrumBoard, BoardCard, BoardColumn, BoardFilters, SprintProgressIndicator)
  - `charts/` - Data visualization (BurndownChart, GanttChart, ResourceAllocationChart, GanttChartControls)
  - `common/` - Shared UI components (Button, Modal, Loading, Icon)
  - `error/` - Error boundaries and error handling components
  - `layout/` - Application layout components (Sidebar, Header, AppLayout, Breadcrumbs)
  - `projects/` - Project management components (ProjectForm, ProjectList, ProjectCard)
  - `retrospectives/` - Sprint retrospective components (RetrospectiveForm, RetrospectiveList, FeedbackCard, ActionItemCard)
  - `routing/` - Route protection and navigation components
  - `sprints/` - Sprint management (SprintCard, SprintList, SprintDashboard)
  - `standups/` - Daily standup components (StandupForm, StandupList, StandupParticipationForm)
  - `work-items/` - Work item management (WorkItemCard, WorkItemForm, WorkItemList)
- `pages/` - Route-level components with dedicated folders per feature
  - `Auth/` - Authentication pages (login, signup, reset password)
  - `Board/` - Board view pages (BoardPage with Kanban and Scrum boards)
  - `Dashboard/` - Main dashboard page
  - `Gantt/` - Gantt chart and timeline pages (GanttPage)
  - `Projects/` - Project management pages
  - `Retrospectives/` - Sprint retrospective pages (RetrospectivesPage)
  - `BacklogPage.tsx` - Product backlog page
  - `Reports/`, `Settings/` - Feature pages (planned)
- `hooks/` - Custom React hooks for business logic and state management
  - `useAuth.ts` - Authentication state management
  - `useBacklog*` - Backlog-specific hooks (filtering, modals, operations, selection)
  - `useBoardDragDrop.ts` - Board drag-and-drop functionality
  - `useBoardFiltering.ts` - Board filtering and search
  - `useErrorHandler.ts` - Centralized error handling
  - `useFormValidation.ts` - Form validation logic
  - `useGanttData.ts` - Gantt chart data management
  - `useProject.ts` - Project state management
  - `useRetrospectives.ts` - Retrospective management
  - `useStandups.ts` - Daily standup management
  - `useTeamMembers.ts` - Team member management
  - `useWorkflow.ts` - Workflow state management
  - `useWorkItems.ts` - Work item operations
- `services/` - API layer and external service integrations (Supabase)
  - Direct Supabase client operations (primary pattern)
- `repositories/` - Experimental repository pattern (BaseRepository - currently disabled)
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
- `contexts/` - React Context providers for global state
- `types/` - TypeScript type definitions and interfaces
- `utils/` - Pure utility functions and helpers
- `lib/` - Third-party library configurations (Supabase setup)
- `constants/` - Application constants and configuration
- `router/` - Application routing configuration

### Configuration

- `supabase/` - Database migrations and Supabase configuration
- Root config files: Vite, TypeScript, Tailwind, ESLint, PostCSS

## Naming Conventions

### Files & Components

- **Components**: PascalCase (`ProjectForm.tsx`, `UserProfile.tsx`)
- **Pages**: PascalCase with "Page" suffix (`ProjectDetailPage.tsx`)
- **Hooks**: camelCase with "use" prefix (`useProject.ts`, `useAuth.ts`)
- **Services**: camelCase with "Service" suffix (`projectService.ts`)
- **Repositories**: PascalCase with "Repository" suffix (`ProjectRepository.ts`)
- **Types**: PascalCase interfaces/types (`ProjectData.ts`, `UserRole.ts`)
- **Utils**: camelCase descriptive names (`formatDate.ts`, `validateEmail.ts`)

### Folders

- Use kebab-case for multi-word folder names
- Group related components in feature-based folders
- Use `__tests__` folders for test files co-located with components

## Architecture Patterns

### Component Organization

- **Feature-based grouping**: Components organized by domain (auth, projects,
  etc.)
- **Compound components**: Use for complex UI (`ProjectBoard.Header`,
  `ProjectBoard.Column`)
- **Co-location**: Keep component, test, and related files together
- **Index exports**: Use `index.ts` files for clean imports from folders

### Data Layer

- **Service layer**: Direct Supabase client operations in `services/` folder
<<<<<<< HEAD
  - `workItemService.ts` - Work item CRUD operations
  - `projectService.ts` - Project management operations
  - `sprintService.ts` - Sprint management (planned)
- **Custom hooks**: Encapsulate component logic and state management
  - Business logic hooks (e.g., `useBacklogOperations`)
  - UI state hooks (e.g., `useBacklogModals`)
  - Form handling hooks (e.g., `useFormValidation`)
- **Type safety**: Strict TypeScript with comprehensive type definitions
  - Database types generated from Supabase schema
  - Form validation types and interfaces
  - API request/response types
=======
  - `authService.ts` - Authentication operations
  - `databaseService.ts` - Common database utilities
  - `projectService.ts` - Project management operations
  - `retrospectiveService.ts` - Sprint retrospective management
  - `sprintService.ts` - Sprint management operations
  - `standupService.ts` - Daily standup management
  - `workflowService.ts` - Workflow and state management
  - `workItemService.ts` - Work item CRUD operations
- **Repository pattern**: Experimental `BaseRepository` class available but currently disabled
  - Generic CRUD operations with TypeScript support
  - Common database patterns (findById, findWhere, count, batch operations)
  - Currently has TypeScript generic constraints with Supabase client
  - Future consideration for standardizing data access layer
- **Custom hooks**: Encapsulate component logic and state management
  - Business logic hooks (e.g., `useBacklogOperations`, `useStandups`, `useRetrospectives`, `useGanttData`)
  - UI state hooks (e.g., `useBacklogModals`, `useBoardDragDrop`, `useBoardFiltering`)
  - Form handling hooks (e.g., `useFormValidation`, `useErrorHandler`)
- **Type safety**: Strict TypeScript with comprehensive type definitions
  - Database types generated from Supabase schema (`src/types/database.ts`)
  - Core domain types (`src/types/index.ts`)
  - Form validation types and interfaces (`src/types/forms.ts`)
  - API request/response types (`src/types/api.ts`)
  - Chart and visualization types (`src/types/charts.ts`)
  - Runtime type guards (`src/types/guards.ts`)
  - Utility types (`src/types/utils.ts`)
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

### State Management

- **Local state**: Component-level state for UI concerns
- **Custom hooks**: Shared business logic and API interactions
- **Context providers**: Global state for authentication and app-wide data
- **Supabase real-time**: Live data subscriptions for collaborative features

## Code Organization Rules

### Component Structure

- One component per file with PascalCase naming
- Export component as default, types/interfaces as named exports
- Co-locate tests in `__tests__` folders or `.test.tsx` files
- Use compound components for complex UI hierarchies

### Import Organization

- External libraries first
- Internal imports grouped by: types, hooks, services, components
- Relative imports last
- Use absolute imports from `src/` root when possible

### File Placement

- **Pages**: Route components in `pages/[ComponentName]Page.tsx` or `pages/[Feature]/[ComponentName]Page.tsx`
- **Components**: Feature-grouped in `components/[feature]/[ComponentName].tsx`
- **Business Logic**: Extract to custom hooks in `hooks/use[Feature][Purpose].ts`
- **API Logic**: Service functions in `services/[feature]Service.ts`
- **Types**: Centralized in `types/` with feature-specific groupings

### Testing Strategy

- **Unit tests**: Co-located with components in `__tests__` folders
- **Integration tests**: For complete user workflows and component interactions
- **Test file naming**: `ComponentName.test.tsx` for components, `serviceName.test.ts` for services
- **Mock strategy**: Mock external dependencies (Supabase, react-router-dom) in tests
- **Test utilities**: Shared test setup in `src/setupTests.ts`
- **Coverage goals**: Aim for high coverage on business logic and critical user flows

### Current Implementation Status

<<<<<<< HEAD
- ✅ **Authentication system**: Complete with protected routes
- ✅ **Project management**: Basic CRUD operations implemented
- ✅ **Product backlog**: Full implementation with drag-and-drop, bulk editing, estimation
- ✅ **Navigation & routing**: Project-specific routing with dynamic sidebar
- ✅ **Error handling**: Error boundaries and user-friendly error messages
- 🚧 **Sprint management**: Database schema ready, UI implementation pending
- 🚧 **Board views**: Kanban/Scrum boards planned
- 🚧 **Real-time features**: Supabase Realtime integration planned
=======
- ✅ **Authentication system**: Complete with protected routes and social auth
- ✅ **Project management**: Full CRUD operations with methodology support
- ✅ **Product backlog**: Complete implementation with drag-and-drop, bulk editing, estimation
- ✅ **Sprint management**: Complete with planning, execution, and analytics
- ✅ **Daily standups**: Complete standup management with participation tracking
- ✅ **Sprint retrospectives**: Complete retrospective system with feedback and action items
- ✅ **Board views**: Kanban and Scrum boards with drag-and-drop functionality
- ✅ **Gantt charts**: Interactive timeline visualization with critical path analysis
- ✅ **Navigation & routing**: Project-specific routing with dynamic sidebar
- ✅ **Error handling**: Comprehensive error system with custom error classes
- ✅ **Type system**: Modular type architecture with runtime validation
- ✅ **Testing framework**: Comprehensive test suite with 89.6% pass rate
- ✅ **Database schema**: Unified schema with multi-methodology support
- 🚧 **Real-time features**: Supabase Realtime integration planned (task 15)
- 🚧 **Reporting system**: Analytics dashboard and report generation (task 14)
## Advanced Architecture Patterns

### Error Handling Architecture

- **Centralized error handling**: `useErrorHandler` hook for consistent error management
- **Error boundaries**: React error boundaries for graceful failure recovery
- **Custom error classes**: Structured error hierarchy with user-friendly messages
- **Error mapping**: Automatic conversion of Supabase errors to application errors
- **Retry mechanisms**: Automatic retry for transient failures with exponential backoff

### Performance Optimization Patterns

- **React.memo()**: Applied to expensive components (drag-and-drop, charts)
- **Debounced operations**: Search and filtering with performance optimization
- **Lazy loading**: Heavy components loaded on demand (planned for Gantt charts)
- **Virtual scrolling**: Large list optimization (planned for large datasets)
- **Code splitting**: Route-based code splitting with Vite

### Data Management Patterns

- **Optimistic updates**: Immediate UI feedback with error recovery
- **Batch operations**: Bulk updates to reduce API calls
- **Cache invalidation**: Strategic data cache management
- **Real-time subscriptions**: Live data updates (planned for task 15)
- **Offline support**: Basic offline functionality (planned)

### Component Composition Patterns

- **Compound components**: Complex UI broken into composable parts
- **Provider patterns**: Context-based state sharing (ProductBacklogProvider)
- **Render props**: Flexible component composition
- **Custom hooks**: Reusable stateful logic extraction
- **Higher-order components**: Cross-cutting concerns (ProtectedRoute)

## Utility and Helper Organization

### Utility Functions (`src/utils/`)

- `dateUtils.ts` - Date formatting and manipulation utilities
- `errorHandling.ts` - Error handling utilities and helpers
- `formatUtils.ts` - Data formatting and display utilities
- `ganttChartConfig.ts` - Gantt chart configuration and utilities
- `idGenerator.ts` - Unique ID generation utilities
- `typeGuards.ts` - Runtime type validation functions
- `validationUtils.ts` - Form and data validation utilities
- `wipLimitStrategy.ts` - WIP limit enforcement utilities
- `workItemUtils.ts` - Work item manipulation utilities

### Constants and Configuration (`src/constants/`)

- Application-wide constants and configuration values
- Enum definitions and lookup tables
- Default values and fallback configurations
- Feature flags and environment-specific settings

### Library Configuration (`src/lib/`)

- `supabase.ts` - Supabase client configuration and setup
- Third-party library configurations and wrappers
- API client configurations and interceptors

## Testing Architecture

### Test Organization Strategy

- **Co-located tests**: Tests placed in `__tests__` folders with components
- **Test utilities**: Centralized test setup in `src/setupTests.ts`
- **Mock strategies**: Consistent mocking patterns for external dependencies
- **Test data factories**: Reusable test data generation utilities

### Current Test Coverage

- **Component tests**: Comprehensive testing for UI components
- **Hook tests**: Custom hook testing with React Testing Library
- **Service tests**: API service layer testing with mocked Supabase client
- **Integration tests**: User workflow and component interaction testing
- **Utility tests**: Pure function and utility testing

### Test Quality Metrics

- **Pass rate**: Current 89.6% test pass rate with ongoing improvements
- **Coverage goals**: High coverage for business logic and critical user flows
- **Test maintenance**: Regular test updates with feature development
- **Performance testing**: Component render performance validation

## Database Integration Patterns

### Service Layer Architecture

- **Direct Supabase operations**: Primary pattern for database interactions
- **Error handling**: Comprehensive error mapping and user-friendly messages
- **Type safety**: Generated types from Supabase schema with runtime validation
- **Query optimization**: Efficient queries with proper indexing strategy

### Repository Pattern (Experimental)

- **BaseRepository**: Generic CRUD operations with TypeScript support
- **Currently disabled**: Direct service pattern preferred for simplicity
- **Future consideration**: Potential standardization of data access layer
- **Type constraints**: Proper generic constraints for Supabase compatibility

### Real-time Integration (Planned)

- **Supabase Realtime**: Live data subscriptions for collaborative features
- **Event handling**: Structured event handling for real-time updates
- **Conflict resolution**: Strategies for concurrent editing conflicts
- **Connection management**: Robust connection handling and recovery

## Current Feature Implementation Status

### Completed Features (✅)

- **Authentication System**: Complete with social auth and protected routes
- **Project Management**: Full CRUD with methodology support (Scrum, Kanban, Waterfall, Custom)
- **Product Backlog**: Drag-and-drop prioritization, bulk editing, story point estimation
- **Sprint Management**: Planning, execution, burndown analytics, completion workflow
- **Board Views**: Kanban and Scrum boards with drag-and-drop and WIP limits
- **Gantt Charts**: Interactive timeline with dependencies and critical path
- **Daily Standups**: Scheduling, participation tracking, status updates
- **Sprint Retrospectives**: Feedback collection, action item management, templates
- **Error Handling**: Custom error classes, user-friendly messages, retry mechanisms
- **Type System**: Comprehensive TypeScript with runtime validation
- **Testing Framework**: 89.6% pass rate with co-located tests

### In Progress Features (🚧)

- **Real-time Collaboration**: Supabase Realtime integration (task 15)
- **Reporting System**: Analytics dashboard and report generation (task 14)
- **Mobile Optimization**: Responsive design improvements (task 16)
- **Performance Optimization**: Lazy loading and virtual scrolling

### Planned Features (📋)

- **Advanced Analytics**: Custom dashboards and metrics
- **Integration APIs**: Third-party tool integrations
- **Advanced Workflows**: Custom workflow engine enhancements
- **Notification System**: Comprehensive notification management
- **File Management**: Advanced attachment and file handling
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
