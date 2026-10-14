'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Shield, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await api.login(email, password);
      } else {
        result = await api.register(email, password, name, orgName || undefined);
      }

      setAuth(result.user, result.token);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-vigil-dark flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 w-full max-w-md border border-vigil-border card-shadow">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-vigil-accent rounded-lg flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-vigil-text-primary tracking-tight">VIGIL AI</h1>
              <p className="text-sm text-vigil-text-muted font-medium tracking-wider uppercase">Enterprise Defense</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
              isLogin
                ? 'bg-vigil-accent text-white'
                : 'bg-slate-800/50 text-vigil-text-secondary hover:bg-slate-800 border border-vigil-border'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
              !isLogin
                ? 'bg-vigil-accent text-white'
                : 'bg-slate-800/50 text-vigil-text-secondary hover:bg-slate-800 border border-vigil-border'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-vigil-text-secondary mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="w-full bg-slate-800/50 border border-vigil-border rounded-lg px-4 py-2.5 text-vigil-text-primary focus:outline-none focus:ring-2 focus:ring-vigil-accent/50 focus:border-vigil-accent/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-vigil-text-secondary mb-1.5">
                  Organization (optional)
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full bg-slate-800/50 border border-vigil-border rounded-lg px-4 py-2.5 text-vigil-text-primary focus:outline-none focus:ring-2 focus:ring-vigil-accent/50 focus:border-vigil-accent/50 transition-all"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-vigil-text-secondary mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-800/50 border border-vigil-border rounded-lg px-4 py-2.5 text-vigil-text-primary focus:outline-none focus:ring-2 focus:ring-vigil-accent/50 focus:border-vigil-accent/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-vigil-text-secondary mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-800/50 border border-vigil-border rounded-lg px-4 py-2.5 text-vigil-text-primary focus:outline-none focus:ring-2 focus:ring-vigil-accent/50 focus:border-vigil-accent/50 transition-all"
            />
          </div>

          {error && (
            <div className="bg-vigil-error/10 border border-vigil-error/30 rounded-lg p-3 text-sm text-vigil-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-vigil-accent hover:bg-vigil-accent-dark text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <span>{isLogin ? 'Login' : 'Register'}</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-vigil-text-muted">
          <p>Demo credentials:</p>
          <p className="mt-1 font-mono">admin@cyberdyne.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
