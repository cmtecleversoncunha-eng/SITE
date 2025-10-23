import { getProductsByCategory, getCategoryBySlug } from '@/lib/data';
import { ProductCard } from '@/components/ProductCard';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ tenant: string; category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, category } = await params;
  const categoryData = await getCategoryBySlug(tenant, category);
  if (!categoryData) {
    return {};
  }
  return {
    title: categoryData.name,
    description: `Encontre os melhores produtos na categoria ${categoryData.name}.`,
  };
}


export default async function CategoryPage({ params }: { params: Promise<{ tenant: string; category: string }> }) {
  const { tenant, category } = await params;
  const categoryData = await getCategoryBySlug(tenant, category);
  const products = await getProductsByCategory(tenant, category);

  if (!categoryData) {
    notFound();
  }

  return (
     <div>
      <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground sm:text-4xl mb-8">
        {categoryData.name}
      </h1>
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum produto encontrado nesta categoria.</p>
        </div>
      )}
    </div>
  );
}
