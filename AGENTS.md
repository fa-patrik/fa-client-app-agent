This file provides guidance to AI Agents when working with code in this repository.

## Development Commands

### Core Development
- `pnpm dev` - Start Vite development server
- `pnpm build` - Build production version with Vite
- `pnpm test` - Run Vitest tests (single run)

### Code Quality & Linting
- `pnpm validate:lint` - Run ESLint on TypeScript/JavaScript files
- `pnpm validate:types` - Run TypeScript compiler for type checking
- `pnpm validate:format` - Check if code follows Prettier formatting
- `pnpm validate` - Run all validation checks
- `pnpm ready` - Run all checks, tests, and build

### Storybook
- `pnpm build:stories` - Build static Storybook
- `pnpm test:stories` - Run Storybook tests

## Architecture Overview

### Application Structure
This is a React-based FA Solutions client portal that allows customers to access their investment data. The application uses a provider-based architecture with the following key layers:

**Core Providers (App.tsx)**:
- `InitialLanguageProvider` - Manages i18n initialization
- `ServiceWorkerRegistrationProvider` - Handles PWA functionality
- `ConfigProvider` - Loads runtime configuration from `/config/config.json`
- `KeycloakProvider` - Manages authentication via Keycloak
- `WizardProvider` - Handles multi-step form workflows
- `PersistedApolloProvider` - Manages GraphQL client with cache persistence

### Key Technologies
- **React 19** with TypeScript
- **Vite** for build tooling and development server
- **Vitest** for unit testing
- **Apollo Client** for GraphQL API communication with FA Backend
- **Keycloak** for authentication
- **Tailwind CSS v4** for styling
- **Formio React** for dynamic form rendering
- **ApexCharts** for data visualization
- **i18next** for internationalization
- **PWA** support with service workers and Workbox

### Directory Structure

**API Layer (`src/api/`)**:
- Organized by domain: `common/`, `documents/`, `holdings/`, `orders/`, `overview/`, `performance/`, `transactions/`, `trading/`
- Each domain contains fragments, types, and custom hooks for GraphQL operations
- Uses Apollo Client hooks pattern (`useQuery`, `useMutation`)

**Components (`src/components/`)**:
- Reusable UI components with Storybook stories
- Component-specific CSS modules where needed
- Complex components have subdirectories with related hooks and utilities

**Pages (`src/pages/`)**:
- Route-level components organized by user type:
  - `authUser/` - Authentication flow
  - `userWithLinkedContact/` - Main application pages
- Uses dynamic routing with brackets (e.g., `[holdingId].tsx`)

**Views (`src/views/`)**:
- Business logic components that render actual page content
- Each view has a `components/` subdirectory for view-specific components
- Maps to corresponding pages

**Layouts (`src/layouts/`)**:
- `MainLayout` - Overall application shell
- `NavTabLayout` - Tabbed navigation structure
- `PortfolioNavigationHeaderLayout` - Portfolio-specific navigation

**Services (`src/services/`)**:
- `apolloClient/` - GraphQL client configuration with auth middleware
- `keycloakService.ts` - Authentication service
- `permissions/` - Role-based access control

### Configuration
- Runtime configuration loaded from `public/config/config.json`
- Environment-specific settings for FA Platform integration
- Keycloak configuration in `public/keycloak.json`
- Vite configuration in `vite.config.ts` (build, dev server, proxy, plugins)

### GraphQL Integration
- All data fetching via FA's GraphQL API
- Apollo Client with InMemoryCache and persistence
- Custom cache policies for Portfolio and Contact entities
- Authentication via Keycloak bearer tokens

### Styling Approach
- Tailwind CSS v4 as primary styling framework
- Custom theme configuration in `tailwind.config.js`
- Component-specific CSS modules for complex styling
- Consistent color palette and design tokens

### Internationalization
- i18next with browser language detection
- Translation files in `public/locales/{locale}/translation.json`
- Backend integration for dynamic translations (transaction types, etc.)

### Testing Strategy
- Vitest as the test runner
- Tests should be co-located with components
- Storybook for component development and visual testing

### Performance Considerations
- Apollo Client cache persistence for offline capability
- Code splitting with React.lazy and Suspense
- PWA features with service worker caching (Workbox)
- Virtual scrolling for large data sets

## Development Guidelines

### Authentication Context
The application requires a properly configured FA Platform environment with:
- Keycloak authentication setup
- Appropriate user roles assigned
- CORS configuration for GraphQL API access

### Adding New Features
1. Create domain-specific API hooks in `src/api/{domain}/`
2. Build reusable components in `src/components/`
3. Implement business logic in `src/views/`
4. Add route definitions in `src/pages/`
5. Update type definitions as needed

### Working with Forms
- Use Formio for complex dynamic forms from FA Platform
- Custom form components should follow existing input patterns
- Implement proper validation and error handling

### GraphQL Best Practices
- Use fragments for reusable field selections
- Implement proper loading and error states
- Leverage Apollo Client caching strategies
- Follow naming conventions for queries and mutations