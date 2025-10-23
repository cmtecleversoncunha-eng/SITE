import { CartClient } from '@/components/CartClient';

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Carrinho de Compras</h1>
      <CartClient />
    </div>
  );
}
