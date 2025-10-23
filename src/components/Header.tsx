
'use client';

import Link from 'next/link';
import { Menu, ShoppingCart, X, User as UserIcon, LogOut } from 'lucide-react';
import { useState } from 'react';

import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/context/AuthProvider';

interface HeaderProps {
  siteConfig: {
    name?: string;
    logo?: string;
    navigation?: { label: string; href: string }[];
  };
}

const defaultNavLinks = [
  { name: 'Home', href: '/' },
  { name: 'Loja', href: '/loja' },
  { name: 'Blog', href: '/blog' },
  { name: 'Sobre', href: '/sobre' },
  { name: 'Contato', href: '/contato' },
  { name: 'Suporte', href: '/suporte' },
];

export function Header({ siteConfig }: HeaderProps) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = siteConfig?.navigation || defaultNavLinks;
  const siteName = siteConfig?.name || 'ZARK';
  const logoUrl = siteConfig?.logo;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          {logoUrl ? (
            <img src={logoUrl} alt={`${siteName} logo`} className="h-8 w-auto" />
          ) : (
            <span className="font-headline text-2xl font-bold tracking-wider">{siteName}</span>
          )}
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="transition-colors hover:text-accent focus:text-accent">
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
           <Button asChild variant="ghost" size="icon" className="relative">
            <Link href="/carrinho">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">Carrinho de compras</span>
            </Link>
          </Button>


          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <UserIcon className="h-5 w-5" />
                  <span className="sr-only">Conta de usuário</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/conta" onClick={() => console.log('Clicando em Minha Conta')}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    Minha Conta
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" size="icon">
              <Link href="/login">
                <UserIcon className="h-5 w-5" />
                <span className="sr-only">Fazer login</span>
              </Link>
            </Button>
          )}

          {/* Mobile Navigation */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-background">
              <SheetHeader className="flex justify-between items-center p-4 border-b">
                <SheetTitle asChild>
                  <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                    {logoUrl ? (
                      <img src={logoUrl} alt={`${siteName} logo`} className="h-8 w-auto" />
                    ) : (
                      <span className="font-headline text-2xl font-bold tracking-wider">{siteName}</span>
                    )}
                  </Link>
                </SheetTitle>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-6 w-6"/>
                    <span className="sr-only">Fechar menu</span>
                </Button>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4 p-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-lg font-medium transition-colors hover:text-accent focus:text-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                {user && (
                  <>
                    <Link
                      href="/conta"
                      className="text-lg font-medium transition-colors hover:text-accent focus:text-accent"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Minha Conta
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-lg font-medium transition-colors hover:text-accent focus:text-accent text-red-600 dark:text-red-400"
                    >
                      Sair
                    </button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
