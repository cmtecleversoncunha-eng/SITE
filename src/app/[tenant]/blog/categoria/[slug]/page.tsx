import { getBlogPostsByCategory, getBlogCategories } from '@/lib/data';
import { notFound } from 'next/navigation';
import { BlogPostsClient } from '@/components/blog-posts-client';
import Link from 'next/link';
import { ArrowLeft, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getBlogCategories();
  const category = categories.find(cat => cat.slug === slug);

  if (!category) {
    return {
      title: 'Categoria não encontrada',
      description: 'A categoria solicitada não foi encontrada.',
    };
  }

  return {
    title: `${category.name} - Blog da Loja`,
    description: category.description || `Posts sobre ${category.name} no blog da loja`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [posts, categories] = await Promise.all([
    getBlogPostsByCategory(slug),
    getBlogCategories()
  ]);

  const category = categories.find(cat => cat.slug === slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/blog" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Blog
            </Link>
          </Button>
        </div>

        {/* Header da Categoria */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: category.color }}
            >
              <Tag className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground">
              {category.name}
            </h1>
          </div>
          
          {category.description && (
            <p className="text-lg text-muted-foreground">
              {category.description}
            </p>
          )}
        </header>

        {/* Posts da Categoria */}
        {posts.length > 0 ? (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {posts.length} {posts.length === 1 ? 'post encontrado' : 'posts encontrados'}
              </h2>
            </div>
            <BlogPostsClient posts={posts} />
          </section>
        ) : (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhum post encontrado</h2>
            <p className="text-muted-foreground mb-6">
              Ainda não há posts publicados nesta categoria.
            </p>
            <Button asChild>
              <Link href="/blog">Ver todos os posts</Link>
            </Button>
          </div>
        )}

        {/* Outras Categorias */}
        {categories.length > 1 && (
          <section className="border-t pt-8 mt-12">
            <h2 className="text-2xl font-bold font-headline mb-6">Outras Categorias</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories
                .filter(cat => cat.slug !== slug)
                .map((otherCategory) => (
                  <Link
                    key={otherCategory.id}
                    href={`/blog/categoria/${otherCategory.slug}`}
                    className="group relative overflow-hidden rounded-lg border bg-card p-4 text-center transition-all hover:shadow-md hover:scale-105"
                  >
                    <div 
                      className="w-8 h-8 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: otherCategory.color }}
                    />
                    <h3 className="font-medium text-sm group-hover:text-accent transition-colors">
                      {otherCategory.name}
                    </h3>
                  </Link>
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
