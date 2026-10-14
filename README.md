# Vigil AI – Enterprise Defense

An AI safety and security control plane for organizations using LLMs. Monitor prompts and responses for risk, policy violations, and anomalies with automatic safe rewrites and comprehensive audit trails.

## Features

- 🛡️ **Risk Detection**: Automatically detect unsafe content, jailbreak attempts, and security threats
- 📋 **Policy Enforcement**: Create and manage custom policies (PII protection, anti-jailbreak, toxicity filters)
- ✏️ **Safe Rewrites**: Automatically generate sanitized versions of risky prompts
- 📊 **Real-time Dashboard**: Monitor system health, threat volume, and agent activity
- 🤖 **Multi-Agent System**: Risk Detection, Policy Enforcement, Rewrite, Red Team, and DevOps agents
- 📝 **Audit Logging**: Comprehensive audit trail for compliance
- 🎨 **Modern UI**: Dark, futuristic interface with glassmorphism design

## Architecture

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based with role-based access control
- **Agents**: Modular agent system for risk detection, policy enforcement, and rewriting

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom dark theme
- **State Management**: Zustand
- **Charts**: Recharts

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### Local Development

1. **Clone and setup**
```bash
cd vigil-ai
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database URL and JWT secret
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

3. **Frontend Setup** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Default credentials:
  - Admin: `admin@cyberdyne.com` / `admin123`
  - Analyst: `analyst@cyberdyne.com` / `analyst123`

### Docker Setup

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 3001
- Frontend on port 3000

## Project Structure

```
vigil-ai/
├── backend/
│   ├── src/
│   │   ├── agents/          # Agent implementations
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── middleware/      # Auth middleware
│   │   ├── db.ts            # Prisma client
│   │   ├── index.ts         # Express server
│   │   └── seed.ts          # Database seeding
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # React components
│   │   └── lib/             # Utilities and API client
│   └── package.json
└── docker-compose.yml
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Playground
- `POST /api/playground/analyze` - Analyze a prompt through the full pipeline

### Dashboard
- `GET /api/dashboard/metrics` - Get dashboard metrics
- `GET /api/dashboard/events` - Get recent security events

### Policies
- `GET /api/policies` - List all policies
- `GET /api/policies/:id` - Get policy details
- `POST /api/policies` - Create policy (Admin/Analyst)
- `PATCH /api/policies/:id` - Update policy (Admin/Analyst)
- `DELETE /api/policies/:id` - Delete policy (Admin)

### Agents
- `GET /api/agents` - Get all agent statuses
- `GET /api/agents/:id/logs` - Get agent logs

### Logs
- `GET /api/logs` - Get audit logs with filters
- `GET /api/logs/:id` - Get log details

## Database Models

- **User**: Authentication and authorization
- **Organization**: Multi-tenant support
- **Policy**: Security policies with JSON rules
- **Agent**: Agent status and metrics
- **PromptEvent**: Processed prompts with risk scores
- **PolicyViolation**: Policy violations linked to prompts
- **AuditLog**: System audit trail

## Agent System

### Risk Detection Agent
Analyzes prompts for:
- Suspicious keywords (hack, exploit, jailbreak, etc.)
- High-risk patterns (SQL injection, XSS, etc.)
- PII detection (SSN, credit cards, emails)
- Jailbreak attempts

### Policy Enforcement Agent
Evaluates prompts against active policies:
- Keyword-based rules
- Regex pattern matching
- Custom rule types

### Rewrite Agent
Generates safe rewrites of risky prompts:
- Removes suspicious phrases
- Masks PII
- Adds safety context for high-risk prompts

### Red Team Agent
Periodically runs adversarial tests to evaluate system robustness.

### DevOps Agent
Tracks system health metrics and agent statuses.

## Development

### Running Tests
```bash
cd backend
npm test
```

### Database Migrations
```bash
cd backend
npx prisma migrate dev
```

### Seeding Database
```bash
cd backend
npm run prisma:seed
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/vigil_ai?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3001
NODE_ENV=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- Rate limiting on API endpoints
- Role-based access control (Admin, Analyst, Viewer)
- Input validation on all endpoints

## Production Deployment

1. Set strong `JWT_SECRET` and database credentials
2. Use environment-specific database URLs
3. Enable HTTPS
4. Configure CORS properly
5. Set up monitoring and logging
6. Run database migrations: `npx prisma migrate deploy`

## License

MIT

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

