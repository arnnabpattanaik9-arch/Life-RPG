import { CharacterClass } from './character';

export interface User {
  id: string;
  email: string;
  username: string;
  characterName: string;
  characterClass: CharacterClass;
  createdAt: string;
}

export interface AuthSession {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface SignupCredentials {
  email: string;
  password?: string;
  username: string;
  characterName: string;
  characterClass: CharacterClass;
}
