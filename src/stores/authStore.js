import { create } from 'zustand';
import { storage } from '../lib/storage';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  
  checkAuth: async () => {
    try {
      const user = storage.getUser();
      set({ user, loading: false });
    } catch (error) {
      console.error('Auth check error:', error);
      set({ user: null, loading: false });
    }
  },

  signIn: async (email, password) => {
    // Simple mock authentication - in a real app, you'd validate credentials
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    const userData = {
      id: user.id,
      email: user.email,
      user_metadata: { role: user.role }
    };
    
    storage.setUser(userData);
    set({ user: userData });
    return { user: userData };
  },

  signUp: async (email, password, role = 'pharmacy') => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }
    
    const newUser = {
      id: storage.generateId(),
      email,
      password, // In a real app, this would be hashed
      role,
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    return { user: newUser };
  },

  signOut: async () => {
    storage.removeUser();
    set({ user: null });
  },
}));