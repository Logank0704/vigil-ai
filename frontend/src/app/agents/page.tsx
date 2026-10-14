'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Badge from '@/components/Badge';
import { Bot, Activity, Clock, Eye, X } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AgentsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadAgents();
    const interval = setInterval(loadAgents, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadAgents = async () => {
    try {
      const data = await api.getAgents();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
        return 'success';
      case 'DEGRADED':
        return 'warning';
      case 'OFFLINE':
        return 'error';
      default:
        return 'low';
    }
  };

  const formatUptime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  if (!mounted || !isAuthenticated()) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-vigil-dark flex items-center justify-center">
        <div className="text-vigil-text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vigil-dark">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-vigil-text-primary mb-2">Agents Panel</h1>
            <p className="text-sm text-vigil-text-muted">Monitor agent status and performance metrics</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="glass rounded-xl p-6 border border-vigil-border hover:border-vigil-accent/30 transition-colors card-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Bot className="w-5 h-5 text-vigil-accent" />
                      <h3 className="text-lg font-semibold text-vigil-text-primary">{agent.name}</h3>
                      <Badge variant={getStatusVariant(agent.status) as any}>
                        {agent.status}
                      </Badge>
                      <span className="text-sm text-vigil-text-muted">v{agent.version}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <div className="text-xs text-vigil-text-muted mb-1.5 flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          <span>Load</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-800/50 rounded-full h-2 overflow-hidden border border-vigil-border">
                            <div
                              className="h-full bg-vigil-accent transition-all"
                              style={{ width: `${agent.load}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-vigil-text-primary">{agent.load}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-vigil-text-muted mb-1.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Uptime</span>
                        </div>
                        <div className="text-sm font-medium text-vigil-text-primary">
                          {formatUptime(agent.uptime || 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-vigil-text-muted mb-1.5">Last Heartbeat</div>
                        <div className="text-sm font-medium text-vigil-text-primary">
                          {agent.lastHeartbeat
                            ? new Date(agent.lastHeartbeat).toLocaleTimeString()
                            : 'Never'}
                        </div>
                      </div>
                    </div>
                    {agent.metrics && Object.keys(agent.metrics).length > 0 && (
                      <div className="mt-4 bg-slate-800/50 rounded-lg p-3 border border-vigil-border">
                        <div className="text-xs text-vigil-text-muted mb-2">Metrics</div>
                        <div className="text-xs text-vigil-text-secondary font-mono">
                          <pre>{JSON.stringify(agent.metrics, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedAgent(agent)}
                    className="ml-4 flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-vigil-text-secondary hover:text-vigil-text-primary text-sm rounded transition-colors border border-vigil-border"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Logs</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Agent Logs Modal */}
          {selectedAgent && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="glass rounded-xl p-6 border border-vigil-border w-full max-w-4xl max-h-[90vh] overflow-y-auto card-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-vigil-text-primary">
                    {selectedAgent.name} - Logs
                  </h2>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-vigil-text-secondary hover:text-vigil-text-primary text-sm rounded transition-colors border border-vigil-border"
                  >
                    <X className="w-4 h-4" />
                    <span>Close</span>
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-vigil-text-muted text-center py-8">
                    Logs would be displayed here. In production, this would fetch from the API.
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
