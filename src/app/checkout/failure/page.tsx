'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function CheckoutFailureContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-800">
              Pagamento Não Aprovado
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-red-700">
              Infelizmente, não foi possível processar seu pagamento. Isso pode acontecer por diversos motivos.
            </p>
            
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <h4 className="font-medium text-gray-800 mb-2">Possíveis causas:</h4>
              <ul className="text-sm text-gray-600 space-y-1 text-left">
                <li>• Dados do cartão incorretos</li>
                <li>• Limite insuficiente</li>
                <li>• Cartão bloqueado</li>
                <li>• Problemas de conectividade</li>
              </ul>
            </div>

            {orderId && (
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <div className="text-sm">
                  <span className="font-medium">Pedido:</span>
                  <p className="text-gray-600">#{orderId}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/carrinho">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
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
              <p>Precisa de ajuda?</p>
              <p>
                Entre em contato conosco através do{' '}
                <Link href="/contato" className="text-blue-600 hover:underline">
                  formulário de contato
                </Link>
                {' '}ou{' '}
                <Link href="/suporte" className="text-blue-600 hover:underline">
                  suporte
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutFailurePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2">Carregando...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <CheckoutFailureContent />
    </Suspense>
  );
}
