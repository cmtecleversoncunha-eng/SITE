'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

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

interface BlogPostsClientProps {
  count?: number;
  showAll?: boolean;
  posts?: BlogPost[];
}

export function BlogPostsClient({ count = 3, showAll = false, posts: initialPosts }: BlogPostsClientProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        if (initialPosts && initialPosts.length > 0) {
          setPosts(showAll ? initialPosts : initialPosts.slice(0, count));
          return;
        }

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
  }, [count, showAll, initialPosts]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[16/9] w-full rounded-2xl bg-gray-200"></div>
            <div className="mt-4 h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="mt-2 h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="mt-2 h-3 bg-gray-200 rounded w-full"></div>
            <div className="mt-2 h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum post encontrado.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-3">
      {posts.map((post) => (
        <article key={post.id} className="flex flex-col items-start justify-between">
          <div className="relative w-full">
            <Image
              src={post.image || 'https://picsum.photos/400/250?random=' + post.id}
              alt={post.title}
              width={400}
              height={250}
              className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
            />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
          </div>
          <div className="max-w-xl">
            <div className="mt-8 flex items-center gap-x-4 text-xs">
              <time dateTime={post.date} className="text-muted-foreground">
                {new Date(post.date).toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </time>
            </div>
            <div className="group relative">
              <h3 className="mt-3 text-lg font-semibold leading-6 text-foreground group-hover:text-muted-foreground font-headline">
                <Link href={`/blog/${post.slug}`}>
                  <span className="absolute inset-0" />
                  {post.title}
                </Link>
              </h3>
              <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {post.excerpt}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
