'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MercadoPagoCheckoutProProps {
  total: number;
  customerData: {
    name: string;
    email: string;
    phone?: string;
    cpf?: string;
  };
  orderId: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: any) => void;
  disabled?: boolean;
}

export function MercadoPagoCheckoutPro({ 
  total, 
  customerData, 
  orderId,
  onSuccess, 
  onError, 
  disabled = false 
}: MercadoPagoCheckoutProProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const createCheckoutPreference = async () => {
    try {
      setIsLoading(true);

      // Criar preferência de pagamento no backend
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              title: `Pedido #${orderId}`,
              quantity: 1,
              unit_price: total,
              currency_id: 'BRL'
            }
          ],
          payer: {
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone ? {
              number: customerData.phone
            } : undefined,
            identification: customerData.cpf ? {
              type: 'CPF',
              number: customerData.cpf
            } : undefined
          },
          back_urls: {
            success: `${window.location.origin}/checkout/success?order_id=${orderId}`,
            failure: `${window.location.origin}/checkout/failure?order_id=${orderId}`,
            pending: `${window.location.origin}/checkout/pending?order_id=${orderId}`
          },
          auto_return: 'approved',
          external_reference: orderId,
          notification_url: `${window.location.origin}/api/mercadopago/webhook`,
          payment_methods: {
            excluded_payment_methods: [],
            excluded_payment_types: [],
            installments: 12
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar preferência de pagamento');
      }

      if (result.init_point) {
        setCheckoutUrl(result.init_point);
        // Redirecionar automaticamente para o Checkout Pro
        window.location.href = result.init_point;
      } else {
        throw new Error('URL de checkout não recebida');
      }

    } catch (error: any) {
      console.error('Erro ao criar checkout:', error);
      toast({
        title: "Erro no pagamento",
        description: error.message || "Não foi possível processar o pagamento",
        variant: "destructive"
      });
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Pagamento com Mercado Pago</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Você será redirecionado para o ambiente seguro do Mercado Pago para finalizar seu pagamento.
        </p>
      </div>

      <Button
        onClick={createCheckoutPreference}
        disabled={disabled || isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <ExternalLink className="mr-2 h-4 w-4" />
            Pagar com Mercado Pago
          </>
        )}
      </Button>

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>• <strong>PIX instantâneo</strong> - Aprovação imediata</p>
        <p>• <strong>Cartão de crédito</strong> - Visa, Mastercard, Elo (até 12x)</p>
        <p>• <strong>Boleto bancário</strong> - Vencimento em até 3 dias úteis</p>
        <p>• <strong>Divisão de pagamento</strong> - Combine PIX + cartão + boleto</p>
        <p>• <strong>Saldo Mercado Pago</strong> - Pagamento instantâneo</p>
      </div>
    </div>
  );
}
