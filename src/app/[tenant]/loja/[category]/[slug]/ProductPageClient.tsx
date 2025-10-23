'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/data';

interface ProductPageClientProps {
  product: Product;
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(product, 1);
    toast({
      title: "Adicionado ao Carrinho",
      description: `${product.name} foi adicionado ao seu carrinho.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="rounded-lg overflow-hidden border">
          <Image
            src={product.image}
            alt={product.name}
            width={800}
            height={800}
            className="w-full h-full object-cover"
            data-ai-hint="product image"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4">
             <p className="text-3xl tracking-tight text-foreground">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
             </p>
          </div>
          <div className="mt-6">
            <h3 className="sr-only">Description</h3>
            <div className="space-y-6 text-base text-muted-foreground">
                <p>{product.description}</p>
            </div>
          </div>
          <div className="mt-10">
            <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" /> Adicionar ao carrinho
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
