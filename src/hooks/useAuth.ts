import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener BEFORE getting session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function useUserRole() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data?.role as 'admin' | 'editor' | null;
    },
    enabled: !!user,
  });
}

export function useIsAdmin() {
  const { data: role, isLoading } = useUserRole();
  return { isAdmin: role === 'admin', isLoading };
}

export function useIsAdminOrEditor() {
  const { data: role, isLoading } = useUserRole();
  return { 
    isAdminOrEditor: role === 'admin' || role === 'editor', 
    isAdmin: role === 'admin',
    isEditor: role === 'editor',
    isLoading 
  };
}

export async function signIn(email: string, password: string) {
  // Check if email ends with @icmpp.ro
  if (!email.endsWith('@icmpp.ro')) {
    throw new Error('Doar utilizatorii cu email @icmpp.ro pot accesa panoul de administrare.');
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
