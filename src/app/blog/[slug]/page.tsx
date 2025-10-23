import { getBlogPostBySlug, getLatestBlogPosts } from '@/lib/data';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Clock, Tag } from 'lucide-react';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post não encontrado',
    };
  }

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    keywords: post.seo_keywords?.join(', '),
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getLatestBlogPosts(3);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
              <nav className="mb-8">
                <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <li><Link href="/" className="hover:text-foreground transition-colors text-muted-foreground">Home</Link></li>
                  <li>/</li>
                  <li><Link href="/blog" className="hover:text-foreground transition-colors text-muted-foreground">Blog</Link></li>
                  <li>/</li>
                  <li className="text-foreground font-medium">{post.title}</li>
                </ol>
              </nav>

          {/* Post Header */}
          <header className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <span 
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: post.category_color }}
              >
                {post.category}
              </span>
              {post.featured && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  Destaque
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{new Date(post.date).toLocaleDateString('pt-BR')}</span>
              </div>
              {post.reading_time && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{post.reading_time} min de leitura</span>
                </div>
              )}
            </div>

            {post.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Featured Image */}
          {post.image && (
            <div className="mb-8">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Post Content */}
          <article className="bg-card p-8 rounded-lg shadow-sm mb-8">
            <div 
              className="prose prose-lg max-w-none prose-headings:font-headline prose-headings:font-bold prose-headings:text-foreground prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-foreground prose-p:leading-relaxed prose-p:text-base prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-strong:font-semibold prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-li:leading-relaxed prose-blockquote:text-foreground prose-blockquote:border-primary prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:text-foreground"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="bg-card p-6 rounded-lg shadow-sm mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Tags:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="bg-card p-8 rounded-lg shadow-sm mb-8">
                  <h2 className="text-2xl font-bold font-headline mb-6 text-foreground">Posts Relacionados</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="group block"
                  >
                    <article className="bg-background rounded-lg border border-input overflow-hidden hover:shadow-md transition-shadow">
                      {relatedPost.image && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={relatedPost.image}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span 
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: relatedPost.category_color }}
                          >
                            {relatedPost.category}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(relatedPost.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                              {relatedPost.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {relatedPost.excerpt}
                            </p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back to Blog */}
          <div className="bg-card p-6 rounded-lg shadow-sm">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  ← Voltar ao Blog
                </Link>
          </div>
        </div>
      </div>
    </div>
  );
}