'use client';

import { useCart } from '@/hooks/useCart';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, User, Mail, Phone } from 'lucide-react';
import { ShippingCalculator } from './ShippingCalculator';

export function CheckoutClient() {
  const { cart, subtotal, total, clearCart, shipping, setShipping } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    cep: '',
    address: '',
    city: '',
    state: '',
    complement: ''
  });

  // Obter dados do usuário logado
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  if (cart.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Seu carrinho está vazio</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg max-w-md mx-auto">
          Adicione alguns produtos antes de finalizar a compra.
        </p>
        <Button 
          onClick={() => router.push('/loja')}
          className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          Ir para a Loja
        </Button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const supabase = createClient();
      
      // Obter o usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para finalizar a compra.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Criar preferência de pagamento no Mercado Pago
      const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const preferenceResponse = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            ...cart.map(item => ({
              title: item.name,
              quantity: item.quantity,
              unit_price: item.price,
              currency_id: 'BRL'
            })),
            ...(shipping ? [{
              title: `Frete - ${shipping.company} ${shipping.name}`,
              quantity: 1,
              unit_price: shipping.price / 100,
              currency_id: 'BRL'
            }] : [])
          ],
          payer: {
            name: formData.fullName,
            email: user?.email || '',
            phone: formData.phone ? {
              number: formData.phone
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

      const preferenceResult = await preferenceResponse.json();

      if (!preferenceResponse.ok) {
        throw new Error(preferenceResult.error || 'Erro ao criar preferência de pagamento');
      }

      if (preferenceResult.sandbox_init_point) {
        // Redirecionar para o Mercado Pago Checkout Pro (SANDBOX)
        window.location.href = preferenceResult.sandbox_init_point;
      } else if (preferenceResult.init_point) {
        // Fallback para produção se sandbox não estiver disponível
        window.location.href = preferenceResult.init_point;
      } else {
        throw new Error('URL de checkout não recebida');
      }
      
    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Formulário de Checkout */}
      <div className="space-y-6">
        {/* Informações Pessoais */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <User className="w-5 h-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                placeholder="Seu nome completo"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <div className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400">
                {user?.email || 'Carregando...'}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                E-mail do usuário logado
              </p>
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(11) 99999-9999"
              />
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <MapPin className="w-5 h-5" />
              Endereço de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  name="cep"
                  value={formData.cep}
                  onChange={handleInputChange}
                  placeholder="00000-000"
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="SP"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="São Paulo"
              />
            </div>
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Rua, número, bairro"
              />
            </div>
            <div>
              <Label htmlFor="complement">Complemento</Label>
              <Textarea
                id="complement"
                name="complement"
                value={formData.complement}
                onChange={handleInputChange}
                placeholder="Apartamento, bloco, etc. (opcional)"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cálculo de Frete */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              Frete e Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ShippingCalculator
              onShippingSelect={setShipping}
              selectedShipping={shipping}
              autoCalculate={true}
              showTitle={false}
            />
          </CardContent>
        </Card>

      </div>

      {/* Resumo do Pedido */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 h-fit sticky top-24">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Resumo do Pedido</h2>
        </div>
        
        {/* Itens do Carrinho */}
        <div className="space-y-4 mb-6">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-700 rounded-lg">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-600 rounded-lg flex items-center justify-center overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white">{item.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Qtd: {item.quantity}</p>
              </div>
              <p className="font-bold text-slate-900 dark:text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-4 border-b border-slate-200 dark:border-slate-600">
            <span className="text-slate-600 dark:text-slate-300 font-medium text-lg">Subtotal:</span>
            <span className="text-slate-900 dark:text-white font-bold text-xl">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-4 border-b border-slate-200 dark:border-slate-600">
            <span className="text-slate-600 dark:text-slate-300 font-medium text-lg">Frete:</span>
            <span className="text-slate-900 dark:text-white font-bold text-lg">
              {shipping ? (
                <div className="text-right">
                  <div>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shipping.price / 100)}</div>
                  <div className="text-xs text-slate-500">{shipping.company} - {shipping.deliveryTime} dias úteis</div>
                </div>
              ) : (
                'Calcule o frete'
              )}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-6 bg-primary/10 dark:bg-primary/20 rounded-xl px-6">
            <span className="text-slate-900 dark:text-white font-bold text-2xl">Total:</span>
            <span className="text-primary font-bold text-3xl">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
            </span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8">
          <Button 
            type="submit"
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-lg border-0 disabled:opacity-50 disabled:cursor-not-allowed" 
          >
            {isProcessing ? (
              <>
                <svg className="w-6 h-6 mr-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Processando...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Finalizar Compra
              </>
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Compra 100% segura
          </p>
        </div>
      </div>
    </div>
  );
}
