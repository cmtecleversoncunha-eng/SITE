// Sistema de cache otimizado para performance
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL: number;

  constructor(defaultTTL = 300000) { // 5 minutos padrão
    this.defaultTTL = defaultTTL;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };
    this.cache.set(key, item);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Verificar se expirou
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Limpar itens expirados
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Estatísticas do cache
  stats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instância global do cache
export const cache = new MemoryCache();

// Executar limpeza a cada 10 minutos
if (typeof window === 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 600000);
}

// Helper para cache de funções
export function withCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyFn: (...args: T) => string,
  ttl?: number
) {
  return async (...args: T): Promise<R> => {
    const cacheKey = keyFn(...args);
    
    // Verificar cache primeiro
    const cached = cache.get<R>(cacheKey);
    if (cached !== null) {
      console.log('🎯 Cache hit:', cacheKey);
      return cached;
    }

    // Executar função e cachear resultado
    console.log('🔄 Cache miss, executando:', cacheKey);
    const result = await fn(...args);
    cache.set(cacheKey, result, ttl);
    
    return result;
  };
}

// Cache específico para produtos
export const getCachedProducts = withCache(
  async () => {
    const { createClient } = await import('./supabase/client');
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
  () => 'products:all',
  180000 // 3 minutos
);

// Cache específico para categorias
export const getCachedCategories = withCache(
  async () => {
    const { createClient } = await import('./supabase/client');
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },
  () => 'categories:all',
  300000 // 5 minutos
);

// Cache para posts do blog
export const getCachedBlogPosts = withCache(
  async (limit?: number) => {
    const { createClient } = await import('./supabase/client');
    const supabase = createClient();
    
    let query = supabase
      .from('store_blog_posts')
      .select(`
        *,
        blog_categories (
          id,
          name,
          slug,
          color,
          icon
        )
      `)
      .order('published_at', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },
  (limit) => `blog:posts:${limit || 'all'}`,
  240000 // 4 minutos
);

// Cache para produto específico
export const getCachedProduct = withCache(
  async (slug: string) => {
    const { createClient } = await import('./supabase/client');
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq('status', 'ACTIVE');

    if (error) throw error;
    
    // Encontrar produto pelo slug
    const product = data?.find(p => {
      const productSlug = p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return productSlug === slug;
    });

    return product || null;
  },
  (slug) => `product:${slug}`,
  300000 // 5 minutos
);

// Invalidar cache relacionado
export function invalidateProductCache() {
  cache.delete('products:all');
  console.log('🗑️ Cache de produtos invalidado');
}

export function invalidateCategoryCache() {
  cache.delete('categories:all');
  console.log('🗑️ Cache de categorias invalidado');
}

export function invalidateBlogCache() {
  // Invalidar todos os caches relacionados ao blog
  const keys = cache.stats().keys.filter(key => key.startsWith('blog:'));
  keys.forEach(key => cache.delete(key));
  console.log('🗑️ Cache do blog invalidado');
}

// Helper para cache no lado do servidor
export function getCacheStats() {
  return {
    ...cache.stats(),
    enabled: process.env.NEXT_PUBLIC_ENABLE_CACHE === 'true',
    defaultTTL: cache['defaultTTL']
  };
}
