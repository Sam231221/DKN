# DKN Server - Express.js Backend

Express.js backend server for the DKN Knowledge Management System with Drizzle ORM and TypeScript.

## Features

- ✅ Express.js with TypeScript
- ✅ Drizzle ORM for database operations
- ✅ PostgreSQL database support
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ RESTful API endpoints
- ✅ Error handling middleware
- ✅ CORS and security headers

## Prerequisites

- Node.js 18+ 
- PostgreSQL database (or SQLite for development)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dkn_db
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:5173
```

## Database Setup

1. Create your PostgreSQL database:
```sql
CREATE DATABASE dkn_db;
```

2. Generate migrations:
```bash
npm run db:generate
```

3. Run migrations:
```bash
npm run db:migrate
```

4. (Optional) Open Drizzle Studio:
```bash
npm run db:studio
```

## Development

Start the development server with hot reload:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

## Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users (authenticated)
- `GET /api/users/:id` - Get user by ID (authenticated)
- `PATCH /api/users/:id` - Update user (authenticated)

### Knowledge Items
- `GET /api/knowledge` - Get all knowledge items (authenticated)
- `GET /api/knowledge/:id` - Get knowledge item by ID (authenticated)
- `POST /api/knowledge` - Create knowledge item (authenticated)
- `PATCH /api/knowledge/:id` - Update knowledge item (authenticated)
- `DELETE /api/knowledge/:id` - Delete knowledge item (authenticated)

## Project Structure

```
server/
├── src/
│   ├── controllers/     # Route controllers
│   ├── db/
│   │   ├── schema/      # Drizzle schema definitions
│   │   ├── migrations/  # Database migrations
│   │   └── connection.ts
│   ├── middleware/        # Express middleware
│   ├── routes/          # API routes
│   └── index.ts         # Entry point
├── dist/                # Compiled JavaScript
├── package.json
├── tsconfig.json
└── drizzle.config.ts
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - Token expiration time (default: 7d)
- `CORS_ORIGIN` - Allowed CORS origin

## License

ISC

