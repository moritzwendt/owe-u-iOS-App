import React, { createContext, useContext, useState } from 'react';

// MARK: - Types

export type AuthUser = { id: string; email: string };

export type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  // Supabase integration: replace each stub body with the corresponding
  // supabase.auth call. The context shape and useAuth() API stay identical.
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
};

// MARK: - Context

const AuthContext = createContext<AuthContextType | null>(null);

// MARK: - Provider

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function signInWithEmail(email: string, password: string) {
    setIsLoading(true);
    try {
      // TODO: const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      // if (error) throw error
      // setUser({ id: data.user.id, email: data.user.email! })

      // Stub: only the dev test account is accepted
      if (email !== 'moritz_wendt@icloud.com' || password !== '123456') {
        throw new Error('E-Mail oder Passwort falsch.');
      }
      setUser({ id: 'stub', email });
    } finally {
      setIsLoading(false);
    }
  }

  async function signUpWithEmail(email: string, _password: string) {
    setIsLoading(true);
    try {
      // TODO: const { data, error } = await supabase.auth.signUp({ email, password })
      // if (error) throw error
      // setUser({ id: data.user!.id, email: data.user!.email! })
      setUser({ id: 'stub', email });
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithGoogle() {
    setIsLoading(true);
    try {
      // TODO: supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: ... } })
      setUser({ id: 'stub', email: 'google@stub.dev' });
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithApple() {
    setIsLoading(true);
    try {
      // TODO: supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: ... } })
      setUser({ id: 'stub', email: 'apple@stub.dev' });
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    // TODO: await supabase.auth.signOut()
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// MARK: - Hook

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
