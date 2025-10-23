
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingCart, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { getFeaturedProducts, getCompanySettings } from '@/lib/data';
import { BlogSection } from '@/components/blog-section';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// Página principal da loja (sem multi-tenant)
export default async function Home() {
  // Buscar configurações da empresa
  const settings = await getCompanySettings();
  const { siteConfig, homepageConfig, globalStyles } = settings;

  const featuredProducts = await getFeaturedProducts();
  
  // Buscar configuração do link do kit iniciante
  let starterKitLink = '/loja/kits/kit-iniciante-essencial'; // valor padrão
  
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: starterKitSetting, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'starter_kit_link')
      .single();
    
    if (!error && starterKitSetting?.value) {
      starterKitLink = starterKitSetting.value;
    }
  } catch (error) {
    console.error('Erro ao buscar configuração do kit iniciante:', error);
    // Usar valor padrão em caso de erro
  }

  const trustBadges = homepageConfig.trustBar.badges.map((badge: { text: string }) => ({
    icon: <ShieldCheck className="text-accent" />,
    text: badge.text
  }));

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] w-full">
        <Image
          src={homepageConfig.hero.backgroundImage}
          alt="Imagem de fundo da seção hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-primary-foreground">
          <h1 className="font-headline text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
            {homepageConfig.hero.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl">
            {homepageConfig.hero.subtitle}
          </p>
          <Button asChild size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 font-headline font-bold">
            <Link href="/loja">
              {homepageConfig.hero.buttonText} <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Trust Bar */}
      {homepageConfig.trustBar.enabled && (
        <section className="bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
              {trustBadges.map((badge, index) => (
                <div key={index} className="flex items-center justify-center gap-2 text-center text-sm font-medium text-secondary-foreground">
                  {badge.icon}
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-center font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {homepageConfig.featuredProducts.title}
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {featuredProducts && featuredProducts.length > 0 ? featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            )) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Nenhum produto em destaque encontrado.</p>
              </div>
            )}
          </div>
          <div className="mt-12 text-center">
            <Button asChild variant="outline">
              <Link href="/loja">Ver todos os produtos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Starter Kit Banner */}
      {homepageConfig.starterKit.enabled && (
        <section className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-8 px-6 py-16 md:flex-row">
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                  {homepageConfig.starterKit.title}
                </h2>
                <p className="mt-4 text-lg text-primary-foreground/80">
                  {homepageConfig.starterKit.subtitle}
                </p>
                <Button asChild size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 font-headline font-bold">
                  <Link href={starterKitLink}>
                    {homepageConfig.starterKit.buttonText}
                  </Link>
                </Button>
              </div>
              <div className="flex-1">
                <Image
                  src={homepageConfig.starterKit.image}
                  alt="Banner do kit iniciante"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Blog Posts */}
      {homepageConfig.blog.enabled && (
        <BlogSection 
          title={homepageConfig.blog.title} 
          count={homepageConfig.blog.postCount} 
        />
      )}
    </div>
  );
}
