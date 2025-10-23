'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BlogPostsClient } from './blog-posts-client';

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

interface BlogSectionProps {
  count?: number;
  showAll?: boolean;
  showTitle?: boolean;
  title?: string;
  subtitle?: string;
}

export function BlogSection({ count = 3, showAll = false, showTitle = true, title = "Do Nosso Blog", subtitle }: BlogSectionProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        
        const supabase = createClient();
        const { data, error } = await supabase
          .from('store_blog_posts')
          .select(`
            id,
            title,
            slug,
            published_at,
            excerpt,
            content,
            featured_image,
            blog_categories(name, slug, color)
          `)
          .order('published_at', { ascending: false });

        if (error) {
          console.error('Erro ao carregar posts:', error);
          setPosts([]);
        } else {
          const publishedPosts = (data || [])
            .map((post: any) => ({
              id: post.id,
              title: post.title,
              slug: post.slug,
              date: post.published_at,
              excerpt: post.excerpt,
              content: post.content,
              image: post.featured_image,
              category: post.blog_categories?.name || 'Sem categoria'
            }));

          const finalPosts = showAll ? publishedPosts : publishedPosts.slice(0, count);
          setPosts(finalPosts);
          console.log('Posts carregados do Supabase:', finalPosts.length);
        }
      } catch (error) {
        console.error('Erro ao carregar posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [count, showAll]);

  // Se está carregando ou não há posts, não mostra nada
  if (loading || posts.length === 0) {
    return null;
  }

  // Se showTitle é false, retorna apenas os posts sem a seção
  if (!showTitle) {
    return <BlogPostsClient count={count} showAll={showAll} />;
  }

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-center font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-lg leading-8 text-muted-foreground text-center">
            {subtitle}
          </p>
        )}
        <div className="mt-12">
          <BlogPostsClient count={count} showAll={showAll} />
        </div>
      </div>
    </section>
  );
}
