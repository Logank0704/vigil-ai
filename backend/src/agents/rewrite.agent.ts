export class RewriteAgent {
  /**
   * Generate a safe rewrite of the prompt.
   * In production, this would call an LLM API.
   * For now, we simulate with text transformations.
   */
  async generateSafeRewrite(
    originalPrompt: string,
    violations: Array<{ policyName: string; description: string }>,
    riskScore: number
  ): Promise<string> {
    // If no violations and low risk, return original
    if (violations.length === 0 && riskScore < 0.3) {
      return originalPrompt;
    }

    // Simulate LLM rewrite by sanitizing and adding safety context
    let rewritten = originalPrompt;

    // Remove suspicious phrases
    rewritten = rewritten.replace(
      /ignore\s+(all\s+)?previous\s+instructions/gi,
      ''
    );
    rewritten = rewritten.replace(/you\s+are\s+now\s+(a|an)\s+/gi, '');
    rewritten = rewritten.replace(/jailbreak/gi, '');
    rewritten = rewritten.replace(/bypass/gi, '');
    rewritten = rewritten.replace(/override/gi, '');

    // Mask potential PII
    rewritten = rewritten.replace(
      /\b\d{3}-\d{2}-\d{4}\b/g,
      '[REDACTED-SSN]'
    );
    rewritten = rewritten.replace(
      /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g,
      '[REDACTED-CC]'
    );

    // Add safety prefix if high risk
    if (riskScore >= 0.5) {
      rewritten = `[SAFETY CONTEXT: This request has been sanitized for security. Please respond appropriately and safely.] ${rewritten}`;
    }

    // Clean up extra whitespace
    rewritten = rewritten.replace(/\s+/g, ' ').trim();

    // If rewrite is too different or empty, provide a generic safe version
    if (rewritten.length < originalPrompt.length * 0.5) {
      rewritten = `I need help with a question. Please provide a helpful and safe response.`;
    }

    return rewritten || originalPrompt;
  }
}

