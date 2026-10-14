const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge existing headers if they're a plain object
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name: string, orgName?: string) {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, orgName }),
    });
  }

  async getMe() {
    return this.request<{ user: any }>('/auth/me');
  }

  // Playground
  async analyzePrompt(prompt: string) {
    return this.request<any>('/playground/analyze', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  // Dashboard
  async getMetrics() {
    return this.request<any>('/dashboard/metrics');
  }

  async getEvents(limit?: number, offset?: number, severity?: string) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    if (severity) params.append('severity', severity);
    return this.request<any>(`/dashboard/events?${params.toString()}`);
  }

  // Policies
  async getPolicies() {
    return this.request<{ policies: any[] }>('/policies');
  }

  async getPolicy(id: string) {
    return this.request<{ policy: any }>(`/policies/${id}`);
  }

  async createPolicy(data: any) {
    return this.request<{ policy: any }>('/policies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePolicy(id: string, data: any) {
    return this.request<{ policy: any }>(`/policies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePolicy(id: string) {
    return this.request<{ success: boolean }>(`/policies/${id}`, {
      method: 'DELETE',
    });
  }

  // Agents
  async getAgents() {
    return this.request<{ agents: any[] }>('/agents');
  }

  async getAgentLogs(agentId: string) {
    return this.request<{ logs: any[] }>(`/agents/${agentId}/logs`);
  }

  // Logs
  async getLogs(params?: {
    limit?: number;
    offset?: number;
    severity?: string;
    eventType?: string;
    agentName?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request<{ logs: any[]; total: number }>(`/logs?${queryParams.toString()}`);
  }

  async getLogDetail(id: string) {
    return this.request<any>(`/logs/${id}`);
  }
}

export const api = new ApiClient();

