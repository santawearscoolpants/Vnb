import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getSupabaseClient, isSupabaseConfigured, mapSupabaseUser, type AppUser } from '../lib/supabase';

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const client = getSupabaseClient();
    let isMounted = true;

    client.auth.getUser()
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error || !data.user) {
          setUser(null);
          return;
        }
        setUser(mapSupabaseUser(data.user));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ? mapSupabaseUser(session.user) : null);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('Unable to sign in.');
    setUser(mapSupabaseUser(data.user));
  }, []);

  const logout = useCallback(async () => {
    const client = getSupabaseClient();
    await client.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
