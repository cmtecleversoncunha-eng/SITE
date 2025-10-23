'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function CheckoutPendingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Clock className="h-16 w-16 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl text-yellow-800">
              Pagamento Pendente
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-yellow-700">
              Seu pagamento está sendo processado. Em breve você receberá uma confirmação por e-mail.
            </p>
            
            <div className="bg-white p-4 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-gray-800 mb-2">O que acontece agora?</h4>
              <ul className="text-sm text-gray-600 space-y-1 text-left">
                <li>• Seu pagamento será analisado</li>
                <li>• Você receberá um e-mail de confirmação</li>
                <li>• Seu pedido será processado</li>
                <li>• Você pode acompanhar o status em "Minha Conta"</li>
              </ul>
            </div>

            {orderId && (
              <div className="bg-white p-4 rounded-lg border border-yellow-200">
                <div className="text-sm">
                  <span className="font-medium">Pedido:</span>
                  <p className="text-gray-600">#{orderId}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-yellow-600 hover:bg-yellow-700">
                <Link href="/conta">
                  <Package className="mr-2 h-4 w-4" />
                  Acompanhar Pedido
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/loja">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continuar Comprando
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600 space-y-2">
              <p>Dúvidas sobre seu pedido?</p>
              <p>
                Entre em contato conosco através do{' '}
                <Link href="/contato" className="text-blue-600 hover:underline">
                  formulário de contato
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutPendingPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
                <p className="mt-2">Carregando...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <CheckoutPendingContent />
    </Suspense>
  );
}
