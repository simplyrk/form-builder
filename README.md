# Form Builder

A modern & lightweight tool for creating and managing forms with support for various field types including text, text areas, date and file uploads.

## Features

- **Form Creation**: Create custom forms with various field types (text, textarea, date, file upload, etc.)
- **Form Management**: Edit, publish/unpublish, and delete forms
- **Response Collection**: Collect and manage form responses
- **File Uploads**: Support for file uploads with proper file handling and storage
- **User Authentication**: Secure authentication using Clerk
- **Admin Dashboard**: Manage forms and view responses
- **CSV Export**: Export form responses to CSV format
- **Dark Mode**: Built-in dark mode support
- **Responsive Design**: Works on desktop and mobile devices
- **Drag-and-Drop**: Intuitive form builder interface using @hello-pangea/dnd

## Tech Stack

- **Frontend**: Next.js 15 with Turbopack, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM 6.5
- **Authentication**: Clerk (@clerk/nextjs v6.12.12 and @clerk/backend v1.25.8)
- **Form Management**: React Hook Form v7.55.0 with Zod validation
- **File Storage**: Local file system with proper path handling
- **Deployment**: Vercel, PM2 (for custom server deployments)

## Getting Started

### Prerequisites

- Node.js 20.x or later
- PostgreSQL database
- Clerk account for authentication

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/form-builder.git
cd form-builder
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/form_builder"

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"

# File Upload
UPLOAD_DIR="public/uploads"  # Directory for file uploads
STORAGE_DIR="storage/uploads" # Primary storage directory
TEMP_DIR="storage/temp" # Temporary storage directory

# App Configuration
NEXT_PUBLIC_APP_NAME="Form Builder"  # Used in both the site logo and welcome message
NEXT_PUBLIC_APP_ICON="ClipboardList"  # Icon used in the top-left header (logo)
NEXT_PUBLIC_WELCOME_ICON="FileText"  # Icon used before the welcome message on homepage

# Configurable Text Strings
NEXT_PUBLIC_TEXT_MANAGE_FORMS="Manage Forms"
NEXT_PUBLIC_TEXT_CREATE_NEW_FORM="Create New Form"
NEXT_PUBLIC_TEXT_AVAILABLE_FORMS="Available Forms"
# Welcome message defaults to "Welcome to {NEXT_PUBLIC_APP_NAME}" if not specified
# NEXT_PUBLIC_TEXT_WELCOME_MESSAGE="Welcome to Form Builder"
NEXT_PUBLIC_TEXT_WELCOME_DESCRIPTION="Click on a form in the navbar to get started"
NEXT_PUBLIC_TEXT_FORMS_AVAILABLE_MESSAGE="There are {count} forms available."  # Use {count} as placeholder for dynamic values

# Available Icon Options:
# The app currently supports these specific icon values:
# - FileText (document with text)
# - ClipboardList (clipboard with list items)
# - Check (checkmark)
# - File (basic file)
# - Settings (gear icon)
# - Home (house icon)
# - Pencil (pen/pencil icon)
# - Box (square box icon)
# Using any other value will fall back to FileText
```

4. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

5. Start the development server:
```bash
npm run dev
```

## Clerk Authentication

This project uses Clerk for authentication. We're using the following Clerk packages:

- `@clerk/nextjs`: For Next.js integration
- `@clerk/backend`: For server-side operations

## Production Deployment

### Building for Production

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm run start
```

The application will run on port 80 by default. If you need to use a different port, you can specify it with the `-p` flag:
```bash
npm run start -p 3000
```

### Deployment with PM2

PM2 is a production process manager for Node.js applications with a built-in load balancer. It allows you to keep applications online 24/7 and reload them without downtime.

1. Install PM2 globally:
```bash
npm install -g pm2
```

2. The project includes a PM2 ecosystem file (ecosystem.config.js). Start the application with PM2:
```bash
npm run pm2:start
```

3. Other useful PM2 commands:
```bash
# Monitor your application
npm run pm2:monit

# View logs
npm run pm2:logs

# Restart application
npm run pm2:restart

# Stop application
npm run pm2:stop

# Save the current process list to start on system reboot
pm2 save

# Set up PM2 to start on system boot
pm2 startup
```

### Using the Custom Server

The project includes a custom server.js file that allows for more advanced configurations. To use it:

1. Build the application:
```bash
npm run build
```

2. Start the custom server:
```bash
npm run custom-server
```

Or with PM2:
```bash
pm2 start server.js --name "form-builder"
```

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── admin/             # Admin routes
│   ├── forms/             # Form routes
│   └── sign-in/           # Authentication routes
├── components/            # Reusable components
│   ├── ui/               # UI components (shadcn/ui)
│   └── form-builder/     # Form builder components
├── lib/                   # Utility functions
│   ├── prisma.ts         # Prisma client
│   └── file-upload.ts    # File upload handling
├── types/                # TypeScript types
└── middleware.ts         # Clerk authentication middleware
```

## Database Schema

The application uses a PostgreSQL database with the following models:

- **Form**: Represents a form with title, description, and publishing status
- **Field**: Form fields with different types (text, textarea, date, etc.)
- **Response**: Form submissions from users
- **ResponseField**: Individual field responses, including file uploads

## Testing

The project uses Jest and React Testing Library for testing. Tests are located in the `src/__tests__` directory and are organized by category.

### Running Tests

Run all tests:
```bash
npm test
```

Run specific test suites:
```bash
# Test utility functions
npm run test:utils

# Test file upload functionality
npm run test:file-upload

# Test Prisma database client
npm run test:prisma

# Test API endpoints
npm run test:api
```

## Documentation

Detailed documentation can be found in the `docs/` directory:
- [API Documentation](docs/API.md)
- [Developer Guide](docs/DEVELOPER.md)

## Security

Please read the [Security Policy](SECURITY.md) for information about our security practices and how to report vulnerabilities.

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Clerk](https://clerk.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PM2](https://pm2.keymetrics.io/)

## Development

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Build

To build the application for production:

```bash
npm run build
```

### ESLint Configuration

This project uses a simplified ESLint configuration approach:

1. **Modern ESLint Config (eslint.config.js)**: Contains comprehensive rules for TypeScript, imports, and accessibility.
2. **Legacy Config (.eslintrc.json)**: Added for Next.js compatibility.

The project is configured to run ESLint separately from the build process to improve build times and provide more control over linting.

#### Linting Commands

- Run ESLint check:
  ```bash
  npm run lint
  ```
- Fix automatically fixable issues:
  ```bash
  npm run lint:fix
  ```

### TypeScript Configuration

TypeScript is configured with strict mode enabled. Some specific pages have been excluded from type checking in the `eslint.config.js` file until their issues are fixed.

### Module System

The project uses ECMAScript modules (ESM) rather than CommonJS:
- Package.json includes `"type": "module"`
- Next.js config uses `.mjs` extension
- Import/export statements follow ESM syntax

### Testing

Run tests with:

```bash
npm test
```

Specific test commands:
```bash
npm run test:utils      # Run utility tests
npm run test:file-upload # Run file upload tests
npm run test:prisma     # Run Prisma tests
npm run test:api        # Run API tests
npm run test:home       # Run HomePage tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate test coverage report
```

### Production Deployment

For production deployment using PM2:

```bash
npm run pm2:start     # Start the application with PM2
npm run pm2:stop      # Stop the application
npm run pm2:restart   # Restart the application
npm run pm2:logs      # View logs
npm run pm2:monit     # Monitor the application
```
