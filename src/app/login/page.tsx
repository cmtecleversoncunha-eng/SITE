import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Entrar na Conta</h1>
          <p className="text-muted-foreground">Acesse sua conta para acompanhar seus pedidos</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
