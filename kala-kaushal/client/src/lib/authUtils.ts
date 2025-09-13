export interface User {
  id: string
  name: string
  email: string
  role: 'athlete' | 'scout' | 'coach' | 'admin'
  avatar?: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const defaultAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
}

export function getUserRole(): User['role'] | null {
  const user = localStorage.getItem('user')
  if (!user) return null
  
  try {
    const parsedUser = JSON.parse(user)
    return parsedUser.role
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token')
}

export function getCurrentUser(): User | null {
  const user = localStorage.getItem('user')
  if (!user) return null
  
  try {
    return JSON.parse(user)
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/'
}
