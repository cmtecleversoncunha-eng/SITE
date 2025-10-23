
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { formatCPF, formatPhone, validateCPF, validatePhone } from '@/lib/utils';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      return;
    }

    if (!validateCPF(cpf)) {
      toast({
        title: 'Erro',
        description: 'CPF inválido.',
        variant: 'destructive',
      });
      return;
    }

    if (!validatePhone(phone)) {
      toast({
        title: 'Erro',
        description: 'Número de telefone inválido.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await signup(email, password, {
        fullName,
        cpf,
        phone,
      });
      
      toast({
        title: 'Cadastro Realizado!',
        description: 'Sua conta foi criada com sucesso. Você já pode fazer login.',
      });
      
      // Redirecionar para a página de login
      router.push('/login');
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Erro ao Criar Conta',
        description: error.message || 'Não foi possível criar sua conta. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Crie sua Conta</CardTitle>
          <CardDescription>
            É rápido e fácil. Comece a comprar agora mesmo.
          </CardDescription>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Importante:</strong> Após o cadastro, você receberá um email de confirmação. 
              Clique no link para ativar sua conta e poder fazer login.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                type="text"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                required
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="text"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>
           <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="font-medium text-accent hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
