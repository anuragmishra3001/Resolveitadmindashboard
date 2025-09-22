# Authentication System

This document describes the JWT-based authentication system implemented for the Resolve It Admin Dashboard.

## Overview

The authentication system provides secure access control for the admin dashboard using JSON Web Tokens (JWT) with the following features:

- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (admin, super-admin)
- **Protected API endpoints** requiring authentication
- **Token refresh mechanism** for seamless user experience
- **Secure logout** with token blacklisting

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/login`
Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "admin@resolveit.gov",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "1",
      "email": "admin@resolveit.gov",
      "name": "Admin User",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST `/api/auth/verify`
Verify if a JWT token is valid.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": {
      "id": "1",
      "email": "admin@resolveit.gov",
      "role": "admin"
    }
  }
}
```

#### POST `/api/auth/refresh`
Refresh an expired access token.

**Headers:**
```
Authorization: Bearer <refresh_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST `/api/auth/logout`
Logout user and blacklist the token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Demo Users

The system includes two demo users for testing:

### Admin User
- **Email:** admin@resolveit.gov
- **Password:** admin123
- **Role:** admin
- **Access:** Dashboard, Reports, Departments

### Super Admin User
- **Email:** superadmin@resolveit.gov
- **Password:** superadmin123
- **Role:** super-admin
- **Access:** All features including Settings

## Security Features

### JWT Configuration
- **Access Token Expiry:** 24 hours
- **Refresh Token Expiry:** 7 days
- **Secret Key:** Configurable via environment variables
- **Algorithm:** HS256

### Token Management
- **Automatic Refresh:** Tokens are refreshed every 15 minutes
- **Blacklisting:** Logged out tokens are blacklisted
- **Validation:** All protected endpoints validate token authenticity

### Password Security
- **Hashing:** Passwords are hashed using bcryptjs
- **Salt Rounds:** 10 rounds for secure hashing
- **No Plain Text:** Passwords are never stored in plain text

## Protected Endpoints

All API endpoints except `/api/health` and `/api/auth/*` require authentication:

- `GET /api/departments` - Get all departments
- `GET /api/reports` - Get all reports
- `GET /api/reports/:id` - Get specific report
- `POST /api/reports` - Submit new report
- `PATCH /api/reports/:id/status` - Update report status
- `PATCH /api/reports/:id/reassign` - Reassign report

## Frontend Integration

### Authentication Context
The frontend uses React Context for authentication state management:

```typescript
const { user, token, isAuthenticated, login, logout } = useAuth()
```

### Protected Routes
Routes are protected using the `ProtectedRoute` component:

```typescript
<ProtectedRoute requiredRole="super-admin">
  <Settings />
</ProtectedRoute>
```

### Automatic Token Refresh
The system automatically refreshes tokens before expiry to maintain seamless user experience.

## Environment Variables

Configure the following environment variables:

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

## Security Best Practices

1. **Change Default Secrets:** Always change the JWT secret in production
2. **Use HTTPS:** Ensure all communication is encrypted
3. **Token Storage:** Store tokens securely in localStorage
4. **Regular Rotation:** Consider implementing token rotation
5. **Rate Limiting:** API endpoints are rate-limited to prevent abuse
6. **Input Validation:** All inputs are validated using Joi schemas

## Error Handling

The system provides comprehensive error handling:

- **401 Unauthorized:** Invalid or missing token
- **403 Forbidden:** Insufficient permissions
- **400 Bad Request:** Invalid input data
- **500 Internal Server Error:** Server-side errors

## Future Enhancements

- **Database Integration:** Replace in-memory storage with database
- **Password Reset:** Implement password reset functionality
- **Two-Factor Authentication:** Add 2FA support
- **Session Management:** Implement session tracking
- **Audit Logging:** Log authentication events
