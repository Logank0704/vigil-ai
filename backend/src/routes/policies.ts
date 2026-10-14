import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import prisma from '../db';

const router = Router();

const createPolicySchema = z.object({
  name: z.string().min(1),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  active: z.boolean().optional().default(true),
  description: z.string().optional(),
  rules: z.record(z.any())
});

const updatePolicySchema = createPolicySchema.partial();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const policies = await prisma.policy.findMany({
      where: { orgId: req.orgId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ policies });
  } catch (error) {
    console.error('Get policies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const policy = await prisma.policy.findFirst({
      where: {
        id: req.params.id,
        orgId: req.orgId
      }
    });

    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.json({ policy });
  } catch (error) {
    console.error('Get policy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post(
  '/',
  authenticate,
  requireRole('ADMIN', 'ANALYST'),
  async (req: AuthRequest, res: Response) => {
    try {
      const data = createPolicySchema.parse(req.body);

      const policy = await prisma.policy.create({
        data: {
          ...data,
          orgId: req.orgId!
        }
      });

      res.status(201).json({ policy });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Create policy error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.patch(
  '/:id',
  authenticate,
  requireRole('ADMIN', 'ANALYST'),
  async (req: AuthRequest, res: Response) => {
    try {
      const data = updatePolicySchema.parse(req.body);

      const policy = await prisma.policy.updateMany({
        where: {
          id: req.params.id,
          orgId: req.orgId
        },
        data
      });

      if (policy.count === 0) {
        return res.status(404).json({ error: 'Policy not found' });
      }

      const updated = await prisma.policy.findUnique({
        where: { id: req.params.id }
      });

      res.json({ policy: updated });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Update policy error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const result = await prisma.policy.deleteMany({
        where: {
          id: req.params.id,
          orgId: req.orgId
        }
      });

      if (result.count === 0) {
        return res.status(404).json({ error: 'Policy not found' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Delete policy error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;

