
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/context/CartProvider';
import { AuthProvider } from '@/context/AuthProvider';
import { getCompanySettings, getSiteImages } from '@/lib/data';

// Forçar renderização dinâmica para evitar erros de build
export const dynamic = 'force-dynamic';

// A metadata volta a ser mais simples por enquanto
export const metadata: Metadata = {
  title: {
    default: 'Loja Oficial',
    template: '%s | Loja Oficial',
  },
  description: 'Loja especializada em zarabatanas, flechas e acessórios. Precisão que inspira.',
  keywords: ['zarabatana', 'flechas', 'acessórios', 'tiro esportivo'],
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Buscar configurações da empresa (sem multi-tenant)
  const settings = await getCompanySettings();
  const { siteConfig } = settings;
  
  // Buscar imagens do site (logo e favicon)
  const siteImages = await getSiteImages();

  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        {siteImages.favicon && <link rel="icon" href={siteImages.favicon} />}
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased'
        )}
      >
        <AuthProvider>
          <CartProvider>
            <div className="relative flex min-h-dvh flex-col bg-background">
              <Header siteConfig={{...siteConfig, logo: siteImages.logo}} />
              <main className="flex-1">{children}</main>
              <Footer siteConfig={siteConfig} />
            </div>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
