# Changelog

All notable changes to the Form Builder project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Improved file storage system with dual-storage support for backward compatibility
- Security scanning for uploaded files
- Advanced file path resolution for better file handling
- Environment variable validation script
- Middleware-helmet implementation for enhanced security
- Content Security Policy (CSP) support
- HTTP Strict Transport Security (HSTS) support

### Changed
- Updated to Next.js 15 with Turbopack support
- Upgraded to React 19
- Improved form response structure for better data management
- Enhanced security with middleware-helmet implementation
- Refactored file storage system for better scalability
- Updated environment variable configuration

### Fixed
- File path resolution issues when serving uploaded files
- Form validation edge cases
- Authentication redirect issues
- Security vulnerabilities in file upload handling
- Middleware configuration issues

### Security
- Added file scanning for uploaded content
- Implemented Helmet.js for security headers
- Added CSP and HSTS security headers
- Enhanced file upload security measures

## [0.1.0] - 2024-05-15

### Added
- Initial release of Form Builder
- Form creation and management
- Response collection and export
- File upload support
- User authentication via Clerk
- Admin dashboard
- Dark mode support
- Responsive design
- CSV export functionality
- Basic API endpoints
- PM2 integration for production deployments 