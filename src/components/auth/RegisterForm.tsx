'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast({
        title: 'Erro no Cadastro',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      // Fazer login automático imediatamente após cadastro
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        toast({
          title: 'Cadastro Realizado',
          description: 'Sua conta foi criada com sucesso. Faça login para continuar.',
        });
        router.push('/login');
      } else {
        toast({
          title: 'Cadastro Realizado',
          description: 'Sua conta foi criada com sucesso. Você já está logado!',
        });
        router.push('/conta');
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleRegister} className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-sm text-muted-foreground">
          Preencha os dados abaixo para criar sua conta
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome Completo</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Seu nome completo"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar Senha</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Criando conta...' : 'Criar Conta'}
      </Button>
      
      <div className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Fazer login
        </Link>
      </div>
    </form>
  );
}
