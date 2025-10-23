'use client';

import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/data';

interface AddToCartButtonProps {
  product: Product;
  className?: string;
}

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
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
    <Button 
      className={className}
      onClick={handleAddToCart}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      Adicionar ao Carrinho
    </Button>
  );
}
