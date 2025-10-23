
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart, type ShippingOption } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, subtotal, total, shipping, setShipping } = useCart();
  const [cep, setCep] = useState('');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculateShipping = async () => {
    if (!cep.trim()) return;
    
    setIsCalculating(true);
    setShippingOptions([]);
    setShipping(null);

    try {
      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cep: cep,
          products: cart.map(item => ({
            id: item.id,
            price: item.price,
            quantity: item.quantity,
            weight: item.weight || 0.5,
            width: item.width || 20,
            height: item.height || 5,
            length: item.length || 30
          }))
        })
      });

      const result = await response.json();

      if (result.success) {
        setShippingOptions(result.options);
      } else {
        throw new Error(result.error || 'Erro ao calcular frete');
      }
    } catch (error: any) {
      console.error('Erro ao calcular frete:', error);
      // Fallback para simulação em caso de erro
      setShippingOptions([
        { name: 'PAC', cost: 18.50 },
        { name: 'Sedex', cost: 32.90 },
      ]);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSelectShipping = (optionName: string) => {
    const selected = shippingOptions.find(opt => opt.name === optionName);
    setShipping(selected || null);
  };


  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground sm:text-4xl">
        Seu Carrinho
      </h1>
      
      {cart.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-lg text-muted-foreground">Seu carrinho está vazio.</p>
          <Button asChild className="mt-4">
            <Link href="/loja">Continuar Comprando</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ul role="list" className="divide-y divide-border">
              {cart.map((product) => (
                <li key={product.id} className="flex py-6">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover object-center"
                      data-ai-hint="product image"
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-foreground">
                        <h3>
                          <Link href={`/loja/${product.category.slug}/${product.slug}`}>{product.name}</Link>
                        </h3>
                        <p className="ml-4">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price * product.quantity)}</p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{product.category.name}</p>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                       <div className="flex items-center gap-2">
                        <label htmlFor={`quantity-${product.id}`} className="sr-only">Quantidade</label>
                         <Input
                          id={`quantity-${product.id}`}
                          type="number"
                          min="1"
                          value={product.quantity}
                          onChange={(e) => updateQuantity(product.id, parseInt(e.target.value, 10))}
                          className="w-20"
                        />
                       </div>

                      <div className="flex">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(product.id)}
                        >
                          <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                          <span className="sr-only">Remover {product.name}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <aside className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span>
                </div>
                 <Separator />

                {shipping ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Frete ({shipping.name})</span>
                      <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shipping.cost)}</span>
                    </div>
                    <Button variant="link" className="p-0 h-auto" onClick={() => setShipping(null)}>
                      Alterar CEP
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="cep" className="text-sm font-medium">Calcular Frete</Label>
                    <div className="mt-2 flex gap-2">
                      <Input id="cep" placeholder="Seu CEP" value={cep} onChange={(e) => setCep(e.target.value)} />
                      <Button variant="outline" onClick={handleCalculateShipping} disabled={isCalculating}>
                          {isCalculating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Calcular'}
                      </Button>
                    </div>
                  </div>
                )}
                
                {shippingOptions.length > 0 && !shipping && (
                   <RadioGroup value={shipping?.name} onValueChange={handleSelectShipping} className="space-y-2">
                      {shippingOptions.map(option => (
                        <Label key={option.name} htmlFor={option.name} className={cn("flex items-center justify-between rounded-md border p-3 cursor-pointer", shipping?.name === option.name && 'border-primary ring-2 ring-primary')}>
                            <div className="flex items-center gap-3">
                                <RadioGroupItem value={option.name} id={option.name} />
                                <span>{option.name}</span>
                            </div>
                           <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(option.cost)}</span>
                        </Label>
                      ))}
                   </RadioGroup>
                )}
                 <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
                  <Link href="/checkout">Finalizar Compra</Link>
                </Button>
              </CardFooter>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
}
