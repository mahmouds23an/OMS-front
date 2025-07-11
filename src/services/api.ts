/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL = import.meta.env.VITE_API_URL;

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Orders endpoints
  async getOrders() {
    return this.request('/orders');
  }

  async getOrderById(id: string) {
    return this.request(`/orders/${id}`);
  }

  async createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(id: string, orderData: any) {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(id: string) {
    return this.request(`/orders/${id}`, {
      method: 'DELETE',
    });
  }

  // Clients endpoints
  async getClients() {
    return this.request('/clients');
  }

  async getClientById(id: string) {
    return this.request(`/clients/${id}`);
  }

  async createClient(clientData: any) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(id: string, clientData: any) {
    return this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  }

  async deleteClient(id: string) {
    return this.request(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Users endpoints
  async getUsers() {
    return this.request('/employees');
  }

  async getUserById(id: string) {
    return this.request(`/employees/${id}`);
  }

  async createUser(userData: any) {
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updateUserRole(id: string, role: string) {
    return this.request(`/employees/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics endpoints
  async getAnalytics() {
    return this.request('/analytics');
  }
}

export const apiService = new ApiService();
