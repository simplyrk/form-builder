# API Documentation

This document outlines the available API endpoints in the Cursor CRM application.

## API Version

Current API version: `v1`

All API endpoints are prefixed with `/api/v1` unless otherwise specified.

## Authentication

Authentication is handled by Clerk. API routes are protected using middleware that verifies the authentication token. Protected routes require a valid JWT token in the Authorization header.

```
Authorization: Bearer your-jwt-token
```

Public routes are explicitly defined in the middleware configuration and do not require authentication.

## Response Format

All API responses follow a standard format:

```json
{
  "success": true,
  "data": {}, // Response data specific to the endpoint
  "error": null // Error message in case of failure
}
```

In case of errors:

```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

## Error Codes

Common error codes:

- `UNAUTHORIZED`: User is not authenticated
- `FORBIDDEN`: User doesn't have permission to access the resource
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Request validation failed
- `SERVER_ERROR`: Internal server error

## Form API

### Create Form

**Endpoint:** `POST /api/forms`

**Authentication:** Required

**Description:** Creates a new form

**Request Body:**
```json
{
  "title": "Customer Feedback",
  "description": "Please provide your feedback on our service",
  "fields": [
    {
      "label": "Name",
      "type": "text",
      "required": true,
      "order": 0
    },
    {
      "label": "Email",
      "type": "text",
      "required": true,
      "order": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clk5y73wt0000rx3xh9q7a2f1",
    "title": "Customer Feedback",
    "description": "Please provide your feedback on our service",
    "published": false,
    "createdAt": "2024-05-15T12:00:00.000Z",
    "updatedAt": "2024-05-15T12:00:00.000Z",
    "createdBy": "user_2Nq9L3U8A8k2k3j2n3k2j3n2"
  },
  "error": null
}
```

### Get Forms

**Endpoint:** `GET /api/forms`

**Authentication:** Required

**Description:** Retrieves all forms created by the authenticated user

**Query Parameters:**
- `published` (optional): Filter by published status (true/false)
- `limit` (optional): Limit the number of results
- `offset` (optional): Offset for pagination

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clk5y73wt0000rx3xh9q7a2f1",
      "title": "Customer Feedback",
      "description": "Please provide your feedback on our service",
      "published": true,
      "createdAt": "2024-05-15T12:00:00.000Z",
      "updatedAt": "2024-05-15T12:00:00.000Z",
      "createdBy": "user_2Nq9L3U8A8k2k3j2n3k2j3n2",
      "_count": {
        "responses": 5
      }
    }
  ],
  "error": null
}
```

### Get Form

**Endpoint:** `GET /api/forms/:id`

**Authentication:** Required for unpublished forms, optional for published forms

**Description:** Retrieves a specific form by ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clk5y73wt0000rx3xh9q7a2f1",
    "title": "Customer Feedback",
    "description": "Please provide your feedback on our service",
    "published": true,
    "createdAt": "2024-05-15T12:00:00.000Z",
    "updatedAt": "2024-05-15T12:00:00.000Z",
    "createdBy": "user_2Nq9L3U8A8k2k3j2n3k2j3n2",
    "fields": [
      {
        "id": "clk5y73wt0001rx3x8q7a2f2",
        "label": "Name",
        "type": "text",
        "required": true,
        "options": [],
        "order": 0,
        "formId": "clk5y73wt0000rx3xh9q7a2f1"
      },
      {
        "id": "clk5y73wt0002rx3x8q7a2f3",
        "label": "Email",
        "type": "text",
        "required": true,
        "options": [],
        "order": 1,
        "formId": "clk5y73wt0000rx3xh9q7a2f1"
      }
    ]
  },
  "error": null
}
```

### Update Form

**Endpoint:** `PUT /api/forms/:id`

**Authentication:** Required

**Description:** Updates an existing form

**Request Body:**
```json
{
  "title": "Updated Customer Feedback",
  "description": "Updated description",
  "fields": [
    {
      "id": "clk5y73wt0001rx3x8q7a2f2",
      "label": "Full Name",
      "type": "text",
      "required": true,
      "order": 0
    },
    {
      "id": "clk5y73wt0002rx3x8q7a2f3",
      "label": "Email Address",
      "type": "text",
      "required": true,
      "order": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clk5y73wt0000rx3xh9q7a2f1",
    "title": "Updated Customer Feedback",
    "description": "Updated description",
    "published": true,
    "createdAt": "2024-05-15T12:00:00.000Z",
    "updatedAt": "2024-05-15T13:00:00.000Z",
    "createdBy": "user_2Nq9L3U8A8k2k3j2n3k2j3n2"
  },
  "error": null
}
```

### Toggle Form Publish Status

**Endpoint:** `PATCH /api/forms/:id/publish`

**Authentication:** Required

**Description:** Toggles the published status of a form

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clk5y73wt0000rx3xh9q7a2f1",
    "published": false
  },
  "error": null
}
```

### Delete Form

**Endpoint:** `DELETE /api/forms/:id`

**Authentication:** Required

**Description:** Deletes a form and all associated data

**Response:** 
```json
{
  "success": true,
  "data": null,
  "error": null
}
```

## Response API

### Submit Form Response

**Endpoint:** `POST /api/forms/:id/responses`

**Authentication:** Optional

**Description:** Submits a response to a form

**Request Body:**
For JSON submissions:
```json
{
  "fields": {
    "clk5y73wt0001rx3x8q7a2f2": "John Doe",
    "clk5y73wt0002rx3x8q7a2f3": "john@example.com"
  }
}
```

For file uploads, use `multipart/form-data` format.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clk5y73wt0003rx3x8q7a2f4",
    "formId": "clk5y73wt0000rx3xh9q7a2f1",
    "createdAt": "2024-05-15T14:00:00.000Z",
    "userId": null
  },
  "error": null
}
```

### Get Form Responses

**Endpoint:** `GET /api/forms/:id/responses`

**Authentication:** Required

**Description:** Retrieves all responses for a specific form

**Query Parameters:**
- `limit` (optional): Limit the number of results
- `offset` (optional): Offset for pagination
- `sort` (optional): Sort by field (default: createdAt)
- `order` (optional): Sort order (asc/desc, default: desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "responses": [
      {
        "id": "clk5y73wt0003rx3x8q7a2f4",
        "formId": "clk5y73wt0000rx3xh9q7a2f1",
        "createdAt": "2024-05-15T14:00:00.000Z",
        "userId": null,
        "fields": {
          "clk5y73wt0001rx3x8q7a2f2": "John Doe",
          "clk5y73wt0002rx3x8q7a2f3": "john@example.com"
        }
      }
    ],
    "total": 1
  },
  "error": null
}
```

### Get Response Details

**Endpoint:** `GET /api/responses/:id`

**Authentication:** Required

**Description:** Retrieves details of a specific response

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clk5y73wt0003rx3x8q7a2f4",
    "formId": "clk5y73wt0000rx3xh9q7a2f1",
    "createdAt": "2024-05-15T14:00:00.000Z",
    "userId": null,
    "form": {
      "title": "Customer Feedback"
    },
    "fields": [
      {
        "fieldId": "clk5y73wt0001rx3x8q7a2f2",
        "value": "John Doe",
        "field": {
          "label": "Name",
          "type": "text"
        }
      },
      {
        "fieldId": "clk5y73wt0002rx3x8q7a2f3",
        "value": "john@example.com",
        "field": {
          "label": "Email",
          "type": "text"
        }
      }
    ]
  },
  "error": null
}
```

### Delete Response

**Endpoint:** `DELETE /api/responses/:id`

**Authentication:** Required

**Description:** Deletes a specific response

**Response:**
```json
{
  "success": true,
  "data": null,
  "error": null
}
```

### Export Responses to CSV

**Endpoint:** `GET /api/forms/:id/responses/export`

**Authentication:** Required

**Description:** Exports all responses for a form to CSV format

**Response:** CSV file download

## File API

### Get File

**Endpoint:** `GET /api/files/:id`

**Authentication:** Required

**Description:** Downloads a file attached to a form response

**Response:** File download

### Delete File

**Endpoint:** `DELETE /api/files/:id`

**Authentication:** Required

**Description:** Deletes a file attached to a form response

**Response:**
```json
{
  "success": true,
  "data": null,
  "error": null
}
```

## User API

### Get Current User

**Endpoint:** `GET /api/user`

**Authentication:** Required

**Description:** Retrieves information about the current authenticated user

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_2Nq9L3U8A8k2k3j2n3k2j3n2",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "error": null
}
```

### Get User Forms

**Endpoint:** `GET /api/user/forms`

**Authentication:** Required

**Description:** Retrieves all forms created by the current user

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clk5y73wt0000rx3xh9q7a2f1",
      "title": "Customer Feedback",
      "published": true,
      "createdAt": "2024-05-15T12:00:00.000Z",
      "_count": {
        "responses": 5
      }
    }
  ],
  "error": null
}
```

## Rate Limiting

API requests are rate-limited to prevent abuse. The current limits are:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

If you exceed the rate limit, you will receive a 429 Too Many Requests response with a Retry-After header indicating when you can try again.

## Webhook Support

The API supports webhooks for real-time notifications when certain events occur. To set up webhooks, contact the administrator.

## API Versioning

The API is versioned to ensure backward compatibility. The current version is v1. When new versions are released, the old versions will be maintained for a period of time to allow for migration.

## Support

For API support, please contact support@cursor-crm.com or open an issue on the GitHub repository. 