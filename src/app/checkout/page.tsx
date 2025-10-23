import { Metadata } from 'next';
import { CheckoutClient } from '@/components/CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Finalize sua compra de forma segura.',
};

export default function CheckoutPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground sm:text-4xl mb-8">
        Finalizar Compra
      </h1>
      <CheckoutClient />
    </div>
  );
}
