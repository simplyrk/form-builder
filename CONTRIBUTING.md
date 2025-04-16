# Contributing Guide

Thank you for your interest in contributing to the Cursor CRM project! This document provides guidelines and instructions to help you contribute effectively.

## Development Environment Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Start the development server: `npm run dev`

## Code Structure

The project follows a feature-based structure:

- `src/app` - Next.js App Router routes and server components
- `src/components` - Reusable UI components
- `src/lib` - Shared utilities and libraries
- `src/types` - TypeScript type definitions
- `src/utils` - Utility functions
- `src/__tests__` - Test files

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Maintain strong typing - avoid using `any` when possible
- Use interface for object types
- Use proper error handling with specific error types

### ESLint

The project uses a simplified ESLint configuration:

1. Modern ESM config (`eslint.config.js`) - The primary configuration with all ignore patterns
2. Legacy config (`.eslintrc.json`) - For compatibility with Next.js

Before submitting a PR, ensure your code passes linting:

```bash
npm run lint
```

To automatically fix issues when possible:

```bash
npm run lint:fix
```

### Import Order

Follow this import order for consistency:

1. React/Next.js imports
2. External dependencies
3. Internal imports (using `@/` path alias)
4. Relative imports

Always use the `@/` path alias for imports from the `src` directory.

### CSS/Styling

- Use Tailwind CSS for styling
- For complex components, consider using CSS Modules
- Follow mobile-first approach for responsive design

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass: `npm test`
4. Run linting: `npm run lint`
5. Update documentation if necessary
6. Submit a PR with a clear description of changes

## Build Process

The build process uses Next.js build with some customizations:

- ESLint is run separately from the build for better control
- TypeScript type checking is enabled during build
- The project uses ESM modules

To test a production build locally:

```bash
npm run build
npm run start
```

## Troubleshooting

### ESLint Issues

If you encounter ESLint configuration issues:

1. Make sure you have the latest dependencies installed
2. Check if your IDE ESLint plugin is properly configured
3. Try clearing the ESLint cache: `npm run lint -- --cache false`

### TypeScript Errors

For TypeScript errors in specific files:

1. Check the excluded files in `eslint.config.js`
2. Consider adding temporary type assertions if needed during development
3. Make sure your IDE is using the project's TypeScript version

## Questions and Support

If you have questions or need help, please open an issue in the repository. 