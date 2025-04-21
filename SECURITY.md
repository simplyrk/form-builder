# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Form Builder seriously. If you believe you've found a security vulnerability, please follow these steps:

1. **Do Not** disclose the vulnerability publicly until it has been addressed by our team.

2. **Do** submit your findings to [INSERT SECURITY EMAIL].

3. **Do** include:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fixes (if any)

4. **Do** give us a reasonable time to respond before taking any further action.

## Security Measures

Form Builder implements several security measures to protect users and their data:

### Authentication & Authorization
- Secure authentication using Clerk
- Role-based access control
- Session management
- CSRF protection

### Data Protection
- Input validation
- Data sanitization
- Secure file uploads
- File type validation
- File size limits

### Infrastructure
- HTTPS enforcement
- Security headers (implemented via Next.js middleware)
- Rate limiting
- Error handling
- Logging

### Security Headers

The application implements comprehensive HTTP security headers via middleware:

1. **Content Security Policy (CSP)**
   - Restricts which resources can be loaded
   - Prevents XSS attacks by controlling allowed sources for scripts, styles, images
   - Customized to work with Clerk authentication
   - Implementation: `src/middleware.ts`

2. **Helmet-style Security Headers**
   - X-Content-Type-Options: Prevents MIME type sniffing
   - X-Frame-Options: Prevents clickjacking attacks
   - Strict-Transport-Security: Enforces HTTPS connections
   - X-XSS-Protection: Additional XSS protection for older browsers
   - X-DNS-Prefetch-Control: Controls browser DNS prefetching
   - Implementation: `src/middleware-helmet.ts`

These security features are automatically applied when running the standard Next.js server:
```
npm run dev    # Development mode
npm start      # Production mode
```

### File Upload Security
- File type validation
- File size limits
- Secure file storage
- Path traversal prevention
- MIME type verification

## Best Practices

When using Form Builder, please follow these security best practices:

1. Keep your dependencies up to date
2. Use strong passwords
3. Enable two-factor authentication
4. Regularly backup your data
5. Monitor your account activity
6. Report security issues promptly

## Security Updates

Security updates will be released as needed. We will:

1. Assess the vulnerability
2. Develop a fix
3. Test the fix
4. Release an update
5. Notify users if necessary

## Contact

For security-related issues, please contact [INSERT SECURITY EMAIL]. 