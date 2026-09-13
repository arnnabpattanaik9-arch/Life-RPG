import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials, SignupCredentials } from '../types/auth';
import { api } from '../services/api';
import { sound } from '../services/sound';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (creds: LoginCredentials) => Promise<void>;
  signup: (creds: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoUser: (archetype: 'technomancer' | 'vanguard' | 'shadow') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const current = await api.auth.getCurrentUser();
        setUser(current);
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (creds: LoginCredentials) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await api.auth.login(creds);
      setUser(loggedInUser);
      sound.playQuestComplete();
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (creds: SignupCredentials) => {
    setIsLoading(true);
    try {
      const { user: newUser } = await api.auth.signup(creds);
      setUser(newUser);
      sound.playLevelUp();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.auth.logout();
      setUser(null);
      sound.playClick();
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoUser = async (archetype: 'technomancer' | 'vanguard' | 'shadow') => {
    const archetypeMap = {
      technomancer: { name: 'Kaelen Vance', class: 'technomancer' as const, email: 'kaelen@liferpg.realm' },
      vanguard: { name: 'Valeria Ironheart', class: 'vanguard' as const, email: 'valeria@liferpg.realm' },
      shadow: { name: 'Nyx Shadowstep', class: 'shadow' as const, email: 'nyx@liferpg.realm' },
    };
    const selected = archetypeMap[archetype];
    try {
      await signup({
        email: selected.email,
        username: selected.name.replace(/\s+/g, ''),
        characterName: selected.name,
        characterClass: selected.class,
        password: 'Password123!',
      });
    } catch {
      // If user already exists in PostgreSQL, log in directly
      await login({
        email: selected.email,
        password: 'Password123!',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, switchDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
