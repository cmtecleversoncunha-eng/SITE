'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const orderId = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  useEffect(() => {
    if (orderId) {
      // Aqui você pode buscar os dados do pedido e pagamento
      // Por enquanto, vamos simular
      setTimeout(() => {
        setPaymentData({
          orderId,
          paymentId,
          status: 'approved',
          amount: 199.90
        });
        setIsLoading(false);
      }, 1000);
    } else {
      setIsLoading(false);
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p>Verificando pagamento...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">
              Pagamento Aprovado!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-green-700">
              Seu pagamento foi processado com sucesso. Em breve você receberá um e-mail de confirmação.
            </p>
            
            {paymentData && (
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Pedido:</span>
                    <p className="text-gray-600">#{paymentData.orderId}</p>
                  </div>
                  <div>
                    <span className="font-medium">Valor:</span>
                    <p className="text-gray-600">R$ {paymentData.amount?.toFixed(2)}</p>
                  </div>
                  {paymentData.paymentId && (
                    <div className="col-span-2">
                      <span className="font-medium">ID do Pagamento:</span>
                      <p className="text-gray-600 text-xs">{paymentData.paymentId}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-green-600 hover:bg-green-700">
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
