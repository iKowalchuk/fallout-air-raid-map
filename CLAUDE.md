# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application for displaying real-time air raid alerts using the Ukrainian alerts API (https://api.alerts.in.ua). The project uses pnpm as the package manager and React 19 with the App Router architecture.

## Commands

### Development
```bash
# Install dependencies (pnpm is enforced via preinstall hook)
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Code Quality
```bash
# Run linting and formatting checks with Biome
pnpm lint

# Auto-format code with Biome
pnpm format

# Run TypeScript type checking
pnpm type-check

# Detect unused code with Knip
pnpm knip
```

### Testing
```bash
# No tests configured yet
pnpm test
```

## Tech Stack & Tooling

- **Framework**: Next.js 16.1.1 (App Router) with React 19.2.3
- **Language**: TypeScript 5.9.3 with strict mode
- **Styling**: Tailwind CSS v4.1.18
- **Code Quality**: Biome 2.3.10 (replaces ESLint + Prettier)
- **Validation**: Zod 4.2.1
- **React Compiler**: Enabled via babel-plugin-react-compiler for automatic optimization
- **Package Manager**: pnpm 10.14.0 (enforced)

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```
ALERTS_API_URL=https://api.alerts.in.ua
ALERTS_API_TOKEN=YOUR_API_TOKEN
```

## Architecture & Code Organization

### Feature-Based Structure

Code is organized by features in `src/features/`, not flat folders. Each feature folder is self-contained:

```
src/features/awesome-feature/
├── api/         # exported API request declarations and api hooks related to a specific feature
├── assets/      # assets folder can contain all the static files for a specific feature
├── components/  # components scoped to a specific feature
├── hooks/       # hooks scoped to a specific feature
├── stores/      # state stores for a specific feature
├── types/       # typescript types used within the feature
└── utils/       # utility functions for a specific feature
```

### Unidirectional Code Flow

Follow the `shared → features → app` flow:
- **Shared code** (`src/components`, `src/hooks`, `src/lib`, `src/utils`) can be used anywhere
- **Features** can import from shared code only, not from other features
- **App layer** can import from features and shared code

**No cross-feature imports.** Compose features at the app level instead.

### Import Conventions

- Always use absolute imports with the `@/*` alias (configured in tsconfig.json)
- Example: `@/components/my-component` instead of `../../../components/my-component`
- Biome organizes imports automatically

### File Naming

- **Enforced**: kebab-case for all files and folders (via Biome)
- Example: `user-profile.tsx`, not `UserProfile.tsx` or `user_profile.tsx`

## API Layer Pattern

Each API endpoint should be declared with:

1. **Types and validation schemas** (using Zod) for request/response
2. **Fetcher function** that calls the endpoint using a shared API client instance
3. **Hook** built on react-query for data fetching and caching

Example structure:
```typescript
// src/features/alerts/api/get-alerts.ts
export const getAlertsQueryOptions = () => ({
  queryKey: ['alerts'],
  queryFn: () => apiClient.get('/alerts'),
});

export const useAlerts = () => useQuery(getAlertsQueryOptions());
```

## Component Best Practices

### Colocation
Keep components, functions, styles, and state as close as possible to where they're used. This improves readability and reduces unnecessary re-renders.

### Component Structure
- **Avoid nested rendering functions** - Extract UI units into separate components instead of creating render functions inside components
- **Limit props** - If a component accepts too many props, consider splitting it or using composition (children/slots pattern)
- **Extract components** - Break down large components into smaller, focused ones

### Component Libraries
Recommended headless component libraries for custom designs:
- **Radix UI** - Unstyled, accessible components
- **ShadCN UI** - Copy-paste components with Tailwind (not an npm package)

**Note**: React Server Components require zero-runtime styling solutions (Tailwind, CSS Modules, Vanilla Extract).

## State Management

- **Component state**: useState/useReducer (keep it colocated)
- **Global state**: Context API or Zustand (avoid Context for high-velocity data)
- **Server cache**: React Query (preferred for API data)
- **Form state**: React Hook Form with Zod validation
- **URL state**: Next.js route parameters and query strings

### State Optimization
- Don't put everything in one state - split by usage to prevent unnecessary re-renders
- Keep state close to where it's used
- Use state initializer functions for expensive computations: `useState(() => expensiveFn())`
- Use `children` prop pattern to prevent re-renders of static content

## Git Workflow

### Pre-commit Hooks (via Husky)

- Biome checks run automatically on staged files (lint-staged)
- Conventional commit messages are enforced (commitlint)
- Dependencies are synced after merges

### Commit Message Format

Follow Conventional Commits:
```
type(scope): subject

Examples:
feat(alerts): add real-time alert notifications
fix(map): correct region boundary rendering
docs(readme): update installation instructions
```

## CI/CD

GitHub Actions workflows run on push/PR:
- **lint-check.yml**: Biome formatting/linting, Knip unused code detection, commitlint
- **type-check.yml**: TypeScript compilation checks
- **test.yml**: Test suite (not yet configured)

## Error Handling

### API Errors
Implement an API interceptor to:
- Show notification toasts for errors
- Log out unauthorized users
- Refresh tokens automatically

### In-App Errors
Use **multiple error boundaries** throughout the app (not just one global boundary). This contains errors locally without disrupting the entire application.

### Error Tracking
Use Sentry or similar tools for production error tracking. Upload source maps to see exact source code locations of errors.

## Performance Considerations

### Code Splitting
- Implement at route level (Next.js App Router handles this)
- Avoid excessive splitting - balance between requests and file size
- React Compiler is enabled for automatic memoization

### State & Component Optimization
- Split global state into multiple stores by usage domain
- Keep state close to where it's used
- Use expensive computation initializers: `useState(() => expensiveFn())`
- Use `children` prop to prevent re-renders
- For high-velocity state updates, consider atomic state libraries (Jotai)

### Image Optimization
- Use Next.js Image component for automatic optimization
- Lazy load images not in viewport
- Use modern formats (WEBP)
- Use `srcset` for responsive images

### Data Prefetching
Prefetch data before navigation using `queryClient.prefetchQuery` from React Query to reduce perceived loading times.

### Web Vitals
Monitor Lighthouse and PageSpeed Insights scores, especially since Google uses web vitals for indexing.

## Security Guidelines

### Authentication
- Use JWT tokens for authentication
- Store tokens in **HttpOnly cookies** (not localStorage - vulnerable to XSS)
- User data should be treated as global state accessible throughout the app

### Authorization
- **RBAC (Role-Based Access Control)** - Define roles (USER, ADMIN) with different permission levels
- **PBAC (Permission-Based Access Control)** - For granular control (e.g., only resource owner can delete)

### XSS Prevention
- **Sanitize all user inputs** before displaying in the application
- Never render unsanitized HTML from user input
- Store API tokens in environment variables, never in code

### Security Resources
Refer to OWASP Top 10 Client-Side Security Risks for comprehensive security practices.

## Testing Strategy

### Testing Philosophy
**Prioritize integration tests over unit tests.** Integration tests provide more confidence that the application works correctly. Focus testing efforts on:

1. **Integration Tests** (primary focus) - Test how different parts work together
2. **E2E Tests** (critical paths) - Automate complete user workflows
3. **Unit Tests** (supporting) - For shared utilities and complex isolated logic

### Recommended Tools
- **Vitest** - Modern testing framework (Jest alternative)
- **Testing Library** - Test components as users interact with them, not implementation details
- **Playwright** - E2E testing in both browser and headless modes
- **MSW (Mock Service Worker)** - Mock API responses for testing and development

### Testing Approach
Test user-facing behavior, not implementation details. If you refactor (e.g., change state management), tests should still pass if the output remains the same.

## Deployment

Deploy to CDN for optimal performance:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS CloudFront**
- **Cloudflare**

## Documentation

Comprehensive documentation exists in `docs/`:
- `application-overview.md` - High-level application overview and goals
- `project-structure.md` - Detailed architecture patterns and folder organization
- `project-standards.md` - Code quality standards and tooling (Biome, TypeScript, Husky)
- `components-and-styling.md` - Component design patterns and styling guidelines
- `api-layer.md` - API integration patterns and client configuration
- `state-management.md` - State management approaches and best practices
- `security.md` - Security best practices (authentication, authorization, XSS prevention)
- `error-handling.md` - Error handling strategies and patterns
- `performance.md` - Optimization strategies and performance guidelines
- `testing.md` - Testing guidelines (Vitest, Playwright, MSW)
- `deployment.md` - Deployment processes and configurations
- `additional-resources.md` - Additional learning resources and references

Refer to these docs when implementing new features or making architectural decisions.
