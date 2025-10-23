'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client'; // Importar o novo cliente centralizado
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface AuthUser {
  id: string;
  email: string;
  role: 'CLIENTE';
}

interface ExtraSignupData {
  fullName: string;
  cpf: string;
  phone: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, extraData: ExtraSignupData) => Promise<void>;
  signup: (email: string, password: string, extraData: ExtraSignupData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);
  const supabaseClient = createClient(); // Usar o novo cliente
  const router = useRouter();
  const fetchingRole = useRef(false);

  useEffect(() => {
    console.log('AuthProvider inicializando...');

    // Buscar sessão atual
    const getCurrentSession = async () => {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          console.error('Erro ao buscar sessão:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('Sessão encontrada:', session.user.email);
          await fetchUserProfile(session.user);
        } else {
          console.log('Nenhuma sessão encontrada');
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro inesperado ao buscar sessão:', error);
        setLoading(false);
      }
    };

    getCurrentSession();

    // Listener para mudanças de auth
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      console.log('Limpando subscription...');
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (supabaseUser: User) => {
    if (fetchingRole.current) {
      console.log('Já buscando perfil, ignorando...');
      return;
    }

    fetchingRole.current = true;
    
    try {
      console.log('Configurando usuário:', supabaseUser.email);
      
      // Simplificar: usar apenas dados do auth.users, sem depender da tabela profiles
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || 'unknown@example.com',
        role: 'CLIENTE' // Role padrão para todos os clientes do site
      });
      
      console.log('Usuário configurado com sucesso');
    } catch (e) {
      console.error('Erro inesperado ao configurar usuário:', e);
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || 'unknown@example.com',
        role: 'CLIENTE' // Fallback em caso de erro
      });
    } finally {
      setLoading(false);
      fetchingRole.current = false;
    }
  };

  const login = async (email: string, password: string) => {
    console.log('Tentando fazer login com:', email);
    
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Erro no login:', error);
      throw error;
    }

    console.log('Login realizado com sucesso');
  };

  const register = async (email: string, password: string, extraData: ExtraSignupData) => {
    console.log('Tentando registrar usuário:', email);

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          system: 'SITE', // Metadata para identificar que é usuário do site
          full_name: extraData.fullName,
          cpf: extraData.cpf,
          phone: extraData.phone,
        }
      }
    });

    if (error) {
      console.error('Erro no registro:', error);
      throw error;
    }

    // Confirmar email automaticamente se o usuário foi criado
    if (data.user) {
      try {
        await supabaseClient.auth.updateUser({
          data: {
            email_confirmed_at: new Date().toISOString()
          }
        });
        console.log('Email confirmado automaticamente');
      } catch (confirmError) {
        console.log('Erro ao confirmar email automaticamente:', confirmError);
        // Não falhar o cadastro se não conseguir confirmar o email
      }
    }

    console.log('Registro realizado com sucesso');
  };

  const signup = async (email: string, password: string, extraData: ExtraSignupData) => {
    // Alias para register para compatibilidade
    return register(email, password, extraData);
  };

  const logout = async () => {
    console.log('Fazendo logout...');
    
    try {
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) {
        console.error('Erro ao fazer logout:', error);
        throw error;
      }

      setUser(null);
      console.log('Logout realizado com sucesso');
      
      // Redirecionar para login após logout bem-sucedido
      router.push('/login');
    } catch (error) {
      console.error('Erro inesperado no logout:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    signup,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};