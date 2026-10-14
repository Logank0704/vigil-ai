import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../db';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { name: 'asc' }
    });

    // Calculate load and uptime for each agent
    const agentsWithMetrics = agents.map(agent => {
      const metrics = (agent.metrics as any) || {};
      const lastHeartbeat = agent.lastHeartbeat;
      const now = new Date();
      
      // Calculate uptime (time since last heartbeat, or 0 if offline)
      let uptime = 0;
      if (lastHeartbeat && agent.status !== 'OFFLINE') {
        uptime = Math.floor((now.getTime() - lastHeartbeat.getTime()) / 1000);
      }

      // Get load from metrics or simulate
      const load = metrics.load || (agent.status === 'OPERATIONAL' ? Math.random() * 30 + 10 : 0);

      return {
        id: agent.id,
        name: agent.name,
        type: agent.type,
        status: agent.status,
        version: agent.version,
        load: Math.round(load),
        uptime,
        lastHeartbeat: agent.lastHeartbeat,
        metrics
      };
    });

    res.json({ agents: agentsWithMetrics });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/logs', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: req.params.id }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const logs = await prisma.auditLog.findMany({
      where: {
        agentName: agent.name,
        orgId: req.orgId || undefined
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    res.json({ logs });
  } catch (error) {
    console.error('Get agent logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

