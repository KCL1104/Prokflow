---
inclusion: always
---

# Project Structure & Architecture

## Directory Organization

### Source Code (`src/`)

- `components/` - Reusable UI components organized by domain
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

- ✅ **Authentication system**: Complete with protected routes
- ✅ **Project management**: Basic CRUD operations implemented
- ✅ **Product backlog**: Full implementation with drag-and-drop, bulk editing, estimation
- ✅ **Navigation & routing**: Project-specific routing with dynamic sidebar
- ✅ **Error handling**: Error boundaries and user-friendly error messages
- 🚧 **Sprint management**: Database schema ready, UI implementation pending
- 🚧 **Board views**: Kanban/Scrum boards planned
- 🚧 **Real-time features**: Supabase Realtime integration planned
