import { getBlogPosts, getBlogCategories, getFeaturedBlogPosts } from '@/lib/data';
import { BlogPostsClient } from '@/components/blog-posts-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Descubra dicas, técnicas e novidades sobre zarabatanas e tiro esportivo.',
};

export default async function BlogPage({ params }: { params: { tenant: string } }) {
  const tenantId = params.tenant;
  const [posts, categories, featuredPosts] = await Promise.all([
    getBlogPosts(tenantId),
    getBlogCategories(tenantId),
    getFeaturedBlogPosts(tenantId, 3)
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground mb-4">
            Blog da Loja
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubra técnicas, dicas de manutenção, novidades e tudo sobre o mundo das zarabatanas
          </p>
        </div>

        {/* Posts em Destaque */}
        {featuredPosts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold font-headline mb-6">Posts em Destaque</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <div key={post.id} className="group relative overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md">
                  <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-200">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span 
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: post.category_color }}
                      />
                      <span className="text-sm text-muted-foreground">{post.category}</span>
                    </div>
                    <h3 className="font-headline font-semibold text-foreground mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                      {post.reading_time && (
                        <span>{post.reading_time} min de leitura</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Categorias */}
        {categories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold font-headline mb-6">Categorias</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <a
                  key={category.id}
                  href={`/blog/categoria/${category.slug}`}
                  className="group relative overflow-hidden rounded-lg border bg-card p-4 text-center transition-all hover:shadow-md hover:scale-105"
                >
                  <div 
                    className="w-8 h-8 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="font-medium text-sm group-hover:text-accent transition-colors">
                    {category.name}
                  </h3>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Todos os Posts */}
        <section>
          <h2 className="text-2xl font-bold font-headline mb-6">Todos os Posts</h2>
          <BlogPostsClient tenantId={tenantId} posts={posts} />
        </section>
      </div>
    </div>
  );
}