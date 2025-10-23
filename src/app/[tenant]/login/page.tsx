
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast({
        title: 'Sucesso!',
        description: 'Login realizado com sucesso.',
      });
      router.push('/conta');
    } catch (error: any) {
      console.error(error);
      
      toast({
        title: 'Erro de Autenticação',
        description: error.message || 'Credenciais inválidas. Verifique seu e-mail e senha.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md border border-gray-700 rounded-lg p-6 bg-gray-800">
        <h1 className="text-2xl font-bold text-center mb-4 text-white">Acessar sua Conta</h1>
        <p className="text-center text-gray-300 mb-6">
          Faça login para ver seus pedidos e gerenciar sua conta.
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-white">Email</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-white">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-300">
            Não tem uma conta?{' '}
            <Link href="/cadastro" className="text-blue-400 hover:text-blue-300 hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
