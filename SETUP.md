# Vigil AI Setup Guide

## Quick Start (5 minutes)

### Option 1: Docker (Recommended)

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Option 2: Local Development

#### Step 1: Database Setup

```bash
# Install PostgreSQL (if not already installed)
# macOS: brew install postgresql@15
# Ubuntu: sudo apt-get install postgresql-15
# Windows: Download from postgresql.org

# Create database
createdb vigil_ai
# Or using psql:
# psql -U postgres
# CREATE DATABASE vigil_ai;
```

#### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/vigil_ai?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3001
NODE_ENV=development
EOF

# Run migrations
npx prisma migrate dev

# Seed database
npm run prisma:seed

# Start backend (in development mode)
npm run dev
```

Backend will run on http://localhost:3001

#### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001/api
EOF

# Start frontend (in development mode)
npm run dev
```

Frontend will run on http://localhost:3000

## Default Credentials

After seeding, you can login with:

- **Admin**: `admin@cyberdyne.com` / `admin123`
- **Analyst**: `analyst@cyberdyne.com` / `analyst123`

## Troubleshooting

### Database Connection Issues

1. Verify PostgreSQL is running:
   ```bash
   # macOS/Linux
   pg_isready
   
   # Or check process
   ps aux | grep postgres
   ```

2. Check DATABASE_URL in backend/.env matches your PostgreSQL setup

3. Ensure database exists:
   ```bash
   psql -U your_user -l | grep vigil_ai
   ```

### Port Already in Use

If port 3000 or 3001 is already in use:

```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process or change ports in:
# - Backend: backend/.env (PORT=3001)
# - Frontend: frontend/package.json (dev script)
```

### Prisma Issues

```bash
# Reset database (WARNING: deletes all data)
cd backend
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate
```

### Frontend Build Issues

```bash
cd frontend

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install
```

## Development Workflow

1. **Backend changes**: Restart the dev server (`npm run dev`)
2. **Frontend changes**: Hot reload is automatic
3. **Database changes**: Run `npx prisma migrate dev` after schema changes
4. **Seed data**: Run `npm run prisma:seed` to reset sample data

## Production Build

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm start
```

## Next Steps

1. Explore the Dashboard to see metrics and recent events
2. Try the Playground to test prompt analysis
3. Create custom policies in Policy Manager
4. Monitor agent status in Agents Panel
5. Review audit logs for compliance

## Architecture Overview

- **Backend**: Express.js API with Prisma ORM
- **Frontend**: Next.js 14 with App Router
- **Database**: PostgreSQL
- **Agents**: Modular agent system for risk detection and policy enforcement
- **Auth**: JWT-based with role-based access control

For more details, see [README.md](./README.md)

