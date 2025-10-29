# Experts Dictionary API

A robust API for managing medical dictionary terms with user authentication and role-based access control.

## Base URL

```
https://specialist-dictionary-api.binarybinayak.com
```

## Authentication

The API uses JWT (JSON Web Token) authentication. Tokens are provided via cookies upon successful login/signup.

## Endpoints

### Authentication Routes (`/auth`)

#### Sign Up

- **POST** `/auth/signup`
- **Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response:** Returns user details and sets authentication cookie

#### Login

- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:** Returns user details and sets authentication cookie

### User Routes (`/user`)

All these routes require authentication

#### Get Current User

- **GET** `/user`
- **Response:** Returns current user details

#### Update User

- **PATCH** `/user`
- **Body:**
  ```json
  {
    "name": "string",
    "userType": "string" // optional
  }
  ```
- **Response:** Returns updated user details

#### Update Password

- **PATCH** `/user/password`
- **Body:**
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string"
  }
  ```
- **Response:** Returns success message

### Medical Dictionary Routes (`/medical-dictionary`)

#### Get Word Definition

- **GET** `/medical-dictionary?word=example`
- **Query Parameters:** `word` (required)
- **Response:** Returns word definition and details

#### Search Words

- **GET** `/medical-dictionary/search?query=example`
- **Query Parameters:** `query` (required)
- **Response:** Returns matching words

#### Request Word Update (Authenticated)

- **POST** `/medical-dictionary/request-update`
- **Body:**
  ```json
  {
    "word": "string",
    "definition": "string",
    "explanation": "string"
  }
  ```
- **Response:** Returns update request details

#### Request Word Deletion (Authenticated)

- **POST** `/medical-dictionary/request-delete`
- **Body:**
  ```json
  {
    "word": "string",
    "reason": "string"
  }
  ```
- **Response:** Returns delete request details

#### Add/Update Word (Admin/Editor Only)

- **POST** `/medical-dictionary`
- **Body:**
  ```json
  {
    "word": "string",
    "definition": "string",
    "explanation": "string"
  }
  ```
- **Response:** Returns added/updated word details

#### Get Update Requests (Admin/Editor Only)

- **GET** `/medical-dictionary/update-requests`
- **Response:** Returns list of pending update requests

#### Get Delete Requests (Admin/Editor Only)

- **GET** `/medical-dictionary/delete-requests`
- **Response:** Returns list of pending delete requests

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description"
}
```

Common HTTP status codes:

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## User Types

- Regular User: Can view words and submit update/delete requests
- Editor: Can approve/reject requests and modify dictionary content
- Admin: Has full access to all features

## Environment Variables

Required environment variables:

- PORT: Server port (default 80 for production)
- MONGODB_CONNECTION_SECRET: MongoDB connection string
- JWT_SECRET: Secret for JWT token generation
- BCRYPT_SALT_ROUNDS: Number of salt rounds for password hashing
- ALLOWED_ORIGINS: Comma-separated list of allowed CORS origins

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`
4. Run development server: `npm run dev`
5. Build for production: `npm run build`

## Deployment

The API is containerized and deployed using CapRover. See Dockerfile for container configuration.

## Technologies Used

- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
