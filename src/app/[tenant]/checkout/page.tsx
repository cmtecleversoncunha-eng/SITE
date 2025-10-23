
'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const { cart, subtotal, shipping, total, clearCart, setShipping } = useCart();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    cpf: '',
    phone: '',
    address: '',
    number: '',
    complement: '',
    city: '',
    state: '',
    cep: ''
  });

  // Estados para cálculo de frete no checkout
  const [checkoutShippingOptions, setCheckoutShippingOptions] = useState([]);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(null);
  
  const [paymentMethod, setPaymentMethod] = useState('checkout-pro');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Aplicar máscaras
    if (name === 'cpf') {
      // Remove tudo que não é dígito
      const numbers = value.replace(/\D/g, '');
      // Aplica a máscara 000.000.000-00
      formattedValue = numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (name === 'phone') {
      // Remove tudo que não é dígito
      const numbers = value.replace(/\D/g, '');
      // Aplica a máscara (00) 00000-0000
      if (numbers.length <= 10) {
        formattedValue = numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else {
        formattedValue = numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      }
    } else if (name === 'cep') {
      // Remove tudo que não é dígito
      const numbers = value.replace(/\D/g, '');
      // Aplica a máscara 00000-000
      formattedValue = numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleCalculateShipping = () => {
    if (!formData.cep.trim()) {
      toast({
        title: "CEP obrigatório",
        description: "Por favor, digite o CEP para calcular o frete.",
        variant: "destructive"
      });
      return;
    }
    
    setIsCalculatingShipping(true);
    setCheckoutShippingOptions([]);
    setSelectedShipping(null);
    
    // Simula uma chamada de API (mesmo sistema do carrinho)
    setTimeout(() => {
      setCheckoutShippingOptions([
        { name: 'PAC', cost: 18.50 },
        { name: 'Sedex', cost: 32.90 },
      ]);
      setIsCalculatingShipping(false);
    }, 1000);
  };

  const handleSelectShipping = (optionName: string) => {
    const option = checkoutShippingOptions.find((opt: { name: string }) => opt.name === optionName);
    if (option) {
      setSelectedShipping(option);
      setShipping(option); // Atualiza o frete no contexto global
    }
  };

  const validateForm = () => {
    const required = ['email', 'name', 'cpf', 'phone', 'address', 'number', 'city', 'state', 'cep'];
    const missing = required.filter(field => !formData[field as keyof typeof formData].trim());
    
    if (missing.length > 0) {
      const fieldNames: { [key: string]: string } = {
        email: 'Email',
        name: 'Nome Completo',
        cpf: 'CPF',
        phone: 'Telefone',
        address: 'Endereço',
        number: 'Número',
        city: 'Cidade',
        state: 'Estado',
        cep: 'CEP'
      };
      
      const missingNames = missing.map(field => fieldNames[field] || field);
      
      toast({
        title: "Campos obrigatórios",
        description: `Por favor, preencha: ${missingNames.join(', ')}`,
        variant: "destructive"
      });
      return false;
    }

    // VALIDAÇÃO TEMPORARIAMENTE DESABILITADA: Frete deve ser calculado e selecionado
    // if (!selectedShipping) {
    //   toast({
    //     title: "Frete obrigatório",
    //     description: "Por favor, calcule e selecione uma forma de entrega antes de finalizar o pedido.",
    //     variant: "destructive"
    //   });
    //   return false;
    // }
    
    // Validar formato do CPF
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(formData.cpf)) {
      toast({
        title: "CPF inválido",
        description: "Por favor, digite o CPF no formato 000.000.000-00",
        variant: "destructive"
      });
      return false;
    }
    
    // Validar formato do telefone
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Telefone inválido",
        description: "Por favor, digite o telefone no formato (00) 00000-0000",
        variant: "destructive"
      });
      return false;
    }
    
    // Validar formato do CEP
    const cepRegex = /^\d{5}-\d{3}$/;
    if (!cepRegex.test(formData.cep)) {
      toast({
        title: "CEP inválido",
        description: "Por favor, digite o CEP no formato 00000-000",
        variant: "destructive"
      });
      return false;
    }
    
    // Usar frete do checkout se disponível, senão usar do carrinho
    const finalShipping = selectedShipping || shipping;
    
    // VALIDAÇÃO TEMPORARIAMENTE DESABILITADA
    // if (!finalShipping) {
    //   toast({
    //     title: "Frete não selecionado",
    //     description: "Por favor, calcule e selecione uma opção de frete.",
    //     variant: "destructive"
    //   });
    //   return false;
    // }
    
    return true;
  };


  const handleMercadoPagoSuccess = async (paymentData: any) => {
    try {
      // Criar pedido no banco de dados
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerData: formData,
          cartItems: cart,
          paymentData: {
            ...paymentData,
            payment_method: 'MERCADO_PAGO'
          },
          shippingCost: selectedShipping || shipping,
          subtotal: subtotal,
          total: selectedShipping ? subtotal + (selectedShipping?.cost || 0) : total
        })
      });

      const result = await response.json();

      if (result.success) {
        setPaymentSuccess({
          ...paymentData,
          orderId: result.order.id
        });
        clearCart();
        toast({
          title: "Pagamento aprovado!",
          description: `Seu pedido foi processado com sucesso. ID: ${result.order.id}`,
        });
      } else {
        throw new Error(result.error || 'Erro ao criar pedido');
      }
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      toast({
        title: "Erro ao finalizar pedido",
        description: "Pagamento aprovado, mas houve erro ao salvar o pedido. Entre em contato conosco.",
        variant: "destructive"
      });
    }
  };

  const handleMercadoPagoError = (error: any) => {
    console.error('Erro no Mercado Pago:', error);
  };

  const createMercadoPagoPreference = async () => {
    try {
      setIsProcessing(true);

      // Criar preferência de pagamento no backend
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              title: `Pedido #ORDER-${Date.now()}`,
              quantity: 1,
              unit_price: selectedShipping ? subtotal + selectedShipping.cost : total,
              currency_id: 'BRL'
            }
          ],
          payer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone ? {
              number: formData.phone
            } : undefined,
            identification: formData.cpf ? {
              type: 'CPF',
              number: formData.cpf
            } : undefined
          },
          back_urls: {
            success: `${window.location.origin}/checkout/success?order_id=ORDER-${Date.now()}`,
            failure: `${window.location.origin}/checkout/failure?order_id=ORDER-${Date.now()}`,
            pending: `${window.location.origin}/checkout/pending?order_id=ORDER-${Date.now()}`
          },
          auto_return: 'approved',
          external_reference: `ORDER-${Date.now()}`,
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
        // Redirecionar para o Mercado Pago Checkout
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // O processamento do pagamento é feito pelo componente MercadoPagoCheckoutPro
    // Este formulário apenas valida os dados obrigatórios
  };


  if (cart.length === 0) {
    return (
       <div className="container mx-auto flex h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold font-headline">Seu carrinho está vazio</h1>
        <p className="mt-2 text-muted-foreground">Adicione produtos para finalizar a compra.</p>
       </div>
    )
  }

  // Tela de sucesso do pagamento
  if (paymentSuccess) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold font-headline text-green-600 mb-2">
              Pagamento Aprovado!
            </h1>
            <p className="text-lg text-muted-foreground">
              Seu pedido foi processado com sucesso
            </p>
          </div>
          
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="space-y-4 text-left">
                <div className="flex justify-between">
                  <span className="font-medium">ID do Pagamento:</span>
                  <span className="font-mono">{paymentSuccess.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Valor:</span>
                  <span>R$ {paymentSuccess.transaction_amount.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className="text-green-600 font-medium">Aprovado</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Data:</span>
                  <span>{new Date(paymentSuccess.date_approved).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Você receberá um email de confirmação em breve com os detalhes do seu pedido.
            </p>
            <Button asChild className="w-full">
              <a href="/">Continuar Comprando</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground sm:text-4xl">
        Finalizar Compra
      </h1>

      <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="text-xl font-headline font-semibold">Informações de Contato</h2>
              <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="seu@email.com" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-headline font-semibold">Endereço de Entrega</h2>
              <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6 space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input 
                    id="name" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="sm:col-span-3 space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input 
                    id="cpf" 
                    name="cpf"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="sm:col-span-3 space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="sm:col-span-6 space-y-2">
                  <Label htmlFor="address">Endereço *</Label>
                  <Input 
                    id="address" 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="number">Número *</Label>
                  <Input 
                    id="number" 
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="sm:col-span-4 space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input 
                    id="complement" 
                    name="complement"
                    value={formData.complement}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="sm:col-span-3 space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input 
                    id="city" 
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="sm:col-span-3 space-y-2">
                  <Label htmlFor="state">Estado *</Label>
                  <Input 
                    id="state" 
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="sm:col-span-3 space-y-2">
                  <Label htmlFor="cep">CEP *</Label>
                    <Input 
                      id="cep" 
                      name="cep"
                      placeholder="00000-000"
                      value={formData.cep}
                      onChange={handleInputChange}
                      required
                    />
                </div>
              </div>
            </div>

            {/* Seção de Frete - TEMPORARIAMENTE REMOVIDA */}
            <div className="space-y-4">
              <h2 className="text-xl font-headline font-semibold">Entrega</h2>
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-800">
                  <strong>📦 Entrega:</strong> Frete será calculado após a confirmação do pedido.
                    </AlertDescription>
                  </Alert>
            </div>
            
            <div>
                <h2 className="text-xl font-headline font-semibold">Finalizar Compra</h2>
                 <div className="mt-6">
                    <Alert className="border-blue-200 bg-blue-50">
                        <AlertDescription className="text-blue-800">
                            <strong>💳 Pagamento seguro:</strong> Você será direcionado para o ambiente seguro do Mercado Pago, onde poderá escolher entre PIX, cartão de crédito, boleto ou dividir o pagamento.
                        </AlertDescription>
                    </Alert>
                    
                    <Button
                      onClick={() => {
                        // Validação rápida dos campos obrigatórios
                        const required = ['email', 'name', 'cpf', 'phone', 'address', 'number', 'city', 'state', 'cep'];
                        const missing = required.filter(field => !formData[field as keyof typeof formData].trim());
                        
                        if (missing.length > 0) {
                          toast({
                            title: "Campos obrigatórios",
                            description: "Por favor, preencha todos os campos obrigatórios antes de continuar.",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        // Criar preferência e redirecionar para o Mercado Pago
                        createMercadoPagoPreference();
                      }}
                      disabled={isProcessing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        'Continuar para Pagamento'
                      )}
                    </Button>
                 </div>
            </div>
          </form>
        </div>

        <aside className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <ul role="list" className="divide-y divide-border">
                {cart.map((product) => (
                  <li key={product.id} className="flex items-center py-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                        {product.image ? (
                        <Image src={product.image} alt={product.name} width={64} height={64} className="h-full w-full object-cover"/>
                        ) : (
                            <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                <span className="text-xs text-gray-500">Sem imagem</span>
                            </div>
                        )}
                    </div>
                    <div className="ml-4 flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">Qtd: {product.quantity}</p>
                    </div>
                    <p className="font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price * product.quantity)}</p>
                  </li>
                ))}
              </ul>
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Entrega</span>
                  <span>Será calculado</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
        </aside>
      </div>
    </div>
  );
}
