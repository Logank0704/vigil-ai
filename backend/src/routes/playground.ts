import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { PipelineService } from '../services/pipeline.service';

const router = Router();
const pipelineService = new PipelineService();

const analyzeSchema = z.object({
  prompt: z.string().min(1)
});

router.post(
  '/analyze',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const data = analyzeSchema.parse(req.body);
      const result = await pipelineService.processPrompt(
        data.prompt,
        req.orgId!,
        req.userId,
        {
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      );

      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Analyze error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;

