# Form Builder

A lightweight tool for creating and managing forms with support for various field types including text, text areas, dropdowns, and file uploads.

## Features

- Create and manage forms with a user-friendly interface
- Support for multiple field types:
  - Text input
  - Text area
  - Select/Dropdown
  - File upload
- Form validation
- User authentication
- Form responses storage
- Admin dashboard for form management

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Prisma (PostgreSQL)
- Clerk Authentication
- TailwindCSS
- Radix UI Components

## Getting Started

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
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cursor_crm?schema=public"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard
│   ├── forms/             # Form viewing pages
│   └── api/               # API routes
├── components/            # React components
│   ├── form-builder.tsx   # Form creation interface
│   ├── form-field.tsx     # Individual form field
│   ├── form-viewer.tsx    # Form display interface
│   └── ui/               # UI components
├── lib/                   # Utility functions
└── types/                # TypeScript type definitions
```

## Usage

1. Sign in to access the admin dashboard
2. Create a new form with desired fields
3. Publish the form to make it available to users
4. Share the form URL with users
5. View form responses in the admin dashboard

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

AGPL-3.0
