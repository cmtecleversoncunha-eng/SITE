
import Link from 'next/link';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface FooterProps {
  siteConfig: {
    name?: string;
    description?: string;
    navigation?: { label: string; href: string }[];
    supportLinks?: { label: string; href: string }[];
    socialLinks?: { platform: string; url: string }[];
  };
}

const defaultQuickLinks = [
  { name: 'Home', href: '/' },
  { name: 'Loja', href: '/loja' },
  { name: 'Blog', href: '/blog' },
  { name: 'Sobre Nós', href: '/sobre' },
  { name: 'Contato', href: '/contato' },
];

const defaultPolicyLinks = [
  { name: 'FAQ', href: '/suporte' },
  { name: 'Rastreamento de Pedidos', href: '/suporte' },
  { name: 'Política de Privacidade', href: '/suporte' },
  { name: 'Termos de Serviço', href: '/suporte' },
];

const defaultSocialLinks = [
  { name: 'Facebook', href: '#', icon: <Facebook className="h-6 w-6" /> },
  { name: 'Instagram', href: '#', icon: <Instagram className="h-6 w-6" /> },
  { name: 'YouTube', href: '#', icon: <Youtube className="h-6 w-6" /> },
];

export function Footer({ siteConfig }: FooterProps) {
  const siteName = siteConfig?.name || 'ZARK';
  const siteDescription = siteConfig?.description || 'Precisão que insprava...';
  
  // No futuro, os links virão do siteConfig
  const quickLinks = defaultQuickLinks;
  const policyLinks = defaultPolicyLinks;
  const socialLinks = defaultSocialLinks;

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="font-headline text-2xl font-bold">{siteName}</h3>
            <p className="mt-4 text-sm text-secondary-foreground/80">{siteDescription}</p>
            <div className="mt-6 flex space-x-6">
              {/* Social links virão do config no futuro */}
            </div>
          </div>
          <div>
            <h3 className="font-headline text-sm font-semibold uppercase tracking-wider">Navegação</h3>
            <ul className="mt-4 space-y-2">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-secondary-foreground/80 hover:text-accent">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-headline text-sm font-semibold uppercase tracking-wider">Suporte</h3>
            <ul className="mt-4 space-y-2">
              {policyLinks.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-secondary-foreground/80 hover:text-accent">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2 lg:col-span-1">
             <h3 className="font-headline text-sm font-semibold uppercase tracking-wider">Newsletter</h3>
             <p className="mt-4 text-sm text-secondary-foreground/80">Receba novidades e promoções exclusivas.</p>
             <form className="mt-4 flex flex-col sm:flex-row gap-2">
                <Input type="email" placeholder="Seu e-mail" className="flex-1 bg-background" />
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Inscrever</Button>
             </form>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-secondary-foreground/60">
          <p>&copy; {new Date().getFullYear()} {siteName}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
