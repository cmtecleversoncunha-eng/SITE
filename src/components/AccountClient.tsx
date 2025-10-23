'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { User, Package, Calendar, DollarSign, LogOut } from 'lucide-react';

interface Order {
  id: string;
  customer_name: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export function AccountClient() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Verificar se o usuário está logado
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);
      
      // Buscar pedidos do usuário
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('id, customer_name, status, total_amount, created_at')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar pedidos:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus pedidos.",
          variant: "destructive",
        });
      } else {
        setOrders(ordersData || []);
      }

      setIsLoading(false);
    };

    checkUser();
  }, [router, toast]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    toast({
      title: "Logout Realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ENVIADO':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'Pendente';
      case 'ENVIADO':
        return 'Enviado';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Informações do Usuário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">{user.user_metadata?.full_name || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">E-mail</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Membro desde</p>
              <p className="font-medium">
                {new Date(user.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Meus Pedidos
          </CardTitle>
          <CardDescription>
            Acompanhe o status dos seus pedidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhum pedido encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Você ainda não fez nenhum pedido.
              </p>
              <Button onClick={() => router.push('/loja')}>
                Fazer Primeira Compra
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Pedido #{order.id.slice(-8)}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }).format(order.total_amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(order.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
