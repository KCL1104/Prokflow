---
inclusion: always
---

# Technology Stack & Development Guidelines

## Core Technologies

### Frontend Stack

- **React 19** with TypeScript - Use functional components with hooks exclusively
- **Vite** - Build tool with HMR, use `npm run dev` for development
- **Tailwind CSS v4.1.11** - Utility-first styling, mobile-first responsive design
- **SWC** - Fast compilation via @vitejs/plugin-react-swc
- **React Router v6** - Client-side routing with protected routes and project-specific paths
- **@dnd-kit** - Drag-and-drop functionality with accessibility support
- **Vitest** - Testing framework with React Testing Library integration

### Backend & Database

- **Supabase** - Primary backend (PostgreSQL + Auth + Real-time + Storage)
- **PostgreSQL 15** - Use Row Level Security (RLS) for all tables with comprehensive policies
- **Supabase Auth** - JWT tokens (1-hour expiry), supports GitHub/Google OAuth + email/password
- **Database Schema** - Complete schema with proper relationships, indexes, and constraints
- **Real-time subscriptions** - Planned for collaborative features (task 15)
- **Edge Functions** - Planned for complex business logic and report generation

## Development Standards

### TypeScript Requirements

- Strict mode enabled - no `any` types allowed
- ES2022 target with DOM libraries
- Use proper type definitions in `src/types/`
- Interface over type aliases for object shapes

### Code Quality

- **ESLint** with TypeScript and React plugins - fix all warnings before commits
- **PostCSS** with Autoprefixer for CSS processing
- **React.memo()** for expensive renders (drag-and-drop lists, large datasets)
- **Error boundaries** implemented for graceful error handling
- **Loading states** with proper skeletons and user feedback
- **Accessibility** compliance with ARIA labels, keyboard navigation, and screen reader support
- **Type guards** for runtime type validation and safety

### Environment Setup

- Copy `.env.example` to `.env.local`
- Required variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Never commit `.env.local` or expose secrets in client code

## Development Workflow

### Commands

```bash
npm run dev          # Development server (localhost:5173)
npm run build        # Production build with TypeScript check
npm run preview      # Preview production build
npm run lint         # ESLint validation
npm test             # Run Vitest test suite
npm test -- --ui     # Run tests with UI interface
```

### Supabase Local Development

```bash
supabase start       # Start local stack
supabase stop        # Stop services
supabase status      # Check service status
supabase db reset    # Reset local database with migrations
supabase db push     # Push migrations to remote database
```

### Testing Workflow

- **Unit tests**: Run automatically on file changes during development
- **Integration tests**: Test complete user workflows and component interactions
- **Test coverage**: Monitor coverage reports and maintain high coverage for critical paths
- **Mock strategy**: Use Vitest mocks for external dependencies (Supabase, react-router-dom)

## Technical Constraints

### Performance

- **Lazy loading**: Heavy components (Gantt charts, large datasets) loaded on demand
- **Optimistic updates**: Implemented for better UX with proper error recovery
- **Efficient drag-and-drop**: Using @dnd-kit with proper virtualization for large lists
- **Batch operations**: Bulk updates implemented to reduce API calls
- **Code splitting**: Vite handles automatic code splitting by route

### Security

- **RLS policies**: All database access through comprehensive Row Level Security policies
- **Input validation**: Client-side validation with server-side enforcement
- **Authentication**: Supabase Auth for all authentication flows with proper token handling
- **Environment variables**: Sensitive data properly managed through environment variables
- **Type safety**: TypeScript strict mode prevents common security vulnerabilities

### Browser Support

- **Modern browsers**: ES2022 support required (Chrome 94+, Firefox 93+, Safari 15+)
- **Mobile-first**: Responsive design with touch-friendly interactions
- **Accessibility**: WCAG 2.1 AA compliance with keyboard navigation and screen reader support
- **Progressive enhancement**: Core functionality works without JavaScript where possible

### Development Constraints

- **No `any` types**: Strict TypeScript enforcement
- **Component co-location**: Tests, styles, and utilities kept with components
- **Error handling**: All async operations must have proper error boundaries
- **Loading states**: All data fetching must show appropriate loading indicators
