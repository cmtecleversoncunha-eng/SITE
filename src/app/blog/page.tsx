import { getBlogPosts, getBlogCategories, getFeaturedBlogPosts } from '@/lib/data';
import { BlogPostsClient } from '@/components/blog-posts-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Descubra dicas, técnicas e novidades sobre zarabatanas e tiro esportivo.',
};

export default async function BlogPage() {
  const [posts, categories, featuredPosts] = await Promise.all([
    getBlogPosts(),
    getBlogCategories(),
    getFeaturedBlogPosts(3)
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold font-headline tracking-tight text-foreground mb-6">
              Blog ZARK
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Descubra técnicas, dicas de manutenção, novidades e tudo sobre o mundo das zarabatanas
            </p>
          </div>

          {/* Posts em Destaque */}
          {featuredPosts.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold font-headline text-foreground">Posts em Destaque</h2>
                <div className="w-16 h-1 bg-primary rounded-full"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredPosts.map((post, index) => (
                  <article key={post.id} className={`group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-lg ${index === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}>
                    <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-200">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                              </svg>
                            </div>
                            <p className="text-sm text-muted-foreground">Sem imagem</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span 
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: post.category_color || '#3b82f6' }}
                        />
                        <span className="text-sm text-muted-foreground font-medium">{post.category}</span>
                        {post.featured && (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                            Destaque
                          </span>
                        )}
                      </div>
                      <h3 className="font-headline font-bold text-foreground mb-3 line-clamp-2 text-lg">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                        {post.reading_time && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {post.reading_time} min
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Categorias */}
          {categories.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold font-headline text-foreground">Categorias</h2>
                <div className="w-16 h-1 bg-primary rounded-full"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((category) => (
                  <a
                    key={category.id}
                    href={`/blog/categoria/${category.slug}`}
                    className="group relative overflow-hidden rounded-xl border bg-card p-6 text-center transition-all hover:shadow-lg hover:scale-105 hover:border-primary/20"
                  >
                    <div 
                      className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                      style={{ backgroundColor: category.color || '#3b82f6' }}
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Todos os Posts */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold font-headline text-foreground">Todos os Posts</h2>
              <div className="w-16 h-1 bg-primary rounded-full"></div>
            </div>
            <BlogPostsClient posts={posts} />
          </section>
        </div>
      </div>
    </div>
  );
}
