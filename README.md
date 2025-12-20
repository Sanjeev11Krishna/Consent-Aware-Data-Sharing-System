# Consent-Aware Data Sharing System

A privacy-focused data sharing platform built with the MERN stack that enables users to request, grant, and manage consent for personal data access with full audit trails.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Security](#security)
- [License](#license)

## Features

### User Management
- User registration and authentication
- Secure password hashing with bcrypt
- JWT-based session management
- Personal information storage

### Consent Management
- Request data access from other users
- Grant or decline consent requests
- Manage active consents
- Revoke previously granted consents
- Set expiration dates for consents

### Data Access
- Access personal information with proper consent
- Access location data with user permission
- Access browser data with explicit consent
- View requested data in a user-friendly format

### Audit & Compliance
- Comprehensive activity logging
- Consent lifecycle tracking
- Data access history
- Statistics dashboard

### Privacy Controls
- Granular consent permissions
- Expiration-based access control
- Full audit trail of all activities
- User-controlled data sharing

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   Database      │
│   (React)       │◄──►│   (Node.js/      │◄──►│   (MongoDB)     │
│                 │    │    Express)      │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Frontend
- Built with React and Vite for fast development
- Responsive UI with modern design
- Context API for state management
- Axios for API communication

### Backend
- RESTful API built with Express.js
- MongoDB for data persistence
- Mongoose ODM for database operations
- JWT authentication
- bcrypt.js for password hashing

### Data Flow
1. Users register and authenticate
2. Users can request data access from others
3. Consent requests are stored with details
4. Users review and approve/decline requests
5. Approved data access is time-bound
6. All activities are logged for audit purposes

## Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and development server
- **Axios** - HTTP client
- **CSS Modules** - Styling

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcrypt.js** - Password hashing
- **dotenv** - Environment configuration

### Development Tools
- **Nodemon** - Auto-restart during development
- **Concurrently** - Run multiple commands
- **ESLint** - Code linting

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm 8+** (comes with Node.js)
- **MongoDB 5+** ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/))

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd consent-aware-data-sharing-system
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Install root dependencies**
   ```bash
   npm install
   ```

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/consent-sharing
JWT_SECRET=your_jwt_secret_key_here
```

### MongoDB Setup

1. **Start MongoDB service**
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   sudo systemctl start mongod
   ```

2. **Verify MongoDB connection**
   ```bash
   mongo
   ```

## Running the Application

### Development Mode

From the root directory:

```bash
npm run dev
```

This will start both the backend and frontend servers concurrently:
- Backend API: http://localhost:5000
- Frontend: http://localhost:5173

### Production Mode

1. **Build frontend**
   ```bash
   cd frontend
   npm run build
   cd ..
   ```

2. **Start backend**
   ```bash
   cd backend
   npm start
   ```

## Testing

### Manual Testing

1. **Register a new user**
   - Navigate to http://localhost:5173
   - Click "Register" and fill in the form
   - Submit to create a new account

2. **Login**
   - Use registered credentials to login
   - Verify successful authentication

3. **Request Consent**
   - Go to "Request Data Access" tab
   - Enter another user's email
   - Select data types and purpose
   - Submit consent request

4. **Manage Consents**
   - Check "Consent Requests" tab for incoming requests
   - Accept or decline requests
   - View granted/active consents
   - Revoke consents when needed

5. **Access Data**
   - In "My Data Access" tab, click on available data types
   - View the shared data

6. **View Audit Logs**
   - Check "Activity Log" tab
   - Review all consent-related activities

### API Testing

Use tools like Postman or curl to test API endpoints:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Request consent
curl -X POST http://localhost:5000/api/consents/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"requesterEmail":"other@example.com","dataTypes":["personal-info"],"purpose":"Research"}'
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Consents
- `POST /api/consents/request` - Request data access
- `GET /api/consents/pending-requests` - Get pending consent requests
- `PUT /api/consents/accept/:consentId` - Accept consent request
- `PUT /api/consents/decline/:consentId` - Decline consent request
- `GET /api/consents/my-consents` - Get user's granted consents
- `GET /api/consents/granted-consents` - Get consents granted by user
- `PUT /api/consents/revoke/:consentId` - Revoke consent
- `POST /api/consents/request-data` - Request data access

### Audit
- `GET /api/audit/my-logs` - Get user audit logs

## Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  personalInfo: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    address: String,
    phoneNumber: String
  },
  locationData: {
    currentLocation: {
      latitude: Number,
      longitude: Number
    },
    homeAddress: String,
    timestamp: Date
  },
  browserData: {
    userAgent: String,
    language: String,
    platform: String,
    cookiesEnabled: Boolean,
    screenSize: {
      width: Number,
      height: Number
    },
    timezone: String
  }
}
```

### Consent
```javascript
{
  granter: ObjectId (references User),
  requester: ObjectId (references User),
  dataTypes: [String] (personal-info, location-data, browser-data),
  purpose: String,
  status: String (pending, active, revoked, expired, declined),
  grantedAt: Date,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### AuditLog
```javascript
{
  action: String (REQUESTED, GRANTED, DECLINED, REVOKED, ACCESSED, EXPIRED, REGISTERED),
  userId: ObjectId (references User),
  requesterId: ObjectId (references User),
  consentId: ObjectId (references Consent),
  dataType: String,
  purpose: String,
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}
```

## Security

### Authentication
- JWT tokens with 30-day expiration
- Secure password hashing with bcrypt (10 rounds)
- Protected routes with authentication middleware

### Data Protection
- Personal data only accessible with explicit consent
- Time-limited data access permissions
- Comprehensive audit logging
- HTTPS-ready (configure SSL in production)

### Best Practices
- Environment variables for sensitive configuration
- Input validation and sanitization
- Error handling without exposing sensitive information
- CORS configuration for controlled access

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using the MERN stack