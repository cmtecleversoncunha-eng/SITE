import { NextRequest, NextResponse } from 'next/server';
const mercadopago = require('mercadopago');
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// Configurar Mercado Pago
if (process.env.MERCADO_PAGO_ACCESS_TOKEN) {
  mercadopago.configure({
    access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, customer, description, card_token_id, order_id } = body;

    if (!amount || !customer || !description) {
      return NextResponse.json({ success: false, error: 'Dados incompletos' }, { status: 400 });
    }

    // Log da tentativa de pagamento
    console.log('Tentativa de pagamento:', {
      amount,
      customer: customer.email,
      description,
      order_id
    });

    // Para desenvolvimento: simulação de pagamento
    if (process.env.NODE_ENV !== 'production') {
      return handleSimulatedPayment(amount, customer, description, order_id);
    }

    // Pagamento real com Mercado Pago
    return await handleRealPayment(amount, customer, description, card_token_id, order_id);
  } catch (error: any) {
    console.error('Erro geral na rota de pagamento:', error);
    return NextResponse.json(
        { 
          success: false, 
          error: error.message || 'Erro interno do servidor' 
        },
        { status: 500 }
      );
  }
}

async function handleSimulatedPayment(amount: number, customer: any, description: string, order_id?: string) {
  console.log('🔄 Processando pagamento simulado...');
  
  // Simular delay de processamento
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simular diferentes cenários baseado no valor
  let status = 'approved';
  let status_detail = 'accredited';
  
  if (amount > 1000) {
    // Valores altos podem ser rejeitados para teste
    status = Math.random() > 0.8 ? 'rejected' : 'approved';
    status_detail = status === 'rejected' ? 'cc_rejected_insufficient_amount' : 'accredited';
  }
  
  const payment = {
    id: `sim_${Date.now()}`,
    status,
    status_detail,
    transaction_amount: amount,
    description,
    date_created: new Date().toISOString(),
    date_approved: status === 'approved' ? new Date().toISOString() : null,
    external_reference: order_id,
    payer: {
      email: customer.email,
      identification: {
        type: 'CPF',
        number: customer.cpf || '12345678901'
      }
    },
    payment_method_id: 'master',
    payment_type_id: 'credit_card'
  };
  
  // Registrar pagamento no banco de dados
  if (order_id) {
    await recordPaymentInDatabase(payment, order_id);
  }
  
  console.log('✅ Pagamento simulado processado:', { status, amount, order_id });
  
  return NextResponse.json({ 
    success: true, 
    payment,
    simulation: true
  });
}

async function handleRealPayment(amount: number, customer: any, description: string, card_token_id: string, order_id?: string) {
  try {
    const payment = await mercadopago.payment.create({
      body: {
        transaction_amount: amount,
        description: description,
        payment_method_id: 'visa', // Detectar do token idealmente
        token: card_token_id,
        external_reference: order_id,
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`,
        payer: {
          email: customer.email,
          first_name: customer.name?.split(' ')[0] || 'Cliente',
          last_name: customer.name?.split(' ').slice(1).join(' ') || 'Cliente',
          identification: {
            type: 'CPF',
            number: customer.cpf || '00000000000'
          }
        },
        installments: 1,
      }
    });

    if (payment && payment.id) {
      // Registrar pagamento no banco
      if (order_id) {
        await recordPaymentInDatabase(payment, order_id);
      }
      
      return NextResponse.json({ 
        success: true, 
        payment: payment.body || payment
      });
    } else {
      throw new Error('Falha ao criar pagamento no Mercado Pago');
    }

  } catch (error: any) {
    console.error('Erro no processamento real do pagamento:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erro no processamento do pagamento' 
      },
      { status: 500 }
    );
  }
}

async function recordPaymentInDatabase(payment: any, order_id: string) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    
    // Atualizar pedido com informações do pagamento
    await supabase
      .from('orders')
      .update({
        notes: `Pagamento MP: ${payment.id} - Status: ${payment.status}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id);
    
    // Log da atividade
    await supabase.from('activity_logs').insert({
      activity_type: 'SITE_ORDER_UPDATED',
      description: `Pagamento ${payment.status} processado para pedido ${order_id}`,
      metadata: {
        payment_id: payment.id,
        status: payment.status,
        amount: payment.transaction_amount,
        simulation: payment.id?.startsWith('sim_') || false
      },
      system: 'SITE'
    });
    
  } catch (error) {
    console.error('Erro ao registrar pagamento no banco:', error);
  }
}
