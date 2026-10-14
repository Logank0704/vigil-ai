'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MetricCard from '@/components/MetricCard';
import Badge from '@/components/Badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, Ban, FileText, Zap, Globe2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [metrics, setMetrics] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1H');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadData = async () => {
    try {
      const [metricsData, eventsData] = await Promise.all([
        api.getMetrics(),
        api.getEvents(10),
      ]);
      setMetrics(metricsData);
      setEvents(eventsData.events || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isAuthenticated()) {
    return null;
  }

  if (loading || !metrics) {
    return (
      <div className="min-h-screen bg-vigil-dark flex items-center justify-center">
        <div className="text-vigil-text-primary">Loading...</div>
      </div>
    );
  }

  const chartData = metrics.chartData || [];

  return (
    <div className="min-h-screen bg-vigil-dark">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-vigil-text-primary mb-2">Dashboard</h1>
            <p className="text-sm text-vigil-text-muted">Real-time security monitoring and threat analysis</p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <MetricCard
              title="Risk Score"
              value={`${metrics.riskScore || 0}%`}
              icon={Shield}
              color="accent"
            />
            <MetricCard
              title="Threats Blocked"
              value={metrics.threatsBlocked || 0}
              icon={Ban}
              color="error"
            />
            <MetricCard
              title="Active Policies"
              value={metrics.activePolicies || 0}
              icon={FileText}
              color="accent"
            />
            <MetricCard
              title="System Latency"
              value={`${metrics.systemLatency || 0}ms`}
              icon={Zap}
              color="success"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Threat Volume Chart */}
            <div className="glass rounded-xl p-6 border border-vigil-border card-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-vigil-text-primary mb-1">Real-time Threat Volume</h2>
                  <p className="text-sm text-vigil-text-muted">Threat activity over time</p>
                </div>
                <div className="flex gap-2">
                  {['1H', '24H', '7D'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        timeRange === range
                          ? 'bg-vigil-accent text-white'
                          : 'bg-slate-800/50 text-vigil-text-secondary hover:bg-slate-800 hover:text-vigil-text-primary border border-vigil-border'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis 
                    dataKey="time" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    stroke="#475569"
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    stroke="#475569"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                    }}
                  />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Origin Map */}
            <div className="glass rounded-xl p-6 border border-vigil-border card-shadow">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-vigil-text-primary mb-1">Origin Map</h2>
                <p className="text-sm text-vigil-text-muted">Geographic distribution of requests</p>
              </div>
              <div className="relative h-[300px] bg-slate-900/30 rounded-lg border border-vigil-border flex items-center justify-center">
                <div className="text-center">
                  <Globe2 className="w-16 h-16 text-vigil-accent mx-auto mb-4" />
                  <div className="space-y-3">
                    <Badge variant="high" size="md">US-EAST-1 — HIGH TRAFFIC</Badge>
                    <div className="text-sm text-vigil-text-muted mt-4 space-y-1">
                      <div>Active Regions: 3</div>
                      <div>Total Requests: {metrics.metrics?.totalPrompts || 0}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Events Table */}
          <div className="glass rounded-xl p-6 border border-vigil-border card-shadow">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-vigil-text-primary mb-1">Recent Security Events</h2>
              <p className="text-sm text-vigil-text-muted">Latest security events and policy violations</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-vigil-border">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-vigil-text-muted uppercase tracking-wider">Timestamp</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-vigil-text-muted uppercase tracking-wider">Severity</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-vigil-text-muted uppercase tracking-wider">Event</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-vigil-text-muted uppercase tracking-wider">Agent</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-vigil-text-muted uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b border-vigil-border/50 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-vigil-text-secondary">
                        {new Date(event.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            event.severity.toLowerCase() as 'low' | 'medium' | 'high' | 'critical'
                          }
                        >
                          {event.severity}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-vigil-text-secondary">{event.event}</td>
                      <td className="py-3 px-4 text-sm text-vigil-text-secondary">{event.agent}</td>
                      <td className="py-3 px-4">
                        <Badge variant={event.status === 'blocked' ? 'error' : 'success'}>
                          {event.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
