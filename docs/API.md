# API Documentation

This document outlines the available API endpoints in the Cursor CRM application.

## Authentication

Authentication is handled by Clerk. API routes are protected using middleware that verifies the authentication token.

## Form API

### Create Form

**Endpoint:** `POST /api/forms`

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
  "id": "clk5y73wt0000rx3xh9q7a2f1",
  "title": "Customer Feedback",
  "description": "Please provide your feedback on our service",
  "published": false,
  "createdAt": "2024-05-15T12:00:00.000Z",
  "updatedAt": "2024-05-15T12:00:00.000Z",
  "createdBy": "user_2Nq9L3U8A8k2k3j2n3k2j3n2"
}
```

### Get Forms

**Endpoint:** `GET /api/forms`

**Description:** Retrieves all forms created by the authenticated user

**Response:**
```json
[
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
]
```

### Get Form

**Endpoint:** `GET /api/forms/:id`

**Description:** Retrieves a specific form by ID

**Response:**
```json
{
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
}
```

### Update Form

**Endpoint:** `PUT /api/forms/:id`

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
  "id": "clk5y73wt0000rx3xh9q7a2f1",
  "title": "Updated Customer Feedback",
  "description": "Updated description",
  "published": true,
  "createdAt": "2024-05-15T12:00:00.000Z",
  "updatedAt": "2024-05-15T13:00:00.000Z",
  "createdBy": "user_2Nq9L3U8A8k2k3j2n3k2j3n2"
}
```

### Toggle Form Publish Status

**Endpoint:** `PATCH /api/forms/:id/publish`

**Description:** Toggles the published status of a form

**Response:**
```json
{
  "id": "clk5y73wt0000rx3xh9q7a2f1",
  "published": false
}
```

### Delete Form

**Endpoint:** `DELETE /api/forms/:id`

**Description:** Deletes a form and all associated data

**Response:** `204 No Content`

## Response API

### Submit Form Response

**Endpoint:** `POST /api/forms/:id/responses`

**Description:** Submits a response to a form

**Request Body:**
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
  "id": "clk5y73wt0003rx3xh9q7a2f4",
  "formId": "clk5y73wt0000rx3xh9q7a2f1",
  "submittedBy": "user_2Nq9L3U8A8k2k3j2n3k2j3n2",
  "createdAt": "2024-05-15T14:00:00.000Z"
}
```

### Get Form Responses

**Endpoint:** `GET /api/forms/:id/responses`

**Description:** Retrieves all responses for a specific form

**Response:**
```json
[
  {
    "id": "clk5y73wt0003rx3xh9q7a2f4",
    "formId": "clk5y73wt0000rx3xh9q7a2f1",
    "submittedBy": "user_2Nq9L3U8A8k2k3j2n3k2j3n2",
    "createdAt": "2024-05-15T14:00:00.000Z",
    "fields": [
      {
        "id": "clk5y73wt0004rx3xh9q7a2f5",
        "responseId": "clk5y73wt0003rx3xh9q7a2f4",
        "fieldId": "clk5y73wt0001rx3x8q7a2f2",
        "value": "John Doe"
      },
      {
        "id": "clk5y73wt0005rx3xh9q7a2f6",
        "responseId": "clk5y73wt0003rx3xh9q7a2f4",
        "fieldId": "clk5y73wt0002rx3x8q7a2f3",
        "value": "john@example.com"
      }
    ]
  }
]
```

### Get Response

**Endpoint:** `GET /api/responses/:id`

**Description:** Retrieves a specific response by ID

**Response:**
```json
{
  "id": "clk5y73wt0003rx3xh9q7a2f4",
  "formId": "clk5y73wt0000rx3xh9q7a2f1",
  "submittedBy": "user_2Nq9L3U8A8k2k3j2n3k2j3n2",
  "createdAt": "2024-05-15T14:00:00.000Z",
  "fields": [
    {
      "id": "clk5y73wt0004rx3xh9q7a2f5",
      "responseId": "clk5y73wt0003rx3xh9q7a2f4",
      "fieldId": "clk5y73wt0001rx3x8q7a2f2",
      "value": "John Doe",
      "field": {
        "label": "Full Name",
        "type": "text"
      }
    },
    {
      "id": "clk5y73wt0005rx3xh9q7a2f6",
      "responseId": "clk5y73wt0003rx3xh9q7a2f4",
      "fieldId": "clk5y73wt0002rx3x8q7a2f3",
      "value": "john@example.com",
      "field": {
        "label": "Email Address",
        "type": "text"
      }
    }
  ]
}
```

### Update Response

**Endpoint:** `PUT /api/responses/:id`

**Description:** Updates an existing response

**Request Body:**
```json
{
  "fields": {
    "clk5y73wt0001rx3x8q7a2f2": "Jane Doe",
    "clk5y73wt0002rx3x8q7a2f3": "jane@example.com"
  }
}
```

**Response:**
```json
{
  "id": "clk5y73wt0003rx3xh9q7a2f4",
  "formId": "clk5y73wt0000rx3xh9q7a2f1",
  "submittedBy": "user_2Nq9L3U8A8k2k3j2n3k2j3n2",
  "createdAt": "2024-05-15T14:00:00.000Z",
  "updatedAt": "2024-05-15T15:00:00.000Z"
}
```

### Delete Response

**Endpoint:** `DELETE /api/responses/:id`

**Description:** Deletes a response

**Response:** `204 No Content`

## File API

### Upload File

**Endpoint:** `POST /api/upload`

**Description:** Uploads a file to the server

**Request:** Use `multipart/form-data` format with a field named `file`

**Response:**
```json
{
  "fileName": "original-file-name.pdf",
  "filePath": "/uploads/1621034567890-original-file-name.pdf",
  "fileSize": 1048576,
  "mimeType": "application/pdf"
}
```

### Get File

**Endpoint:** `GET /uploads/:filePath`

**Description:** Retrieves a file by path (served from static assets)

## Export API

### Export Form Responses as CSV

**Endpoint:** `GET /api/forms/:id/export`

**Description:** Exports all responses for a form as a CSV file

**Response:** CSV file download 