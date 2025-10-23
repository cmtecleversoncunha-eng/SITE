import { getProductBySlug, getProducts } from '@/lib/data';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { AddToCartButton } from '@/components/AddToCartButton';
import { ProductPageShipping } from '@/components/ProductPageClient';

interface ProductPageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Produto não encontrado',
    };
  }

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { category, slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Buscar produtos relacionados
  const relatedProducts = await getProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imagem do Produto */}
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={600}
              height={600}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-lg">Sem imagem</span>
            </div>
          )}
        </div>

        {/* Informações do Produto */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
            <p className="text-lg text-muted-foreground mt-2">{product.category.name}</p>
          </div>

          <div className="text-3xl font-bold text-foreground">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          <div className="space-y-4">
            <AddToCartButton product={product} className="w-full bg-primary text-primary-foreground hover:bg-primary/90" />
          </div>

          {/* Calculadora de Frete */}
          <ProductPageShipping />

          {/* Benefícios */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-sm">Frete Grátis</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm">Garantia</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className="h-5 w-5 text-primary" />
              <span className="text-sm">Troca Fácil</span>
            </div>
          </div>
        </div>
      </div>

      {/* Produtos Relacionados */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-8">Produtos Relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.slice(0, 3).map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
