'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/data';
import { Button } from './ui/button';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
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
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md">
      <Link href={`/loja/${product.category.slug}/${product.slug}`} className="block">
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-200">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={400}
              height={400}
              className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
              data-ai-hint="product image"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-sm">Sem imagem</span>
            </div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="text-md font-headline font-semibold text-foreground">
            <Link href={`/loja/${product.category.slug}/${product.slug}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{product.category.name}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-lg font-bold text-foreground">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
          </p>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Comprar
          </Button>
        </div>
      </div>
    </div>
  );
}
