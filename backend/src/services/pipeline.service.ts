import prisma from '../db';
import { RiskDetectionAgent } from '../agents/risk-detection.agent';
import { PolicyEnforcementAgent } from '../agents/policy-enforcement.agent';
import { RewriteAgent } from '../agents/rewrite.agent';
import { DevOpsAgent } from '../agents/devops.agent';

export interface PipelineResult {
  promptEventId: string;
  originalText: string;
  rewrittenText: string;
  riskScore: number;
  severity: string;
  findings: string[];
  violations: Array<{
    policyId: string;
    policyName: string;
    description: string;
    severity: string;
  }>;
}

export class PipelineService {
  private riskAgent = new RiskDetectionAgent();
  private policyAgent = new PolicyEnforcementAgent();
  private rewriteAgent = new RewriteAgent();
  private devopsAgent = new DevOpsAgent();

  async processPrompt(
    prompt: string,
    orgId: string,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<PipelineResult> {
    const startTime = Date.now();

    try {
      // Step 1: Risk Detection
      const riskAnalysis = this.riskAgent.analyze(prompt);

      // Step 2: Policy Enforcement
      const violations = await this.policyAgent.evaluate(prompt, orgId);

      // Step 3: Rewrite (if needed)
      const rewrittenText =
        violations.length > 0 || riskAnalysis.riskScore >= 0.3
          ? await this.rewriteAgent.generateSafeRewrite(
              prompt,
              violations,
              riskAnalysis.riskScore
            )
          : null;

      // Step 4: Log the event
      const promptEvent = await prisma.promptEvent.create({
        data: {
          orgId,
          userId: userId || null,
          originalText: prompt,
          rewrittenText,
          riskScore: riskAnalysis.riskScore,
          severity: riskAnalysis.severity,
          findings: riskAnalysis.findings,
          metadata: metadata || {}
        }
      });

      // Step 5: Create policy violation records
      if (violations.length > 0) {
        await prisma.policyViolation.createMany({
          data: violations.map(v => ({
            promptEventId: promptEvent.id,
            policyId: v.policyId,
            description: v.description,
            severity: v.severity
          }))
        });
      }

      // Step 6: Log to audit log
      const latency = Date.now() - startTime;
      await this.devopsAgent.logSystemEvent(
        orgId,
        riskAnalysis.severity,
        'PromptProcessed',
        'PipelineService',
        'success',
        {
          promptEventId: promptEvent.id,
          latency,
          violations: violations.length
        }
      );

      return {
        promptEventId: promptEvent.id,
        originalText: prompt,
        rewrittenText: rewrittenText || prompt,
        riskScore: riskAnalysis.riskScore,
        severity: riskAnalysis.severity,
        findings: riskAnalysis.findings,
        violations: violations.map(v => ({
          policyId: v.policyId,
          policyName: v.policyName,
          description: v.description,
          severity: v.severity
        }))
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      await this.devopsAgent.logSystemEvent(
        orgId,
        'HIGH',
        'PromptProcessed',
        'PipelineService',
        'error',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          latency
        }
      );
      throw error;
    }
  }
}

