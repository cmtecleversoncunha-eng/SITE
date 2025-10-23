import { createClient } from '@/lib/supabase/server'; // Importar o novo cliente de servidor
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient as createServiceRoleClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('API /account/orders: Acesso não autorizado.', userError);
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const userId = user.id;

  // Usar service role para buscar pedidos, bypassando RLS com segurança no servidor
  const supabaseService = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Buscar pedidos do usuário na tabela orders do SYS
    const { data: orders, error } = await supabaseService
      .from('orders')
      .select('*, order_items (*)')
      .eq('customer_email', user.email) // Buscar por email do usuário
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar pedidos na API:', error);
      return NextResponse.json({ error: 'Erro ao buscar pedidos' }, { status: 500 });
    }

        // Valores já estão em reais (padronizado)
        const ordersWithCorrectValues = (orders || []).map(order => ({
          ...order,
          total_amount: order.total_amount || 0, // Já em reais
          order_items: (order.order_items || []).map(item => ({
            ...item,
            unit_price: item.unit_price || 0, // Já em reais
            total_price: item.total_price || 0 // Já em reais
          }))
        }));

    return NextResponse.json(ordersWithCorrectValues);
  } catch (error) {
    console.error('Erro inesperado na API de pedidos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
