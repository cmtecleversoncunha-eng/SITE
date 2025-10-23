import { RegisterForm } from '@/components/auth/RegisterForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Criar Conta',
  description: 'Crie sua conta para acompanhar seus pedidos e ter acesso a ofertas exclusivas.',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8 rounded-lg shadow-lg bg-card">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Criar Conta</h1>
          <p className="text-sm text-muted-foreground">
            Crie sua conta para acompanhar seus pedidos
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
