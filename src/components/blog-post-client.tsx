'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
}

interface BlogPostClientProps {
  slug: string;
}

export function BlogPostClient({ slug }: BlogPostClientProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        
        const supabase = createClient();
        const { data, error } = await supabase
          .from('store_blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'PUBLISHED')
          .single();

        if (error || !data) {
          console.error('Erro ao carregar post:', error);
          setNotFound(true);
        } else {
          const postData = {
            id: data.id,
            title: data.title,
            slug: data.slug,
            date: data.created_at,
            excerpt: data.excerpt,
            content: data.content,
            image: data.featured_image,
            category: data.category
          };
          setPost(postData);
          console.log('Post carregado do Supabase:', postData.title);
        }
      } catch (error) {
        console.error('Erro ao carregar post:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        </div>
        <div className="aspect-[16/9] w-full rounded-2xl bg-gray-200 mb-8"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Post não encontrado</h1>
        <p className="text-muted-foreground mb-8">
          O post que você está procurando não existe ou não foi publicado.
        </p>
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o blog
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o blog
        </Link>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric' 
            })}
          </time>
          {post.category && (
            <>
              <span>•</span>
              <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs">
                {post.category}
              </span>
            </>
          )}
        </div>
        
        <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground mb-4">
          {post.title}
        </h1>
        
        {post.excerpt && (
          <p className="text-xl text-muted-foreground leading-relaxed">
            {post.excerpt}
          </p>
        )}
      </header>

      {/* Featured Image */}
      {post.image && (
        <div className="mb-8">
          <Image
            src={post.image}
            alt={post.title}
            width={800}
            height={450}
            className="w-full aspect-[16/9] rounded-2xl object-cover"
            priority
          />
        </div>
      )}

      {/* Content */}
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
