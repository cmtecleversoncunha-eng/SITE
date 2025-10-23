import { AccountClient } from '@/components/AccountClient';

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Minha Conta</h1>
        <AccountClient />
      </div>
    </div>
  );
}
