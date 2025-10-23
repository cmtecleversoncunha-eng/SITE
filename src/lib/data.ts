
export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  description: string;
  image: string;
  featured: boolean;
  category: Category;
};

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  category_slug?: string;
  category_color?: string;
  tags?: string[];
  reading_time?: number;
  view_count?: number;
  featured?: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
};

export type Order = {
  id: string;
  customerName: string;
  date: string;
  status: 'Processando' | 'Enviado' | 'Entregue' | 'Cancelado';
  total: number;
  items: {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }[];
};


// Dados agora vêm do Supabase - sem dados mock


import { createClient } from './supabase/server'; // Usar o server client aqui
import { cookies } from 'next/headers';

// Definição de tipo para as configurações, para manter a consistência
export type TenantSettings = {
  siteConfig: Record<string, any>;
  homepageConfig: Record<string, any>;
  globalStyles: Record<string, any>;
};

const defaultSettings: TenantSettings = {
  siteConfig: {
    name: 'ZARK',
    description: 'ZARK - Especializada em zarabatanas e acessórios',
    logo: '',
  },
  homepageConfig: {
    hero: {
      title: 'Precisão que Inspira',
      subtitle: 'Descubra o poder e a elegância das zarabatanas.',
      backgroundImage: 'https://picsum.photos/seed/hero/1920/1080',
      buttonText: 'Explorar Produtos',
    },
    featuredProducts: {
      title: 'Produtos em Destaque',
      productIds: [],
    },
     trustBar: {
      enabled: true,
      badges: [
        { text: 'Pagamento Seguro' },
        { text: 'PIX & Mercado Pago' },
        { text: 'Frete Rastreado' },
        { text: 'Suporte BR' },
      ]
    },
    starterKit: {
      enabled: true,
      title: 'Pronto para Começar?',
      subtitle: 'Nosso Kit Iniciante tem tudo o que você precisa...',
      buttonText: 'Conheça o Kit Iniciante',
      image: 'https://picsum.photos/seed/kit/600/400',
    },
    blog: {
      enabled: true,
      title: 'Últimas do Blog',
      postCount: 3,
    },
  },
  globalStyles: {
    primaryColor: '#4f46e5',
    secondaryColor: '#64748b',
  },
};

// Imagens padrão quando não configuradas
export const defaultImages = {
  logo: '', // Texto "ZARK" é usado
  favicon: '/favicon.ico',
  heroBackground: 'https://picsum.photos/seed/hero/1920/1080',
  kitImage: 'https://picsum.photos/seed/kit/600/400',
  aboutImage: 'https://picsum.photos/800/600'
};

export const getSiteImages = async () => {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: settings, error } = await supabase
      .from('store_settings')
      .select('key, value')
      .in('key', ['site_logo', 'site_favicon', 'site_hero_image', 'site_kit_image', 'site_about_image']);

    if (error || !settings) {
      return defaultImages;
    }

    const configMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value || '';
      return acc;
    }, {} as Record<string, string>);

    return {
      logo: configMap.site_logo || defaultImages.logo,
      favicon: configMap.site_favicon || defaultImages.favicon,
      heroBackground: configMap.site_hero_image || defaultImages.heroBackground,
      kitImage: configMap.site_kit_image || defaultImages.kitImage,
      aboutImage: configMap.site_about_image || defaultImages.aboutImage
    };
  } catch (error) {
    console.error('Erro ao buscar imagens do site:', error);
    return defaultImages;
  }
};

export const getKitInicianteSettings = async () => {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: settings, error } = await supabase
      .from('store_settings')
      .select('key, value')
      .in('key', ['kit_title', 'kit_subtitle', 'kit_button_text', 'kit_redirect_url']);

    if (error || !settings) {
      return {
        title: 'Pronto para Começar?',
        subtitle: 'Nosso Kit Iniciante tem tudo o que você precisa...',
        buttonText: 'Conheça o Kit Iniciante',
        redirectUrl: '/loja'
      };
    }

    const configMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value || '';
      return acc;
    }, {} as Record<string, string>);

    return {
      title: configMap.kit_title || 'Pronto para Começar?',
      subtitle: configMap.kit_subtitle || 'Nosso Kit Iniciante tem tudo o que você precisa...',
      buttonText: configMap.kit_button_text || 'Conheça o Kit Iniciante',
      redirectUrl: configMap.kit_redirect_url || '/loja'
    };
  } catch (error) {
    console.error('Erro ao buscar configurações do kit iniciante:', error);
    return {
      title: 'Pronto para Começar?',
      subtitle: 'Nosso Kit Iniciante tem tudo o que você precisa...',
      buttonText: 'Conheça o Kit Iniciante',
      redirectUrl: '/loja'
    };
  }
};

export const getCompanySettings = async (): Promise<TenantSettings> => {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Buscar configurações usando a nova estrutura key-value
    const { data: settings, error } = await supabase
      .from('store_settings')
      .select('key, value, type')
      .in('key', ['site_name', 'site_description', 'theme_primary_color', 'theme_secondary_color']);

    if (error || !settings) {
      console.warn(`Configurações da empresa não encontradas. Usando padrões. Erro:`, error?.message);
      return defaultSettings;
    }

    // Converter array de configurações para objeto
    const configMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      siteConfig: {
        name: configMap.site_name || defaultSettings.siteConfig.name,
        description: configMap.site_description || defaultSettings.siteConfig.description,
        logo: null,
        favicon: null,
        seo: {
          title: configMap.site_name || defaultSettings.siteConfig.name,
          description: configMap.site_description || defaultSettings.siteConfig.description,
          keywords: ['zarabatana', 'flechas', 'acessórios'],
        },
      },
      homepageConfig: defaultSettings.homepageConfig,
      globalStyles: {
        primaryColor: configMap.theme_primary_color || defaultSettings.globalStyles.primaryColor,
        secondaryColor: configMap.theme_secondary_color || defaultSettings.globalStyles.secondaryColor,
      },
    };
  } catch (error) {
    console.error('Erro geral ao buscar configurações da empresa:', error);
    return defaultSettings;
  }
};


// Funções para buscar dados do Supabase
export const getProducts = async () => {
  try {
    const supabase = await createClient();
    
    console.log('🔍 Buscando produtos no site...');
    console.log('🔗 URL Supabase:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    // Teste simples primeiro
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('id, name')
      .limit(1);
    
    console.log('🧪 Teste de conexão:', { testData, testError });
    
    if (testError) {
      console.error('❌ Erro de conexão:', testError);
      return [];
    }
    
    // Buscar produtos da tabela principal do SYS com informações da categoria
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    console.log('📊 Resultado da consulta:', { data, error });

    if (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('⚠️ Nenhum produto encontrado');
      return [];
    }

    console.log(`✅ Encontrados ${data.length} produtos`);

    return data.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      price: product.price,
      description: product.description,
      image: product.image_url,
      featured: false, // Tabela products do SYS não tem campo featured
      category: {
        id: product.categories?.id || product.category_id,
        name: product.categories?.name || 'Categoria',
        slug: (product.categories?.slug
          || (product.categories?.name ? product.categories.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          : 'categoria'))
      },
    }));
  } catch (error) {
    console.error('❌ Erro geral ao buscar produtos:', error);
    return [];
  }
};

export const getProductBySlug = async (slug: string) => {
  try {
    const supabase = await createClient();
    
    // Buscar todos os produtos ativos da tabela principal do SYS
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Encontrar o produto pelo slug
    const product = data.find(p => {
      const productSlug = p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return productSlug === slug;
    });

    if (!product) {
      return null;
    }

    const productSlug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    return {
      id: product.id,
      name: product.name,
      slug: productSlug,
      price: product.price,
      description: product.description,
      image: product.image_url,
      featured: false, // Tabela products do SYS não tem campo featured
      category: product.categories ? {
        ...product.categories,
        slug: (product.categories.slug
          || (product.categories.name ? product.categories.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 'categoria'))
      } : { id: product.category_id, name: 'Categoria', slug: 'categoria' },
    };
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return null;
  }
};

export const getFeaturedProducts = async () => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Erro ao buscar produtos em destaque:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      price: product.price,
      description: product.description,
      image: product.image_url,
      featured: false, // Tabela products do SYS não tem campo featured
      category: product.categories ? {
        ...product.categories,
        slug: (product.categories.slug
          || (product.categories.name ? product.categories.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 'categoria'))
      } : { id: product.category_id, name: 'Categoria', slug: 'categoria' },
    }));
  } catch (error) {
    console.error('Erro ao buscar produtos em destaque:', error);
    return [];
  }
};

export const getProductsByCategory = async (categorySlug: string) => {
  try {
    const supabase = await createClient();
    
    // Primeiro buscar todas as categorias ativas
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (categoryError || !categories || categories.length === 0) {
      console.error('Erro ao buscar categorias:', categoryError);
      return [];
    }

    // Encontrar a categoria pelo slug
    const category = categories.find(c => {
      const categorySlugFromName = c.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return categorySlugFromName === categorySlug;
    });

    if (!category) {
      return [];
    }

    // Buscar produtos da categoria
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('status', 'ACTIVE')
      .eq('category_id', category.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      price: product.price,
      description: product.description,
      image: product.image_url,
      featured: false, // Tabela products do SYS não tem campo featured
      category: product.categories ? {
        ...product.categories,
        slug: (product.categories.slug
          || (product.categories.name ? product.categories.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 'categoria'))
      } : { id: product.category_id, name: 'Categoria', slug: 'categoria' },
    }));
  } catch (error) {
    console.error('Erro ao buscar produtos por categoria:', error);
    return [];
  }
};

export const getCategories = async () => {
  try {
    const supabase = await createClient();
    
    // Buscar categorias da tabela principal do SYS
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Adicionar slug para compatibilidade
    return data.map(category => ({
      ...category,
      slug: category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }));
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
};

export const getCategoryBySlug = async (slug: string) => {
  try {
    const supabase = await createClient();
    
    // Buscar todas as categorias ativas da tabela principal do SYS
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Erro ao buscar categoria:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Encontrar a categoria pelo slug
    const category = data.find(c => {
      const categorySlug = c.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return categorySlug === slug;
    });

    if (!category) {
      return null;
    }

    const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    return {
      ...category,
      slug: categorySlug
    };
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    return null;
  }
};

export const getBlogPosts = async () => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
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

    if (error) {
      console.error('Erro ao buscar posts do blog:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      date: post.published_at || post.created_at,
      excerpt: post.excerpt,
      content: post.content,
      image: post.featured_image,
      category: post.blog_categories?.name || 'Sem categoria',
      category_slug: post.blog_categories?.slug || '',
      category_color: post.blog_categories?.color || '#6366f1',
      tags: post.tags || [],
      reading_time: post.reading_time,
      view_count: post.view_count || 0,
      featured: post.featured || false
    }));
  } catch (error) {
    console.error('Erro ao buscar posts do blog:', error);
    return [];
  }
};

export const getBlogPostBySlug = async (slug: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
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
      .eq('slug', slug)
      .single();

    if (error || !data) {
      console.error('Erro ao buscar post do blog:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      date: data.published_at || data.created_at,
      excerpt: data.excerpt,
      content: data.content,
      image: data.featured_image,
      category: data.blog_categories?.name || 'Sem categoria',
      category_slug: data.blog_categories?.slug || '',
      category_color: data.blog_categories?.color || '#6366f1',
      tags: data.tags || [],
      reading_time: data.reading_time,
      view_count: data.view_count || 0,
      featured: data.featured || false,
      seo_title: data.seo_title,
      seo_description: data.seo_description,
      seo_keywords: data.seo_keywords || []
    };
  } catch (error) {
    console.error('Erro ao buscar post do blog:', error);
    return null;
  }
};

export const getLatestBlogPosts = async (count = 3) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
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
      .order('published_at', { ascending: false })
      .limit(count);

    if (error) {
      console.error('Erro ao buscar posts recentes:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      date: post.published_at || post.created_at,
      excerpt: post.excerpt,
      content: post.content,
      image: post.featured_image,
      category: post.blog_categories?.name || 'Sem categoria',
      category_slug: post.blog_categories?.slug || '',
      category_color: post.blog_categories?.color || '#6366f1',
      tags: post.tags || [],
      reading_time: post.reading_time,
      view_count: post.view_count || 0,
      featured: post.featured || false
    }));
  } catch (error) {
    console.error('Erro ao buscar posts recentes:', error);
    return [];
  }
};

export const getBlogCategories = async () => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Erro ao buscar categorias do blog:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar categorias do blog:', error);
    return [];
  }
};

export const getBlogPostsByCategory = async (categorySlug: string) => {
  try {
    const supabase = await createClient();
    
    // Primeiro buscar a categoria pelo slug
    const { data: category, error: categoryError } = await supabase
      .from('blog_categories')
      .select('id')
      .eq('slug', categorySlug)
      .eq('is_active', true)
      .single();

    if (categoryError || !category) {
      console.error('Erro ao buscar categoria:', categoryError);
      return [];
    }

    // Buscar posts da categoria
    const { data, error } = await supabase
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
      .eq('blog_category_id', category.id)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar posts por categoria:', error);
      return [];
    }

    return data?.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      date: post.published_at || post.created_at,
      excerpt: post.excerpt,
      content: post.content,
      image: post.featured_image,
      category: post.blog_categories?.name || 'Sem categoria',
      category_slug: post.blog_categories?.slug || '',
      category_color: post.blog_categories?.color || '#6366f1',
      tags: post.tags || [],
      reading_time: post.reading_time,
      view_count: post.view_count || 0,
      featured: post.featured || false
    })) || [];
  } catch (error) {
    console.error('Erro ao buscar posts por categoria:', error);
    return [];
  }
};

export const getFeaturedBlogPosts = async (count = 6) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
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
      .eq('featured', true)
      .order('published_at', { ascending: false })
      .limit(count);

    if (error) {
      console.error('Erro ao buscar posts em destaque:', error);
      return [];
    }

    return data?.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      date: post.published_at || post.created_at,
      excerpt: post.excerpt,
      content: post.content,
      image: post.featured_image,
      category: post.blog_categories?.name || 'Sem categoria',
      category_slug: post.blog_categories?.slug || '',
      category_color: post.blog_categories?.color || '#6366f1',
      tags: post.tags || [],
      reading_time: post.reading_time,
      view_count: post.view_count || 0,
      featured: post.featured || false
    })) || [];
  } catch (error) {
    console.error('Erro ao buscar posts em destaque:', error);
    return [];
  }
};

export const getOrders = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('store_orders')
    .select(`
      *,
      store_order_items (
        id,
        product_name,
        quantity,
        unit_price,
        total_price
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar pedidos:', error);
    return [];
  }

  return data?.map(order => ({
    id: order.id,
    customerName: order.customer_name,
    date: order.created_at,
    status: order.status,
    total: order.total_amount,
    items: order.store_order_items?.map(item => ({
      productId: item.id,
      productName: item.product_name,
      quantity: item.quantity,
      price: item.unit_price
    })) || []
  })) || [];
};
