import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import playgroundRoutes from './routes/playground';
import dashboardRoutes from './routes/dashboard';
import policiesRoutes from './routes/policies';
import agentsRoutes from './routes/agents';
import logsRoutes from './routes/logs';
import { DevOpsAgent } from './agents/devops.agent';
import { AgentType, AgentStatus } from '@prisma/client';
import { getCorsOrigins } from './config';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: getCorsOrigins() }));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/playground', playgroundRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/policies', policiesRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/logs', logsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize agents
async function initializeAgents() {
  const devopsAgent = new DevOpsAgent();

  // Initialize agent heartbeats
  const agents = [
    { name: 'RiskDetectionAgent', type: AgentType.RISK_DETECTION },
    { name: 'PolicyEnforcementAgent', type: AgentType.POLICY_ENFORCEMENT },
    { name: 'RewriteAgent', type: AgentType.REWRITE },
    { name: 'RedTeamAgent', type: AgentType.RED_TEAM },
    { name: 'DevOpsAgent', type: AgentType.DEVOPS }
  ];

  for (const agent of agents) {
    await devopsAgent.updateAgentHeartbeat(
      agent.name,
      agent.type,
      AgentStatus.OPERATIONAL,
      { load: Math.random() * 30 + 10 }
    );
  }

  // Update heartbeats periodically
  setInterval(async () => {
    for (const agent of agents) {
      await devopsAgent.updateAgentHeartbeat(
        agent.name,
        agent.type,
        AgentStatus.OPERATIONAL,
        { load: Math.random() * 30 + 10 }
      );
    }
  }, 30000); // Every 30 seconds
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Vigil AI Backend running on port ${PORT}`);
  await initializeAgents();
  console.log('✅ Agents initialized');
});

