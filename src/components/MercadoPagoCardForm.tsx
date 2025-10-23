'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { IMercadoPago } from '@/types/mercadopago';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CardFooter } from '@/components/ui/card';

interface MercadoPagoCardFormProps {
  total: number;
  customerData: {
    email: string;
    name: string;
    phone: string;
    cpf: string;
    cep: string;
    address: string;
    city: string;
    state: string;
  };
  onSuccess: (paymentData: any) => void;
  onError: (error: any) => void;
  disabled?: boolean;
}

export function MercadoPagoCardForm({ total, customerData, onSuccess, onError, disabled = false }: MercadoPagoCardFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mp, setMp] = useState<IMercadoPago | null>(null);
  const [cardData, setCardData] = useState({
    name: customerData.name,
    email: customerData.email,
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadSDK = async () => {
      try {
        if (typeof window !== 'undefined' && window.MercadoPago) {
          if (process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY) {
            const mpInstance = new window.MercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY, {
              locale: 'pt-BR'
            });
            setMp(mpInstance);
          }
          setIsLoading(false);
        } else {
          const script = document.createElement('script');
          script.src = 'https://sdk.mercadopago.com/js/v2';
          script.async = true;
          script.onload = () => {
            setTimeout(() => {
              try {
                if (window.MercadoPago && process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY) {
                  const mpInstance = new window.MercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY, {
                    locale: 'pt-BR'
                  });
                  setMp(mpInstance);
                }
              } catch (error) {
                console.error('Erro ao instanciar Mercado Pago:', error);
              }
              setIsLoading(false);
            }, 100);
          };
          script.onerror = () => {
            console.error('Erro ao carregar SDK do Mercado Pago');
            setIsLoading(false);
          };
          document.head.appendChild(script);
        }
      } catch (error) {
        console.error('Erro ao inicializar Mercado Pago:', error);
        setIsLoading(false);
      }
    };

    loadSDK();
  }, []);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      if (!mp) {
        throw new Error('SDK do Mercado Pago não está inicializado');
      }

      const cardToken = await mp.createCardToken({
        cardholderName: cardData.name,
        cardholderEmail: cardData.email,
        cardNumber: cardData.cardNumber.replace(/\s/g, ''),
        securityCode: cardData.cvv,
        expirationMonth: cardData.expiry.split('/')[0],
        expirationYear: `20${cardData.expiry.split('/')[1]}`,
        identificationType: 'CPF', 
        identificationNumber: '00000000000' 
      });

      if (cardToken && cardToken.id) {
        await submitPayment(cardToken.id);
      } else {
        throw new Error('Erro ao criar token do cartão');
      }
      
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        title: 'Erro no pagamento',
        description: error.message || 'Erro ao processar o pagamento. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const submitPayment = async (cardTokenId: string) => {
    try {
      const response = await fetch('/api/mercadopago/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          customer: {
            email: cardData.email,
            name: cardData.name
          },
          description: `Compra na loja - R$ ${total.toFixed(2)}`,
          card_token_id: cardTokenId
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro no processamento do pagamento');
      }

      onSuccess(result.payment);
      
      toast({
        title: "Pagamento aprovado!",
        description: "Seu pagamento foi processado com sucesso.",
      });
      
    } catch (error: any) {
      console.error('Erro no pagamento:', error);
      onError(error);
      toast({
        title: "Erro no pagamento",
        description: error.message || "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Carregando formulário de pagamento...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pagamento com Cartão
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div id="form-checkout">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="form-checkout__cardholderName" className="text-gray-300">Nome no Cartão</Label>
                <Input 
                  id="form-checkout__cardholderName" 
                  placeholder="Nome completo"
                  value={cardData.name}
                  onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  autoComplete="cc-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-checkout__cardholderEmail" className="text-gray-300">Email</Label>
                <Input 
                  id="form-checkout__cardholderEmail" 
                  placeholder="seu@email.com"
                  value={cardData.email}
                  onChange={(e) => setCardData({ ...cardData, email: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="form-checkout__cardNumber" className="text-gray-300">Número do Cartão</Label>
              <Input 
                id="form-checkout__cardNumber" 
                placeholder="0000 0000 0000 0000"
                value={cardData.cardNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Remove não-dígitos
                  const formattedValue = (value.match(/.{1,4}/g) || []).join(' ').substring(0, 19);
                  setCardData({ ...cardData, cardNumber: formattedValue });
                }}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                autoComplete="cc-number"
                inputMode="numeric"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="form-checkout__expirationDate" className="text-gray-300">Validade</Label>
                <Input 
                  id="form-checkout__expirationDate" 
                  placeholder="MM/AA"
                  value={cardData.expiry}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 2) {
                      value = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
                    }
                    setCardData({ ...cardData, expiry: value });
                  }}
                  maxLength={5}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  autoComplete="cc-exp"
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-checkout__securityCode" className="text-gray-300">CVV</Label>
                <Input 
                  id="form-checkout__securityCode" 
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setCardData({ ...cardData, cvv: value.substring(0, 4) });
                  }}
                  maxLength={4}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  autoComplete="cc-csc"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Seus dados estão protegidos com criptografia SSL. Não armazenamos informações do cartão.
          </AlertDescription>
        </Alert>
        
        {disabled && (
          <Alert variant="destructive">
            <AlertDescription>
              <strong>⚠️ Frete obrigatório:</strong> Selecione uma forma de entrega antes de finalizar o pagamento.
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          type="button"
          onClick={handlePayment}
          className="w-full" 
          disabled={isProcessing || disabled}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando Pagamento...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pagar R$ {total.toFixed(2).replace('.', ',')}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}