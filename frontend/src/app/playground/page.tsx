'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Badge from '@/components/Badge';
import { CheckCircle2, Loader2, XCircle, Pause, AlertTriangle, FileText, Shield, RefreshCw, Save } from 'lucide-react';

export const dynamic = 'force-dynamic';

type PipelineStep = 'pending' | 'running' | 'done' | 'error';

export default function PlaygroundPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [pipelineSteps, setPipelineSteps] = useState<Record<string, PipelineStep>>({
    detect: 'pending',
    policy: 'pending',
    rewrite: 'pending',
    log: 'pending',
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!mounted || !isAuthenticated()) {
    return null;
  }

  const handleAnalyze = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setResult(null);
    setPipelineSteps({
      detect: 'running',
      policy: 'pending',
      rewrite: 'pending',
      log: 'pending',
    });

    try {
      setTimeout(() => {
        setPipelineSteps((prev) => ({ ...prev, detect: 'done', policy: 'running' }));
      }, 500);

      setTimeout(() => {
        setPipelineSteps((prev) => ({ ...prev, policy: 'done', rewrite: 'running' }));
      }, 1000);

      setTimeout(() => {
        setPipelineSteps((prev) => ({ ...prev, rewrite: 'done', log: 'running' }));
      }, 1500);

      const analysisResult = await api.analyzePrompt(prompt);

      setTimeout(() => {
        setPipelineSteps((prev) => ({ ...prev, log: 'done' }));
        setResult(analysisResult);
      }, 2000);
    } catch (error: any) {
      console.error('Analysis failed:', error);
      setPipelineSteps({
        detect: 'error',
        policy: 'error',
        rewrite: 'error',
        log: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (step: PipelineStep) => {
    switch (step) {
      case 'done':
        return <CheckCircle2 className="w-5 h-5 text-vigil-success" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-vigil-accent animate-spin" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-vigil-error" />;
      default:
        return <Pause className="w-5 h-5 text-vigil-text-muted" />;
    }
  };

  const getStepColor = (step: PipelineStep) => {
    switch (step) {
      case 'done':
        return 'bg-vigil-success/10 border-vigil-success/30';
      case 'running':
        return 'bg-vigil-accent/10 border-vigil-accent/30';
      case 'error':
        return 'bg-vigil-error/10 border-vigil-error/30';
      default:
        return 'bg-slate-800/30 border-vigil-border';
    }
  };

  return (
    <div className="min-h-screen bg-vigil-dark">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-vigil-text-primary mb-2">Playground</h1>
            <p className="text-sm text-vigil-text-muted">Test and analyze prompts through the security pipeline</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="glass rounded-xl p-6 border border-vigil-border card-shadow">
                <h2 className="text-lg font-semibold text-vigil-text-primary mb-4">Test Prompt</h2>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter a prompt to analyze..."
                  className="w-full h-48 bg-slate-800/50 border border-vigil-border rounded-lg px-4 py-3 text-vigil-text-primary placeholder-vigil-text-muted focus:outline-none focus:ring-2 focus:ring-vigil-accent/50 focus:border-vigil-accent/50 resize-none"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !prompt.trim()}
                  className="mt-4 w-full bg-vigil-accent hover:bg-vigil-accent-dark text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Analyze</span>
                    </>
                  )}
                </button>
              </div>

              {/* Pipeline Visualization */}
              <div className="glass rounded-xl p-6 border border-vigil-border card-shadow">
                <h2 className="text-lg font-semibold text-vigil-text-primary mb-4">Pipeline Status</h2>
                <div className="space-y-3">
                  {[
                    { key: 'detect', label: '1. Risk Detection' },
                    { key: 'policy', label: '2. Policy Enforcement' },
                    { key: 'rewrite', label: '3. Rewrite Generation' },
                    { key: 'log', label: '4. Audit Logging' },
                  ].map((step) => {
                    const status = pipelineSteps[step.key];
                    return (
                      <div
                        key={step.key}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${getStepColor(status)} transition-all`}
                      >
                        {getStepIcon(status)}
                        <span className="text-sm text-vigil-text-secondary">{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {result && (
                <>
                  <div className="glass rounded-xl p-6 border border-vigil-border card-shadow">
                    <h2 className="text-lg font-semibold text-vigil-text-primary mb-4">Analysis Results</h2>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-vigil-text-muted mb-2">Risk Score</div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-800/50 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full bg-vigil-accent transition-all"
                              style={{ width: `${result.riskScore * 100}%` }}
                            />
                          </div>
                          <span className="text-lg font-bold text-vigil-text-primary">
                            {Math.round(result.riskScore * 100)}%
                          </span>
                        </div>
                        <div className="mt-2">
                          <Badge
                            variant={result.severity.toLowerCase() as 'low' | 'medium' | 'high' | 'critical'}
                          >
                            {result.severity}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-vigil-text-muted mb-2">Findings</div>
                        <div className="space-y-2">
                          {result.findings?.map((finding: string, idx: number) => (
                            <div
                              key={idx}
                              className="bg-slate-800/50 rounded-lg p-3 text-sm text-vigil-text-secondary flex items-start gap-2"
                            >
                              <AlertTriangle className="w-4 h-4 text-vigil-warning mt-0.5 flex-shrink-0" />
                              <span>{finding}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {result.violations && result.violations.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-vigil-text-muted mb-2">
                            Policy Violations ({result.violations.length})
                          </div>
                          <div className="space-y-2">
                            {result.violations.map((violation: any, idx: number) => (
                              <div
                                key={idx}
                                className="bg-vigil-error/10 border border-vigil-error/30 rounded-lg p-3"
                              >
                                <div className="text-sm font-medium text-vigil-error mb-1">
                                  {violation.policyName}
                                </div>
                                <div className="text-xs text-vigil-text-secondary">{violation.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="glass rounded-xl p-6 border border-vigil-border card-shadow">
                    <h2 className="text-lg font-semibold text-vigil-text-primary mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Original Prompt
                    </h2>
                    <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-vigil-text-secondary whitespace-pre-wrap font-mono">
                      {result.originalText}
                    </div>
                  </div>

                  {result.rewrittenText && result.rewrittenText !== result.originalText && (
                    <div className="glass rounded-xl p-6 border border-vigil-border card-shadow">
                      <h2 className="text-lg font-semibold text-vigil-text-primary mb-4 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-vigil-success" />
                        Safe Rewrite
                      </h2>
                      <div className="bg-vigil-success/10 border border-vigil-success/30 rounded-lg p-4 text-sm text-vigil-text-secondary whitespace-pre-wrap font-mono">
                        {result.rewrittenText}
                      </div>
                    </div>
                  )}
                </>
              )}

              {!result && !loading && (
                <div className="glass rounded-xl p-6 border border-vigil-border card-shadow text-center text-vigil-text-muted py-12">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-vigil-text-muted/50" />
                  <p>Enter a prompt and click Analyze to see results</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
