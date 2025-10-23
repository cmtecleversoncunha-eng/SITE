import { getProducts } from '@/lib/data';
import { ProductCard } from '@/components/ProductCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Loja',
  description: 'Explore nossa coleção completa de zarabatanas, flechas, e acessórios.',
};

export default async function ShopPage() {
  console.log('🛍️ ShopPage: Iniciando busca de produtos...');
  const products = await getProducts();
  console.log('🛍️ ShopPage: Produtos encontrados:', products);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold font-headline tracking-tight text-foreground mb-6">
              ZARK Store
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Explore nossa coleção completa de zarabatanas, flechas e acessórios de alta qualidade
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{products.length}</div>
                <div className="text-sm text-muted-foreground">Produtos Disponíveis</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-sm text-muted-foreground">Garantia de Qualidade</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">24h</div>
                <div className="text-sm text-muted-foreground">Suporte Técnico</div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-card p-6 rounded-xl shadow-sm mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-foreground">Filtros:</h2>
                <select className="px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Todas as Categorias</option>
                  <option>Zarabatanas</option>
                  <option>Flechas</option>
                  <option>Acessórios</option>
                </select>
                <select className="px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Ordenar por</option>
                  <option>Menor Preço</option>
                  <option>Maior Preço</option>
                  <option>Mais Recentes</option>
                </select>
              </div>
              <div className="text-sm text-muted-foreground">
                {products.length} produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground mb-8">Estamos trabalhando para adicionar novos produtos em breve.</p>
              <a 
                href="/contato" 
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Entrar em Contato
              </a>
            </div>
          )}

          {/* Newsletter Section */}
          <div className="mt-16 bg-gradient-to-r from-primary/10 to-primary/5 p-8 rounded-xl">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-foreground mb-4">Receba Novidades</h3>
              <p className="text-muted-foreground mb-6">
                Cadastre-se em nossa newsletter e seja o primeiro a saber sobre novos produtos e promoções.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  className="flex-1 px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                  Inscrever
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
