'use client';

import { useAuth } from '@/context/AuthProvider';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getUserProfile } from '@/lib/account';
import { User, Package, Calendar, CreditCard, MapPin } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  total_price: number;
}

interface UserOrder {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  zark_order_items: OrderItem[];
}

export default function AccountPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    console.log('AccountPage: Auth state:', { user, authLoading });
    if (!authLoading && !user) {
      console.log('AccountPage: Redirecting to login...');
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;
      
      try {
        setOrdersLoading(true);
        console.log('AccountPage: Fetching orders for user:', user.id);
        
        const response = await fetch('/api/account/orders');
        
        if (!response.ok) {
          throw new Error('Falha ao buscar pedidos');
        }

        const orders = await response.json();
        setUserOrders(orders);
        console.log('AccountPage: Orders loaded:', orders);
      } catch (error) {
        console.error('AccountPage: Error loading orders:', error);
        setUserOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    if (user) {
      loadOrders();
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await logout();
      // Não precisa redirecionar aqui, o AuthProvider já faz isso
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'processando':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-700';
      case 'enviado':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-700';
      case 'entregue':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-700';
      case 'cancelado':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minha Conta</h1>
          <p className="text-muted-foreground">Gerencie suas informações e pedidos</p>
        </div>
        <Button 
          onClick={handleLogout} 
          variant="outline"
          disabled={isLoggingOut}
          className="w-full sm:w-auto"
        >
          {isLoggingOut ? 'Saindo...' : 'Sair da Conta'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações da Conta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações da Conta
              </CardTitle>
              <CardDescription>
                Suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-lg">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Tipo de Usuário</label>
                  <p className="text-lg uppercase">{user.role}</p>
                </div>
                {profile?.created_at && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Membro desde</label>
                    <p className="text-sm font-medium">{formatDate(profile.created_at)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pedidos Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Histórico de Pedidos
              </CardTitle>
              <CardDescription>
                Acompanhe seus pedidos realizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-muted-foreground">Carregando pedidos...</span>
                </div>
              ) : userOrders.length > 0 ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userOrders.slice(0, 5).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id.substring(0, 8)}...</TableCell>
                          <TableCell>{new Date(order.created_at).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('border', getStatusVariant(order.status))}>{order.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {userOrders.length > 5 && (
                    <div className="text-center pt-4">
                      <p className="text-sm text-muted-foreground">
                        Mostrando 5 de {userOrders.length} pedidos
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum pedido encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Você ainda não fez nenhum pedido em nossa loja.
                  </p>
                  <Button asChild>
                    <Link href="/loja">
                      Começar a Comprar
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Atalhos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="ghost" className="w-full justify-start h-auto p-3">
                <Link href="/loja" className="flex items-center gap-3">
                  <Package className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Continuar Comprando</div>
                    <div className="text-xs text-muted-foreground">Explorar produtos</div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="ghost" className="w-full justify-start h-auto p-3">
                <Link href="/suporte" className="flex items-center gap-3">
                  <User className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Central de Ajuda</div>
                    <div className="text-xs text-muted-foreground">Suporte e FAQ</div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="ghost" className="w-full justify-start h-auto p-3">
                <Link href="/contato" className="flex items-center gap-3">
                  <MapPin className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Falar Conosco</div>
                    <div className="text-xs text-muted-foreground">Entre em contato</div>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Precisa de Ajuda?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Nossa equipe está pronta para ajudar você com qualquer dúvida.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/contato">
                  Entrar em Contato
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}