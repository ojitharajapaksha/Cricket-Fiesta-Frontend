export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  traineeId?: string;
  playerId?: string;
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function isSuperAdmin(): boolean {
  const user = getUser();
  return user?.role === 'SUPER_ADMIN';
}

export function isAdmin(): boolean {
  const user = getUser();
  return user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
}

export function isUser(): boolean {
  const user = getUser();
  return user?.role === 'USER';
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export function redirectIfNotAuthenticated() {
  if (!isAuthenticated()) {
    window.location.href = '/login';
    return true;
  }
  return false;
}

export function redirectIfNotRole(...roles: Array<'SUPER_ADMIN' | 'ADMIN' | 'USER'>) {
  const user = getUser();
  if (!user || !roles.includes(user.role)) {
    window.location.href = '/dashboard';
    return true;
  }
  return false;
}
