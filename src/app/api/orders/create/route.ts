import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabaseAuth = await createServerSupabaseClient(cookieStore);
  
  // 1. Obter o usuário da sessão
  const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();

  if (userError || !user) {
    console.error('ERRO: Usuário não autenticado:', userError);
    return NextResponse.json({ success: false, error: 'Usuário não autenticado' }, { status: 401 });
  }

  console.log('Usuário autenticado:', user.id, user.email);

  try {
    const {
      customerData,
      cartItems,
      paymentData,
      shippingCost,
      subtotal,
      total
    } = await request.json();
    
    console.log('Dados recebidos:', { 
      customerData: customerData ? 'OK' : 'MISSING', 
      cartItems: cartItems?.length || 0, 
      paymentData: paymentData ? 'OK' : 'MISSING', 
      shippingCost: shippingCost, 
      shippingCostType: typeof shippingCost,
      shippingCostParsed: typeof shippingCost === 'object' ? shippingCost.cost : shippingCost,
      subtotal, 
      total,
      subtotalType: typeof subtotal,
      totalType: typeof total,
      cartItemsDetails: cartItems?.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      }))
    });

    if (!customerData || !cartItems || !paymentData) {
      return NextResponse.json(
        { success: false, error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Usar service role para bypasser RLS que tem dependência do user_role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Usar apenas a tabela profiles (sem duplicação em store_customers)
    // O cliente já foi criado na tabela profiles pelo trigger quando se registrou
    const customerId = user.id; // Usar diretamente o ID do usuário autenticado

    // Gerar ID único para o pedido
    const orderId = `SITE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Criar pedido na tabela orders do SYS (integração total)
    // Preços já estão em reais (padronizado)
    const totalAmount = parseFloat(total) || 0;
    
    console.log('DEBUG VALORES:', {
      totalOriginal: total,
      totalInReais: totalAmount,
      totalType: typeof total,
      totalAmountType: typeof totalAmount,
      subtotalOriginal: subtotal,
      subtotalParsed: parseFloat(subtotal) || 0,
      conversionNote: 'Preços em reais (padronizado)'
    });

    const orderData = {
      id: orderId,
      customer_name: customerData.name,
      customer_email: customerData.email,
      customer_phone: customerData.phone,
      customer_cpf: customerData.cpf,
      customer_address: `${customerData.address || ''} ${customerData.number || ''}`.trim(),
      customer_city: customerData.city,
      customer_state: customerData.state,
      customer_zip: customerData.cep,
      notes: `Pedido da loja - Cliente: ${customerId}`,
      total_amount: totalAmount
    };

    console.log('Dados do pedido que será inserido:', orderData);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('ERRO ao criar pedido:', orderError);
      return NextResponse.json(
        { success: false, error: `Erro ao criar pedido: ${orderError.message}` },
        { status: 500 }
      );
    }

    // Criar itens do pedido na tabela order_items do SYS
    // Preços já estão em reais (padronizado)
    const orderItems = cartItems.map((item: any) => ({
      order_id: orderId,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price || 0
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Erro ao criar itens do pedido:', itemsError);
      // Não falhar o pedido por causa dos itens, mas logar o erro
    }

    // Integração automática: pedido já está na tabela orders do SYS
    console.log('Pedido criado com sucesso na tabela orders do SYS:', orderId);

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        status: 'PENDENTE',
        total: total,
        items: orderItems
      }
    });

  } catch (error: any) {
    console.error('ERRO CRÍTICO na API de criar pedido:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { success: false, error: `Erro interno do servidor: ${error.message}` },
      { status: 500 }
    );
  }
}
