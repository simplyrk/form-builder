# API Documentation

This document outlines the available API endpoints in the Form Builder application.

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
      "label": "Phone Number",
      "type": "text",
      "required": false,
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
    "published": false,
    "createdAt": "2024-05-15T12:00:00.000Z",
    "updatedAt": "2024-05-15T12:30:00.000Z",
    "createdBy": "user_2Nq9L3U8A8k2k3j2n3k2j3n2"
  },
  "error": null
}
```

### Delete Form

**Endpoint:** `DELETE /api/forms/:id`

**Authentication:** Required

**Description:** Deletes a form and all associated fields and responses

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clk5y73wt0000rx3xh9q7a2f1"
  },
  "error": null
}
```

### Publish Form

**Endpoint:** `PATCH /api/forms/:id/publish`

**Authentication:** Required

**Description:** Publishes a form, making it available for submissions

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clk5y73wt0000rx3xh9q7a2f1",
    "published": true,
    "updatedAt": "2024-05-15T13:00:00.000Z"
  },
  "error": null
}
```

### Unpublish Form

**Endpoint:** `PATCH /api/forms/:id/unpublish`

**Authentication:** Required

**Description:** Unpublishes a form, preventing new submissions

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clk5y73wt0000rx3xh9q7a2f1",
    "published": false,
    "updatedAt": "2024-05-15T13:10:00.000Z"
  },
  "error": null
}
```

## Response API

### Submit Response

**Endpoint:** `POST /api/forms/:id/responses`

**Authentication:** Optional (anonymous submissions allowed)

**Description:** Submits a response to a published form

**Request Body:**
```json
{
  "fields": [
    {
      "fieldId": "clk5y73wt0001rx3x8q7a2f2",
      "value": "John Doe"
    },
    {
      "fieldId": "clk5y73wt0002rx3x8q7a2f3",
      "value": "john@example.com"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clk5y8a4t0003rx3x9q7b3g2",
    "formId": "clk5y73wt0000rx3xh9q7a2f1",
    "createdAt": "2024-05-15T13:30:00.000Z",
    "createdBy": "user_2Nq9L3U8A8k2k3j2n3k2j3n2" // or null for anonymous submissions
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
- `sort` (optional): Sort by field (createdAt)
- `order` (optional): Sort order (asc/desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clk5y8a4t0003rx3x9q7b3g2",
      "formId": "clk5y73wt0000rx3xh9q7a2f1",
      "createdAt": "2024-05-15T13:30:00.000Z",
      "createdBy": "user_2Nq9L3U8A8k2k3j2n3k2j3n2",
      "fields": [
        {
          "id": "clk5y8a4t0004rx3x9q7b3g3",
          "fieldId": "clk5y73wt0001rx3x8q7a2f2",
          "value": "John Doe",
          "responseId": "clk5y8a4t0003rx3x9q7b3g2"
        },
        {
          "id": "clk5y8a4t0005rx3x9q7b3g4",
          "fieldId": "clk5y73wt0002rx3x8q7a2f3",
          "value": "john@example.com",
          "responseId": "clk5y8a4t0003rx3x9q7b3g2"
        }
      ]
    }
  ],
  "meta": {
    "total": 5,
    "limit": 10,
    "offset": 0
  },
  "error": null
}
```

### Get Response

**Endpoint:** `GET /api/forms/:formId/responses/:responseId`

**Authentication:** Required

**Description:** Retrieves a specific response by ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clk5y8a4t0003rx3x9q7b3g2",
    "formId": "clk5y73wt0000rx3xh9q7a2f1",
    "createdAt": "2024-05-15T13:30:00.000Z",
    "createdBy": "user_2Nq9L3U8A8k2k3j2n3k2j3n2",
    "fields": [
      {
        "id": "clk5y8a4t0004rx3x9q7b3g3",
        "fieldId": "clk5y73wt0001rx3x8q7a2f2",
        "field": {
          "label": "Name",
          "type": "text"
        },
        "value": "John Doe",
        "responseId": "clk5y8a4t0003rx3x9q7b3g2"
      },
      {
        "id": "clk5y8a4t0005rx3x9q7b3g4",
        "fieldId": "clk5y73wt0002rx3x8q7a2f3",
        "field": {
          "label": "Email",
          "type": "text"
        },
        "value": "john@example.com",
        "responseId": "clk5y8a4t0003rx3x9q7b3g2"
      }
    ]
  },
  "error": null
}
```

### Delete Response

**Endpoint:** `DELETE /api/forms/:formId/responses/:responseId`

**Authentication:** Required

**Description:** Deletes a specific response

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clk5y8a4t0003rx3x9q7b3g2"
  },
  "error": null
}
```

### Export Responses as CSV

**Endpoint:** `GET /api/forms/:id/responses/export`

**Authentication:** Required

**Description:** Exports all form responses as a CSV file

**Query Parameters:**
- Same as Get Form Responses

**Response:** CSV file download

## File API

### Upload File

**Endpoint:** `POST /api/files`

**Authentication:** Required

**Description:** Uploads a file to be used in form responses

**Request:** Multipart form data with file field

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "f8a7b9c6-5d4e-3f2a-1b0c-9d8e7f6a5b4c.pdf",
    "originalName": "document.pdf",
    "path": "/uploads/f8a7b9c6-5d4e-3f2a-1b0c-9d8e7f6a5b4c.pdf",
    "size": 1024,
    "mimeType": "application/pdf"
  },
  "error": null
}
```

### Get File

**Endpoint:** `GET /api/files/:filename`

**Authentication:** Required

**Description:** Retrieves a file by its filename

**Response:** The file content with appropriate Content-Type header

## User API

### Get Current User

**Endpoint:** `GET /api/user`

**Authentication:** Required

**Description:** Retrieves information about the currently authenticated user

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_2Nq9L3U8A8k2k3j2n3k2j3n2",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "imageUrl": "https://clerk.example.com/user_2Nq9L3U8A8k2k3j2n3k2j3n2/image.jpg"
  },
  "error": null
}
```

## Admin API

### Get All Forms (Admin)

**Endpoint:** `GET /api/admin/forms`

**Authentication:** Required (Admin only)

**Description:** Retrieves all forms across all users (admin only)

**Query Parameters:**
- Same as Get Forms

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
      "user": {
        "email": "user@example.com"
      },
      "_count": {
        "responses": 5
      }
    }
  ],
  "meta": {
    "total": 10,
    "limit": 10,
    "offset": 0
  },
  "error": null
}
```

### Get System Stats (Admin)

**Endpoint:** `GET /api/admin/stats`

**Authentication:** Required (Admin only)

**Description:** Retrieves system statistics and metrics (admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "forms": {
      "total": 25,
      "published": 18
    },
    "responses": {
      "total": 150,
      "today": 12
    },
    "users": {
      "total": 8,
      "active": 5
    },
    "storage": {
      "total": 25600000,
      "used": 15360000
    }
  },
  "error": null
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. Rate limits are as follows:

- Public endpoints: 50 requests per minute
- Authenticated endpoints: 100 requests per minute
- File upload endpoints: 10 requests per minute

When a rate limit is exceeded, the API returns a 429 Too Many Requests status code with a response body containing information about the rate limit:

```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Rate limit exceeded. Please try again later.",
    "code": "RATE_LIMIT_EXCEEDED",
    "reset": 30 // Seconds until the rate limit resets
  }
}
``` 