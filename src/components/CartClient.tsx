'use client';

import { useCart } from '@/hooks/useCart';
import { Button } from './ui/button';
import { Trash2, Plus, Minus, ShoppingCart, LogIn, UserPlus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

export function CartClient() {
  const { cart, removeFromCart, updateQuantity, subtotal, total, clearCart, shipping } = useCart();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Verificar autenticação
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    checkUser();

    // Escutar mudanças de autenticação
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleClearCart = () => {
    clearCart();
    toast({
      title: 'Carrinho limpo!',
      description: 'Todos os produtos foram removidos do seu carrinho.',
    });
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
          <ShoppingCart className="w-16 h-16 text-primary-foreground" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Seu carrinho está vazio</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg max-w-md mx-auto">
          Adicione alguns produtos incríveis para começar sua jornada de compras na ZARK.
        </p>
        <Link href="/loja">
          <Button className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold px-8 py-3 rounded-lg text-lg shadow-lg hover:shadow-xl transition-transform duration-200 transform hover:scale-105">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Continuar Comprando
          </Button>
        </Link>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    // Redirecionar para a página de checkout
    window.location.href = '/checkout';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Lista de Produtos */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Seu Carrinho ({cart.length} itens)</h2>
          <Button variant="outline" onClick={handleClearCart}>
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Carrinho
          </Button>
        </div>
        {cart.map((item) => (
          <div key={item.id} className="flex items-center space-x-6 p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center overflow-hidden">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={96}
                  height={96}
                  className="object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{item.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{item.category.name}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="w-10 h-10 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary/10"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-semibold text-slate-900 dark:text-white text-lg">{item.quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-10 h-10 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary/10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => removeFromCart(item.id)}
              className="w-10 h-10 rounded-full border-2 border-red-300 hover:border-red-500 hover:bg-red-50 dark:border-red-600 dark:hover:border-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>

      {/* Resumo do Pedido */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 h-fit sticky top-24">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Resumo do Pedido</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-4 border-b border-slate-200 dark:border-slate-600">
            <span className="text-slate-600 dark:text-slate-300 font-medium text-lg">Subtotal:</span>
            <span className="text-slate-900 dark:text-white font-bold text-xl">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-4 border-b border-slate-200 dark:border-slate-600">
            <span className="text-slate-600 dark:text-slate-300 font-medium text-lg">Frete:</span>
            <span className="text-slate-900 dark:text-white font-bold text-lg">
              {shipping ? (
                <div className="text-right">
                  <div>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shipping.price / 100)}</div>
                  <div className="text-xs text-slate-500">{shipping.company} - {shipping.deliveryTime} dias</div>
                </div>
              ) : (
                <span className="text-green-600 dark:text-green-400 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Grátis
                </span>
              )}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-6 bg-primary/10 dark:bg-primary/20 rounded-xl px-6">
            <span className="text-slate-900 dark:text-white font-bold text-2xl">Total:</span>
            <span className="text-primary font-bold text-3xl">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
            </span>
          </div>
        </div>
        
        <Button 
          className="w-full mt-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-lg border-0" 
          onClick={handleCheckout}
          disabled={isLoading}
        >
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          {isLoading ? 'Carregando...' : 'Finalizar Compra'}
        </Button>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Compra 100% segura
          </p>
        </div>
      </div>

      {/* Modal de Autenticação */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-slate-900 dark:text-white">
              🔐 Autenticação Necessária
            </DialogTitle>
            <DialogDescription className="text-center text-slate-600 dark:text-slate-400">
              Para finalizar sua compra, você precisa estar logado em sua conta.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-6">
            <Link href="/login" className="w-full">
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                onClick={() => setShowAuthModal(false)}
              >
                <LogIn className="w-5 h-5 mr-2" />
                Fazer Login
              </Button>
            </Link>
            
            <Link href="/register" className="w-full">
              <Button 
                variant="outline"
                className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                onClick={() => setShowAuthModal(false)}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Criar Conta
              </Button>
            </Link>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Após fazer login, você poderá finalizar sua compra com segurança.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
