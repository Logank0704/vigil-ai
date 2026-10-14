'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Badge from '@/components/Badge';
import { FileText, Eye, X, Filter } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function LogsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [filters, setFilters] = useState({
    severity: '',
    eventType: '',
    agentName: '',
    status: '',
    limit: 50,
    offset: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    try {
      const data = await api.getLogs(filters);
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (logId: string) => {
    try {
      const data = await api.getLogDetail(logId);
      setSelectedLog(data);
    } catch (error) {
      console.error('Failed to load log detail:', error);
    }
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
            <h1 className="text-2xl font-bold text-vigil-text-primary mb-2">Audit Logs</h1>
            <p className="text-sm text-vigil-text-muted">Comprehensive security event log and compliance records</p>
          </div>

          {/* Filters */}
          <div className="glass rounded-xl p-4 border border-vigil-border mb-6 card-shadow">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-vigil-text-muted" />
              <span className="text-sm font-medium text-vigil-text-secondary">Filters</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-vigil-text-muted mb-1.5">Severity</label>
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                  className="w-full bg-slate-800/50 border border-vigil-border rounded-lg px-3 py-2 text-sm text-vigil-text-primary focus:outline-none focus:ring-2 focus:ring-vigil-accent/50 focus:border-vigil-accent/50 transition-all"
                >
                  <option value="">All</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-vigil-text-muted mb-1.5">Event Type</label>
                <input
                  type="text"
                  value={filters.eventType}
                  onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
                  placeholder="Filter by type..."
                  className="w-full bg-slate-800/50 border border-vigil-border rounded-lg px-3 py-2 text-sm text-vigil-text-primary placeholder-vigil-text-muted focus:outline-none focus:ring-2 focus:ring-vigil-accent/50 focus:border-vigil-accent/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-vigil-text-muted mb-1.5">Agent</label>
                <input
                  type="text"
                  value={filters.agentName}
                  onChange={(e) => setFilters({ ...filters, agentName: e.target.value })}
                  placeholder="Filter by agent..."
                  className="w-full bg-slate-800/50 border border-vigil-border rounded-lg px-3 py-2 text-sm text-vigil-text-primary placeholder-vigil-text-muted focus:outline-none focus:ring-2 focus:ring-vigil-accent/50 focus:border-vigil-accent/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-vigil-text-muted mb-1.5">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full bg-slate-800/50 border border-vigil-border rounded-lg px-3 py-2 text-sm text-vigil-text-primary focus:outline-none focus:ring-2 focus:ring-vigil-accent/50 focus:border-vigil-accent/50 transition-all"
                >
                  <option value="">All</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                  <option value="blocked">Blocked</option>
                  <option value="allowed">Allowed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="glass rounded-xl border border-vigil-border overflow-hidden card-shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-vigil-border bg-slate-800/30">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-vigil-text-muted uppercase tracking-wider">Timestamp</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-vigil-text-muted uppercase tracking-wider">Severity</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-vigil-text-muted uppercase tracking-wider">Event Type</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-vigil-text-muted uppercase tracking-wider">Agent</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-vigil-text-muted uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-vigil-text-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-vigil-border/50 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-vigil-text-secondary">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={log.severity.toLowerCase() as 'low' | 'medium' | 'high' | 'critical'}
                        >
                          {log.severity}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-vigil-text-secondary">{log.eventType}</td>
                      <td className="py-3 px-4 text-sm text-vigil-text-secondary">{log.agentName || '-'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={log.status === 'success' ? 'success' : log.status === 'error' ? 'error' : 'warning'}>
                          {log.status || '-'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleViewDetail(log.id)}
                          className="flex items-center gap-1.5 text-vigil-accent hover:text-vigil-accent-dark text-sm font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {logs.length === 0 && (
            <div className="text-center py-12 text-vigil-text-muted">
              <FileText className="w-12 h-12 mx-auto mb-3 text-vigil-text-muted/50" />
              <p>No logs found</p>
            </div>
          )}

          {/* Log Detail Modal */}
          {selectedLog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="glass rounded-xl p-6 border border-vigil-border w-full max-w-4xl max-h-[90vh] overflow-y-auto card-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-vigil-text-primary">Log Details</h2>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-vigil-text-secondary hover:text-vigil-text-primary text-sm rounded transition-colors border border-vigil-border"
                  >
                    <X className="w-4 h-4" />
                    <span>Close</span>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-vigil-text-muted mb-1">Timestamp</div>
                    <div className="text-sm text-vigil-text-primary">
                      {new Date(selectedLog.log.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-vigil-text-muted mb-1">Severity</div>
                    <Badge
                      variant={selectedLog.log.severity.toLowerCase() as 'low' | 'medium' | 'high' | 'critical'}
                    >
                      {selectedLog.log.severity}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-vigil-text-muted mb-1">Event Type</div>
                    <div className="text-sm text-vigil-text-primary">{selectedLog.log.eventType}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-vigil-text-muted mb-1">Agent</div>
                    <div className="text-sm text-vigil-text-primary">{selectedLog.log.agentName || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-vigil-text-muted mb-1">Status</div>
                    <div className="text-sm text-vigil-text-primary">{selectedLog.log.status || '-'}</div>
                  </div>
                  {selectedLog.log.metadata && (
                    <div>
                      <div className="text-sm font-medium text-vigil-text-muted mb-1">Metadata</div>
                      <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-vigil-text-secondary font-mono overflow-x-auto border border-vigil-border">
                        <pre>{JSON.stringify(selectedLog.log.metadata, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                  {selectedLog.promptEvent && (
                    <div>
                      <div className="text-sm font-medium text-vigil-text-muted mb-1">Prompt Event</div>
                      <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-vigil-text-secondary border border-vigil-border">
                        <div className="mb-2">
                          <strong>Original:</strong> {selectedLog.promptEvent.originalText}
                        </div>
                        {selectedLog.promptEvent.rewrittenText && (
                          <div className="mb-2">
                            <strong>Rewritten:</strong> {selectedLog.promptEvent.rewrittenText}
                          </div>
                        )}
                        <div className="mb-2">
                          <strong>Risk Score:</strong> {selectedLog.promptEvent.riskScore}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
