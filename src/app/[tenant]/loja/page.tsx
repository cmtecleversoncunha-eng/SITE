import { getProducts } from '@/lib/data';
import { ProductCard } from '@/components/ProductCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Loja',
  description: 'Explore nossa coleção completa de zarabatanas, flechas, e acessórios.',
};

export default async function ShopPage({ params }: { params: { tenant: string } }) {
  const tenantId = params.tenant;
  const products = await getProducts(tenantId);

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground sm:text-4xl mb-8">
        Todos os Produtos
      </h1>
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {products && products.length > 0 ? products.map((product) => (
          <ProductCard key={product.id} product={product} />
        )) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Nenhum produto encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
