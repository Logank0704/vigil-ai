'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Badge from '@/components/Badge';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function PoliciesPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    severity: 'MEDIUM',
    active: true,
    description: '',
    rules: JSON.stringify({ type: '', keywords: [], regex: [] }, null, 2),
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const data = await api.getPolicies();
      setPolicies(data.policies || []);
    } catch (error) {
      console.error('Failed to load policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const rules = JSON.parse(formData.rules);
      await api.createPolicy({
        name: formData.name,
        severity: formData.severity,
        active: formData.active,
        description: formData.description,
        rules,
      });
      setShowCreateModal(false);
      resetForm();
      loadPolicies();
    } catch (error: any) {
      alert(error.message || 'Failed to create policy');
    }
  };

  const handleUpdate = async () => {
    try {
      const rules = JSON.parse(formData.rules);
      await api.updatePolicy(editingPolicy.id, {
        name: formData.name,
        severity: formData.severity,
        active: formData.active,
        description: formData.description,
        rules,
      });
      setEditingPolicy(null);
      resetForm();
      loadPolicies();
    } catch (error: any) {
      alert(error.message || 'Failed to update policy');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;
    try {
      await api.deletePolicy(id);
      loadPolicies();
    } catch (error: any) {
      alert(error.message || 'Failed to delete policy');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      severity: 'MEDIUM',
      active: true,
      description: '',
      rules: JSON.stringify({ type: '', keywords: [], regex: [] }, null, 2),
    });
  };

  const canEdit = user?.role === 'ADMIN' || user?.role === 'ANALYST';

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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-vigil-text-primary mb-2">Policy Manager</h1>
              <p className="text-sm text-vigil-text-muted">Create and manage security policies</p>
            </div>
            {canEdit && (
              <button
                onClick={() => {
                  setEditingPolicy(null);
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-vigil-accent hover:bg-vigil-accent-dark text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Policy</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="glass rounded-xl p-6 border border-vigil-border hover:border-vigil-accent/30 transition-colors card-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-5 h-5 text-vigil-accent" />
                      <h3 className="text-lg font-semibold text-vigil-text-primary">{policy.name}</h3>
                      <Badge
                        variant={policy.severity.toLowerCase() as 'low' | 'medium' | 'high' | 'critical'}
                      >
                        {policy.severity}
                      </Badge>
                      <Badge variant={policy.active ? 'success' : 'warning'}>
                        {policy.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {policy.description && (
                      <p className="text-sm text-vigil-text-secondary mb-4">{policy.description}</p>
                    )}
                    <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-vigil-text-secondary font-mono overflow-x-auto border border-vigil-border">
                      <pre>{JSON.stringify(policy.rules, null, 2)}</pre>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingPolicy(policy);
                          setFormData({
                            name: policy.name,
                            severity: policy.severity,
                            active: policy.active,
                            description: policy.description || '',
                            rules: JSON.stringify(policy.rules, null, 2),
                          });
                          setShowCreateModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 text-vigil-text-secondary hover:text-vigil-text-primary text-sm rounded transition-colors border border-vigil-border"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      {user?.role === 'ADMIN' && (
                        <button
                          onClick={() => handleDelete(policy.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-vigil-error/10 hover:bg-vigil-error/20 text-vigil-error text-sm rounded transition-colors border border-vigil-error/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Create/Edit Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="glass rounded-xl p-6 border border-vigil-border w-full max-w-2xl max-h-[90vh] overflow-y-auto card-shadow">
                <h2 className="text-xl font-bold text-vigil-text-primary mb-4">
                  {editingPolicy ? 'Edit Policy' : 'Create Policy'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-vigil-text-secondary mb-1.5">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-800/50 border border-vigil-border rounded-lg px-4 py-2.5 text-vigil-text-primary focus:outline-none focus:ring-2 focus:ring-vigil-accent/50 focus:border-vigil-accent/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-vigil-text-secondary mb-1.5">Severity</label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      className="w-full bg-slate-800/50 border border-vigil-border rounded-lg px-4 py-2.5 text-vigil-text-primary focus:outline-none focus:ring-2 focus:ring-vigil-accent/50 focus:border-vigil-accent/50 transition-all"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-vigil-text-secondary mb-1.5">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-800/50 border border-vigil-border rounded-lg px-4 py-2.5 text-vigil-text-primary focus:outline-none focus:ring-2 focus:ring-vigil-accent/50 focus:border-vigil-accent/50 h-24 resize-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-vigil-text-secondary mb-1.5">Rules (JSON)</label>
                    <textarea
                      value={formData.rules}
                      onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                      className="w-full bg-slate-800/50 border border-vigil-border rounded-lg px-4 py-2.5 text-vigil-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-vigil-accent/50 focus:border-vigil-accent/50 h-48 resize-none transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="active" className="text-sm text-vigil-text-secondary">
                      Active
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingPolicy(null);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-vigil-text-secondary hover:text-vigil-text-primary font-medium rounded-lg transition-colors border border-vigil-border"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingPolicy ? handleUpdate : handleCreate}
                    className="flex-1 px-4 py-2 bg-vigil-accent hover:bg-vigil-accent-dark text-white font-medium rounded-lg transition-colors"
                  >
                    {editingPolicy ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
