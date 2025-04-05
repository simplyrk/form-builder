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
- **Deployment**: Vercel

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
