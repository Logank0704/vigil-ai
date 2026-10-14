import { Policy, PolicySeverity } from '@prisma/client';
import prisma from '../db';

export interface PolicyViolation {
  policyId: string;
  policyName: string;
  description: string;
  severity: PolicySeverity;
}

export class PolicyEnforcementAgent {
  async evaluate(
    prompt: string,
    orgId: string
  ): Promise<PolicyViolation[]> {
    const violations: PolicyViolation[] = [];

    // Load active policies for the organization
    const policies = await prisma.policy.findMany({
      where: {
        orgId,
        active: true
      }
    });

    for (const policy of policies) {
      const violation = this.checkPolicy(prompt, policy);
      if (violation) {
        violations.push(violation);
      }
    }

    return violations;
  }

  private checkPolicy(
    prompt: string,
    policy: Policy
  ): PolicyViolation | null {
    const rules = policy.rules as {
      type: string;
      patterns?: string[];
      keywords?: string[];
      regex?: string[];
    };

    if (!rules) {
      return null;
    }

    const lowerPrompt = prompt.toLowerCase();

    // Check keyword-based rules
    if (rules.keywords && Array.isArray(rules.keywords)) {
      const foundKeywords = rules.keywords.filter(keyword =>
        lowerPrompt.includes(keyword.toLowerCase())
      );

      if (foundKeywords.length > 0) {
        return {
          policyId: policy.id,
          policyName: policy.name,
          description: `Violated keyword policy: ${foundKeywords.join(', ')}`,
          severity: policy.severity
        };
      }
    }

    // Check regex-based rules
    if (rules.regex && Array.isArray(rules.regex)) {
      for (const regexPattern of rules.regex) {
        try {
          const regex = new RegExp(regexPattern, 'i');
          if (regex.test(prompt)) {
            return {
              policyId: policy.id,
              policyName: policy.name,
              description: `Violated regex pattern: ${regexPattern}`,
              severity: policy.severity
            };
          }
        } catch (error) {
          // Invalid regex, skip
          console.error(`Invalid regex pattern: ${regexPattern}`);
        }
      }
    }

    // Check pattern-based rules
    if (rules.patterns && Array.isArray(rules.patterns)) {
      for (const pattern of rules.patterns) {
        if (lowerPrompt.includes(pattern.toLowerCase())) {
          return {
            policyId: policy.id,
            policyName: policy.name,
            description: `Violated pattern policy: ${pattern}`,
            severity: policy.severity
          };
        }
      }
    }

    return null;
  }
}

