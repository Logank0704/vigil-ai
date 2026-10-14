import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { DevOpsAgent } from '../agents/devops.agent';
import prisma from '../db';

const router = Router();
const devopsAgent = new DevOpsAgent();

router.get('/metrics', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const metrics = await devopsAgent.collectMetrics(req.orgId);

    // Get recent events for the chart
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentEvents = await prisma.promptEvent.findMany({
      where: {
        orgId: req.orgId,
        createdAt: { gte: oneHourAgo }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by time intervals for chart
    const chartData = [];
    const intervalMs = 5 * 60 * 1000; // 5 minutes
    let currentTime = oneHourAgo.getTime();

    while (currentTime < Date.now()) {
      const intervalEnd = currentTime + intervalMs;
      const count = recentEvents.filter(
        e => e.createdAt.getTime() >= currentTime && e.createdAt.getTime() < intervalEnd
      ).length;

      chartData.push({
        time: new Date(currentTime).toISOString(),
        count
      });

      currentTime = intervalEnd;
    }

    // Calculate risk score (average of recent prompts)
    const riskScore = metrics.averageRiskScore * 100;

    res.json({
      riskScore: Math.round(riskScore),
      threatsBlocked: metrics.blockedPrompts,
      activePolicies: metrics.activePolicies,
      systemLatency: Math.round(metrics.averageLatency),
      chartData,
      metrics
    });
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/events', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const severity = req.query.severity as string | undefined;

    const where: any = {
      orgId: req.orgId
    };

    if (severity) {
      where.severity = severity;
    }

    const events = await prisma.promptEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        policyViolations: {
          include: {
            policy: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    const total = await prisma.promptEvent.count({ where });

    res.json({
      events: events.map(e => ({
        id: e.id,
        timestamp: e.createdAt,
        severity: e.severity,
        event: 'Prompt Processed',
        agent: 'PipelineService',
        status: e.severity === 'CRITICAL' || e.severity === 'HIGH' ? 'blocked' : 'allowed',
        riskScore: e.riskScore,
        findings: e.findings,
        violations: e.policyViolations.length,
        user: e.user?.name || 'System'
      })),
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

