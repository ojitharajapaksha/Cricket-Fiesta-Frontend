const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiResponse<T = any> {
  status: string;
  data: T;
  count?: number;
  message?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // Players
  async getPlayers(filters?: Record<string, string>) {
    const query = filters ? `?${new URLSearchParams(filters)}` : '';
    return this.request(`/api/players${query}`);
  }

  async getPlayer(id: string) {
    return this.request(`/api/players/${id}`);
  }

  async createPlayer(data: any) {
    return this.request('/api/players', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePlayer(id: string, data: any) {
    return this.request(`/api/players/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async markAttendance(id: string) {
    return this.request(`/api/players/${id}/attendance`, {
      method: 'POST',
    });
  }

  async markFoodCollected(id: string) {
    return this.request(`/api/players/${id}/food-collect`, {
      method: 'POST',
    });
  }

  async scanQRCode(traineeId: string, scanType: 'attendance' | 'food') {
    return this.request('/api/players/scan', {
      method: 'POST',
      body: JSON.stringify({ traineeId, scanType }),
    });
  }

  // Teams
  async getTeams() {
    return this.request('/api/teams');
  }

  async getTeam(id: string) {
    return this.request(`/api/teams/${id}`);
  }

  async createTeam(data: any) {
    return this.request('/api/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Matches
  async getMatches(filters?: Record<string, string>) {
    const query = filters ? `?${new URLSearchParams(filters)}` : '';
    return this.request(`/api/matches${query}`);
  }

  async getMatch(id: string) {
    return this.request(`/api/matches/${id}`);
  }

  async createMatch(data: any) {
    return this.request('/api/matches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async startMatch(id: string) {
    return this.request(`/api/matches/${id}/start`, {
      method: 'POST',
    });
  }

  async updateMatchScore(id: string, homeScore: string, awayScore: string) {
    return this.request(`/api/matches/${id}/score`, {
      method: 'POST',
      body: JSON.stringify({ homeScore, awayScore }),
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/api/dashboard/stats');
  }

  async getRegistrationByDepartment() {
    return this.request('/api/dashboard/registration-by-department');
  }

  async getFoodPreferences() {
    return this.request('/api/dashboard/food-preferences');
  }

  async getRecentActivity() {
    return this.request('/api/dashboard/recent-activity');
  }

  // Food Management
  async getFoodCounters() {
    return this.request('/api/food');
  }

  async updateQueueStatus(counterName: string, data: any) {
    return this.request(`/api/food/queue/${counterName}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Live Updates
  async getLiveUpdates() {
    return this.request('/api/live-updates');
  }

  async createLiveUpdate(data: any) {
    return this.request('/api/live-updates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Notifications
  async getNotifications() {
    return this.request('/api/notifications');
  }

  async createNotification(data: any) {
    return this.request('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Committee
  async getCommitteeMembers() {
    return this.request('/api/committee');
  }

  async createCommitteeMember(data: any) {
    return this.request('/api/committee', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Awards
  async getAwards() {
    return this.request('/api/awards');
  }

  async createAward(data: any) {
    return this.request('/api/awards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Photos
  async getPhotos() {
    return this.request('/api/photos');
  }

  async uploadPhoto(data: any) {
    return this.request('/api/photos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Polls
  async getPolls() {
    return this.request('/api/polls');
  }

  async vote(pollId: string, option: string) {
    return this.request(`/api/polls/${pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ option }),
    });
  }

  // Commentary
  async getCommentary(matchId: string) {
    return this.request(`/api/commentary/match/${matchId}`);
  }

  async addCommentary(data: any) {
    return this.request('/api/commentary', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient(API_URL);
