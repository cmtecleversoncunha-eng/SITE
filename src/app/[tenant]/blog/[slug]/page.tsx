import { getBlogPostBySlug, getLatestBlogPosts } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Clock, Eye, Tag, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';

interface BlogPostPageProps {
  params: Promise<{ tenant: string; slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { tenant, slug } = await params;
  const post = await getBlogPostBySlug(tenant, slug);

  if (!post) {
    return {
      title: 'Post não encontrado',
      description: 'O post solicitado não foi encontrado.',
    };
  }

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    keywords: post.seo_keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : [],
      type: 'article',
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { tenant, slug } = await params;
  const post = await getBlogPostBySlug(tenant, slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getLatestBlogPosts(tenant, 3);

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

        {/* Header do Post */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge 
              variant="outline" 
              style={{ 
                color: post.category_color,
                borderColor: post.category_color 
              }}
            >
              {post.category}
            </Badge>
            {post.featured && (
              <Badge variant="default" className="bg-yellow-600">
                Destaque
              </Badge>
            )}
          </div>

          <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.date).toLocaleDateString('pt-BR')}
            </div>
            {post.reading_time && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.reading_time} min de leitura
              </div>
            )}
            {post.view_count && (
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.view_count} visualizações
              </div>
            )}
          </div>

          <p className="text-xl text-muted-foreground leading-relaxed">
            {post.excerpt}
          </p>
        </header>

        {/* Imagem em Destaque */}
        {post.image && (
          <div className="mb-8">
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200">
              <Image
                src={post.image}
                alt={post.title}
                width={800}
                height={450}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Conteúdo do Post */}
        <article className="prose prose-lg max-w-none mb-12">
          <div 
            className="text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Tags:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Posts Relacionados */}
        {relatedPosts.length > 0 && (
          <section className="border-t pt-8">
            <h2 className="text-2xl font-bold font-headline mb-6">Posts Relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts
                .filter(relatedPost => relatedPost.id !== post.id)
                .slice(0, 3)
                .map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="group block"
                  >
                    <div className="overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md">
                      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-200">
                        <img
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span 
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: relatedPost.category_color }}
                          />
                          <span className="text-sm text-muted-foreground">{relatedPost.category}</span>
                        </div>
                        <h3 className="font-headline font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                          {relatedPost.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{new Date(relatedPost.date).toLocaleDateString('pt-BR')}</span>
                          {relatedPost.reading_time && (
                            <span>{relatedPost.reading_time} min</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}