# Contributing to Cursor CRM

Thank you for your interest in contributing to Cursor CRM! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to maintain a respectful and inclusive community.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/cursor-crm.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Set up environment variables (see README.md)
6. Start the development server: `npm run dev`

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code style and formatting
- Use meaningful variable and function names
- Add JSDoc comments to all functions and components
- Keep functions small and focused
- Use proper error handling

### Git Workflow

1. Create a new branch for each feature or bug fix
2. Make small, focused commits
3. Write clear commit messages
4. Keep your branch up to date with the main branch
5. Submit a pull request when ready

### Pull Request Process

1. Update the README.md if needed
2. Update the documentation if needed
3. Add tests for new features
4. Ensure all tests pass
5. Request a review from maintainers

### Testing

- Write unit tests for new features
- Write integration tests for complex features
- Ensure all tests pass before submitting a PR
- Test on different browsers and devices

### Documentation

- Add JSDoc comments to all functions and components
- Update the README.md if needed
- Update the API documentation if needed
- Add comments for complex logic

### File Structure

- Keep related files together
- Use consistent file naming
- Follow the existing project structure
- Place new components in appropriate directories

### Error Handling

- Use proper error handling
- Add error boundaries where needed
- Log errors appropriately
- Provide user-friendly error messages

### Performance

- Optimize images and assets
- Minimize bundle size
- Use proper caching
- Follow React best practices

### Security

- Follow security best practices
- Validate user input
- Sanitize data
- Use proper authentication and authorization
- Follow the guidelines in our [Security Policy](SECURITY.md)

### Technology Stack

Please stick to the following technologies when contributing:

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Form Management**: React Hook Form with Zod validation

## Development Setup

### Database Setup

1. Install PostgreSQL locally
2. Create a new database for the project
3. Update your `.env` file with the database connection string
4. Run migrations with `npx prisma db push`

### Running in Development Mode

```bash
# Start the development server with Turbopack
npm run dev
```

### Building for Production

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

## Questions?

If you have any questions, please:

1. Check the existing documentation
2. Search for similar issues
3. Open a new issue if needed
4. Join our community chat

## License

By contributing to Cursor CRM, you agree that your contributions will be licensed under the project's [LICENSE](LICENSE). 