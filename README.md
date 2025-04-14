# Cursor CRM

A modern, user-friendly form builder and CRM application built with Next.js 15, TypeScript, and Prisma. This application allows users to create, manage, and collect responses for custom forms.

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
git clone https://github.com/yourusername/cursor-crm.git
cd cursor-crm
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cursor_crm"

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"

# File Upload
UPLOAD_DIR="public/uploads"  # Directory for file uploads
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
pm2 start server.js --name "cursor-crm"
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

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Security

For security concerns, please see our [Security Policy](SECURITY.md).

## License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Clerk](https://clerk.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PM2](https://pm2.keymetrics.io/)
