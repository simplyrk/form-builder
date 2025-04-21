# Developer Documentation

This document provides information for developers working on the Cursor CRM project.

## Project Architecture

### Overview

Cursor CRM is a form builder and CRM application built with Next.js 15, TypeScript, and Prisma. The application allows users to create, publish, and collect responses for custom forms with various field types.

### Tech Stack

- **Frontend**: Next.js 15 with Turbopack, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM 6.5
- **Authentication**: Clerk (@clerk/nextjs and @clerk/backend)
- **State Management**: React Hook Form with Zod validation
- **File Handling**: Server-side file storage with proper path management

### Directory Structure

```
src/
├── app/                    # Next.js app router
│   ├── admin/             # Admin routes and dashboards
│   ├── forms/             # Form creation and submission
│   └── sign-in/           # Authentication routes
├── components/            # Reusable React components
│   ├── ui/               # UI components (shadcn/ui)
│   └── form-builder/     # Form builder specific components
├── lib/                   # Utility functions and services
│   ├── prisma.ts         # Prisma client for database interaction
│   └── file-upload.ts    # File upload handling logic
├── types/                # TypeScript type definitions
└── middleware.ts         # Authentication middleware (Clerk)
```

## Database Schema

The application uses a PostgreSQL database with the following main models:

### Form
- Represents a form with title, description, and publishing status
- One-to-many relationship with Field and Response
- Created by a user (identified by Clerk user ID)

### Field
- Represents form fields with different types (text, textarea, select, etc.)
- Belongs to a Form
- Contains field configuration (label, type, required, options)
- Has an order property for arranging fields

### Response
- Represents a form submission
- Belongs to a Form
- Created by a user (identified by Clerk user ID)
- One-to-many relationship with ResponseField

### ResponseField
- Represents an individual field response
- Belongs to both a Response and a Field
- Contains the submitted value
- For file uploads, includes file metadata (name, path, size, MIME type)

## Development Workflow

### Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Copy `.env.example` to `.env` and configure environment variables
4. Generate Prisma client with `npx prisma generate`
5. Apply database schema with `npx prisma db push`
6. Start development server with `npm run dev`

### Key Development Commands

- `npm run dev`: Start development server with Turbopack
- `npm run build`: Build the application for production
- `npm run start`: Start the production server
- `npm run custom-server`: Start the custom Node.js server
- `npm run lint`: Run ESLint for code linting

### Authentication

Authentication is handled by Clerk. The middleware.ts file configures public routes and authenticated routes. Users sign in using Clerk's sign-in page and are redirected based on their authentication status.

### Form Builder

The form builder uses @hello-pangea/dnd for drag-and-drop functionality. Fields can be added, removed, reordered, and configured. Form state is managed with React Hook Form and validated with Zod.

### File Uploads

The application has two file storage implementations:

1. **Primary Implementation** (`src/lib/file-upload.ts`):
   - Files are stored securely in the `STORAGE_DIR` directory (`storage/uploads` by default)
   - Temporary files are stored in `TEMP_DIR` (`storage/temp` by default)
   - Files are renamed using UUID-based unique filenames
   - Files undergo security scanning via the `file-scanner.ts` module
   - Served via `/api/files/[filename]` routes

2. **Forms Implementation** (`src/app/actions/forms.ts`):
   - Files are stored in `public/uploads` directory 
   - Files are renamed using timestamp-based filenames
   - Organized in subdirectories by form and response IDs

The `getFullFilePath` function in `file-upload.ts` intelligently handles both storage mechanisms:
- For standard API requests (`/api/files/[filename]`), it looks in the primary `STORAGE_DIR`
- For path requests starting with 'uploads/', it looks in the `public/uploads` directory
- For paths with subdirectories, it tries multiple locations in a specific order
- This dual-storage support allows backward compatibility with existing uploads

When uploading files:
- File validation checks for size limits, MIME types, and dangerous extensions
- Files undergo MIME type verification to prevent content forgery
- Files are scanned for malware and viruses (when enabled)
- File metadata (name, path, size, MIME type) is stored in the database

File metadata is stored in the ResponseField model, including:
- Original filename
- Storage path
- File size
- MIME type

## Deployment

### Vercel Deployment

The easiest way to deploy the application is using Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy

### Custom Server Deployment

For custom server deployments:

1. Build the application: `npm run build`
2. Start with PM2: `npm run pm2:start`

PM2 configuration is in ecosystem.config.js.

## Troubleshooting

### Database Connection Issues

- Ensure your DATABASE_URL in .env is correct
- Check if PostgreSQL server is running
- Verify network connectivity and firewall settings

### File Upload Problems

- Check if UPLOAD_DIR and STORAGE_DIR exist and have write permissions
- Verify MAX_FILE_SIZE and ALLOWED_FILE_TYPES configuration
- Check disk space availability
- If files are not being found when serving, ensure the correct storage path is being referenced

### Authentication Issues

- Verify Clerk keys in .env
- Check Clerk dashboard for configuration issues
- Ensure middleware.ts properly configures public and private routes 