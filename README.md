# Form Builder

A modern, user-friendly form builder application built with Next.js, TypeScript, and Prisma. This application allows users to create, manage, and collect responses for custom forms.

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

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **File Storage**: Local file system with proper path handling
- **Deployment**: Vercel, PM2 (for custom server deployments)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- PostgreSQL database
- Clerk account for authentication

### Installation

1. Clone the repository:
```bash
git clone https://github.com/simplyrk/form-builder.git
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

2. Create a PM2 ecosystem file (ecosystem.config.js):
```bash
touch ecosystem.config.js
```

3. Add the following configuration to ecosystem.config.js:
```javascript
module.exports = {
  apps: [
    {
      name: 'form-builder',
      script: 'server.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 80
      }
    }
  ]
};
```

4. Start the application with PM2:
```bash
pm2 start ecosystem.config.js
```

5. Other useful PM2 commands:
```bash
# Monitor your application
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart form-builder

# Stop application
pm2 stop form-builder

# Delete application from PM2
pm2 delete form-builder

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
│   ├── ui/               # UI components
│   └── form-builder/     # Form builder components
├── lib/                  # Utility functions
│   ├── prisma.ts        # Prisma client
│   └── file-upload.ts   # File upload handling
├── types/               # TypeScript types
└── actions/             # Server actions
```

## Key Features

### Form Builder
- Drag-and-drop form field arrangement
- Multiple field types:
  - Text input
  - Textarea
  - Date picker
  - File upload
  - Checkbox
  - Radio buttons
  - Select dropdown
- Field validation and requirements
- Real-time preview

### Response Management
- View and manage form responses
- Export responses to CSV
- Edit responses
- Delete responses
- File upload handling with proper path management

### Admin Features
- Create and manage forms
- View form statistics
- Manage form access
- Export response data
- Edit any response

### File Handling
- Secure file uploads
- File type validation
- File size limits
- Proper file path handling
- File deletion support

## API Documentation

### Form Actions

#### `createForm(data: FormInput)`
Creates a new form with the provided data.

#### `updateForm(id: string, data: FormInput)`
Updates an existing form with new data.

#### `toggleFormPublish(formId: string)`
Toggles the published state of a form.

#### `deleteForm(formId: string)`
Deletes a form and all its associated data.

#### `updateResponse(responseId: string, fieldValues: Record<string, any> | FormData)`
Updates a form response with new field values.

### File Upload

#### `handleFileUpload(file: File)`
Handles file uploads with proper path management and metadata tracking.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Clerk](https://clerk.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PM2](https://pm2.keymetrics.io/)
