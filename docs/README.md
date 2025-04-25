# Form Builder Documentation

Welcome to the Form Builder documentation. This directory contains detailed documentation for various aspects of the project.

## Documentation Structure

The documentation is organized into several key files:

### General Documentation
- [Main README](../README.md) - Project overview, features, and getting started guide
- [Contributing Guide](../CONTRIBUTING.md) - Guidelines for contributing to the project
- [Code of Conduct](../CODE_OF_CONDUCT.md) - Community standards and expectations
- [Security Policy](../SECURITY.md) - Security practices and vulnerability reporting
- [License](../LICENSE) - Project license information

### Technical Documentation
- [Developer Guide](DEVELOPER.md) - Detailed guide for developers working on the project
- [API Documentation](API.md) - Comprehensive API reference with endpoints and usage examples

## Project Overview

Form Builder is a modern form builder and CRM application built with Next.js 15, TypeScript, and Prisma. The application allows users to create, manage, and collect responses for custom forms with various field types including text, textarea, select, file uploads, and more.

## Key Features

- **Form Builder**: Intuitive interface for creating custom forms with drag-and-drop functionality
- **Form Management**: Tools to edit, publish/unpublish, and delete forms
- **Response Collection**: Secure collection and organization of form submissions
- **File Uploads**: Support for file attachments with proper handling and storage
- **User Authentication**: Secure authentication powered by Clerk
- **Admin Dashboard**: Comprehensive dashboard for managing forms and viewing responses
- **CSV Export**: Export form responses to CSV format for analysis
- **Dark Mode**: Built-in dark mode support for better user experience
- **Responsive Design**: Fully responsive interface that works on desktop and mobile devices

## Technology Stack

- **Frontend**: Next.js 15 with Turbopack, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM 6.5
- **Authentication**: Clerk (@clerk/nextjs v6.12.12 and @clerk/backend v1.25.8)
- **Form Management**: React Hook Form v7.55.0 with Zod validation
- **File Storage**: Local file system with proper path handling
- **Deployment**: Vercel, PM2 (for custom server deployments)

## Getting Started

See the [main README](../README.md) for detailed installation and setup instructions.

## API Documentation

The Form Builder provides a comprehensive API for interacting with forms and responses. The API documentation can be found in [API.md](API.md) and includes:

- Authentication requirements
- Available endpoints
- Request/response formats
- Error handling

## Contributing

We welcome contributions from the community! Please see our [Contributing Guide](../CONTRIBUTING.md) for details on how to get started, code style guidelines, and the pull request process.

## Support and Community

- **Issues**: Report bugs or request features on our GitHub issues page
- **Discussions**: Join our community discussions on GitHub Discussions
- **Email**: Contact support@form-builder.com for direct assistance

## Release Notes

For information about the latest features, bug fixes, and breaking changes, please see the [CHANGELOG.md](../CHANGELOG.md) file in the root directory.

## Roadmap

Our development roadmap is available on GitHub Projects. We prioritize features based on user feedback and community needs.

## License

Form Builder is licensed under the terms specified in the [LICENSE](../LICENSE) file. Please review the license before using or contributing to the project. 