import { EventSeverity } from '@prisma/client';

export interface RiskAnalysis {
  riskScore: number; // 0-1
  severity: EventSeverity;
  findings: string[];
}

export class RiskDetectionAgent {
  private readonly suspiciousKeywords = [
    'hack', 'exploit', 'vulnerability', 'sql injection', 'xss',
    'password', 'credential', 'token', 'api key',
    'ignore previous instructions', 'forget', 'disregard',
    'jailbreak', 'bypass', 'override', 'system prompt',
    'admin', 'root', 'sudo', 'privilege escalation'
  ];

  private readonly highRiskPatterns = [
    /sql\s+injection/i,
    /xss\s+attack/i,
    /command\s+injection/i,
    /remote\s+code\s+execution/i,
    /privilege\s+escalation/i,
    /ignore\s+(all\s+)?previous\s+instructions/i,
    /you\s+are\s+now\s+(a|an)\s+/i
  ];

  analyze(prompt: string): RiskAnalysis {
    const findings: string[] = [];
    let riskScore = 0;

    // Check for suspicious keywords
    const lowerPrompt = prompt.toLowerCase();
    const foundKeywords = this.suspiciousKeywords.filter(keyword =>
      lowerPrompt.includes(keyword.toLowerCase())
    );

    if (foundKeywords.length > 0) {
      riskScore += foundKeywords.length * 0.1;
      findings.push(`Suspicious keywords detected: ${foundKeywords.join(', ')}`);
    }

    // Check for high-risk patterns
    const foundPatterns = this.highRiskPatterns.filter(pattern =>
      pattern.test(prompt)
    );

    if (foundPatterns.length > 0) {
      riskScore += foundPatterns.length * 0.3;
      findings.push('High-risk attack patterns detected');
    }

    // Check for PII-like patterns
    const piiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/, // Credit card
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ // Email
    ];

    const piiFound = piiPatterns.some(pattern => pattern.test(prompt));
    if (piiFound) {
      riskScore += 0.2;
      findings.push('Possible PII detected');
    }

    // Check for jailbreak attempts
    if (this.detectJailbreak(prompt)) {
      riskScore += 0.4;
      findings.push('Possible jailbreak attempt detected');
    }

    // Normalize risk score to 0-1
    riskScore = Math.min(1, riskScore);

    // Determine severity
    let severity: EventSeverity;
    if (riskScore >= 0.7) {
      severity = 'CRITICAL';
    } else if (riskScore >= 0.5) {
      severity = 'HIGH';
    } else if (riskScore >= 0.3) {
      severity = 'MEDIUM';
    } else {
      severity = 'LOW';
    }

    return {
      riskScore,
      severity,
      findings: findings.length > 0 ? findings : ['No significant risks detected']
    };
  }

  private detectJailbreak(prompt: string): boolean {
    const jailbreakPatterns = [
      /ignore\s+(all\s+)?previous\s+instructions/i,
      /you\s+are\s+now\s+(a|an)\s+/i,
      /pretend\s+you\s+are/i,
      /act\s+as\s+if/i,
      /forget\s+(your|all)/i,
      /system\s+override/i,
      /developer\s+mode/i,
      /jailbreak/i
    ];

    return jailbreakPatterns.some(pattern => pattern.test(prompt));
  }
}

