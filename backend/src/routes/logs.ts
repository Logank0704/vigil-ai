import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../db';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const severity = req.query.severity as string | undefined;
    const eventType = req.query.eventType as string | undefined;
    const agentName = req.query.agentName as string | undefined;
    const status = req.query.status as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const where: any = {
      orgId: req.orgId || undefined
    };

    if (severity) {
      where.severity = severity;
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (agentName) {
      where.agentName = agentName;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await prisma.auditLog.count({ where });

    res.json({
      logs,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const log = await prisma.auditLog.findFirst({
      where: {
        id: req.params.id,
        orgId: req.orgId || undefined
      }
    });

    if (!log) {
      return res.status(404).json({ error: 'Log not found' });
    }

    // If this is a prompt event log, get the full prompt event details
    let promptEvent = null;
    if (log.eventType === 'PromptProcessed' && log.metadata) {
      const metadata = log.metadata as any;
      if (metadata.promptEventId) {
        promptEvent = await prisma.promptEvent.findUnique({
          where: { id: metadata.promptEventId },
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
      }
    }

    res.json({
      log,
      promptEvent
    });
  } catch (error) {
    console.error('Get log detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

