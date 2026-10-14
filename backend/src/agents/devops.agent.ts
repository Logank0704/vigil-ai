import prisma from '../db';
import { AgentStatus, AgentType } from '@prisma/client';

export interface SystemMetrics {
  totalPrompts: number;
  blockedPrompts: number;
  averageRiskScore: number;
  averageLatency: number;
  errorRate: number;
  activePolicies: number;
  agentStatuses: Record<string, AgentStatus>;
}

export class DevOpsAgent {
  async collectMetrics(orgId?: string): Promise<SystemMetrics> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Get prompt statistics
    const whereClause = orgId ? { orgId } : {};
    const recentPrompts = await prisma.promptEvent.findMany({
      where: {
        ...whereClause,
        createdAt: { gte: oneHourAgo }
      }
    });

    const totalPrompts = recentPrompts.length;
    const blockedPrompts = recentPrompts.filter(
      p => p.severity === 'HIGH' || p.severity === 'CRITICAL'
    ).length;

    const averageRiskScore =
      recentPrompts.length > 0
        ? recentPrompts.reduce((sum, p) => sum + p.riskScore, 0) /
          recentPrompts.length
        : 0;

    // Get policy count
    const activePolicies = await prisma.policy.count({
      where: {
        ...(orgId ? { orgId } : {}),
        active: true
      }
    });

    // Get agent statuses
    const agents = await prisma.agent.findMany();
    const agentStatuses: Record<string, AgentStatus> = {};
    for (const agent of agents) {
      agentStatuses[agent.name] = agent.status;
    }

    // Simulate latency and error rate (in production, track these)
    const averageLatency = 45 + Math.random() * 20; // 45-65ms
    const errorRate = Math.random() * 0.02; // 0-2%

    return {
      totalPrompts,
      blockedPrompts,
      averageRiskScore,
      averageLatency,
      errorRate,
      activePolicies,
      agentStatuses
    };
  }

  async updateAgentHeartbeat(
    agentName: string,
    agentType: AgentType,
    status: AgentStatus,
    metrics?: Record<string, any>
  ): Promise<void> {
    await prisma.agent.upsert({
      where: { name: agentName },
      update: {
        status,
        lastHeartbeat: new Date(),
        metrics: metrics || {},
        updatedAt: new Date()
      },
      create: {
        name: agentName,
        type: agentType,
        status,
        lastHeartbeat: new Date(),
        metrics: metrics || {},
        version: '1.0.0'
      }
    });
  }

  async logSystemEvent(
    orgId: string | null,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    eventType: string,
    agentName: string,
    status: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        orgId,
        severity,
        eventType,
        agentName,
        status,
        metadata: metadata || {}
      }
    });
  }
}

