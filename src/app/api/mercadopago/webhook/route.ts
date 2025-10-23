import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verificar assinatura do webhook (segurança)
    const signature = request.headers.get('x-signature');
    const requestId = request.headers.get('x-request-id');
    
    console.log('Webhook recebido:', {
      type: body.type,
      action: body.action,
      signature,
      requestId
    });

    // Processar diferentes tipos de notificação
    if (body.type === 'payment') {
      await handlePaymentNotification(body);
    } else if (body.type === 'merchant_order') {
      await handleMerchantOrderNotification(body);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processado com sucesso' 
    });

  } catch (error: any) {
    console.error('Erro no webhook:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function handlePaymentNotification(body: any) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  
  try {
    const paymentId = body.data?.id;
    
    if (!paymentId) {
      throw new Error('Payment ID não encontrado');
    }

    // Aqui você faria uma chamada para a API do Mercado Pago para obter detalhes do pagamento
    // const paymentDetails = await mercadopago.payment.findById(paymentId);
    
    // Por enquanto, simular dados do pagamento
    const paymentDetails = {
      id: paymentId,
      status: 'approved', // pode ser: pending, approved, rejected, cancelled
      status_detail: 'accredited',
      transaction_amount: 199.90,
      external_reference: 'SITE-' + Date.now(), // ID do pedido na sua loja
      payer: {
        email: 'cliente@email.com'
      }
    };

    // Atualizar status do pedido baseado no pagamento
    await updateOrderStatus(supabase, paymentDetails);
    
    // Log da atividade
    await supabase.from('activity_logs').insert({
      activity_type: 'SITE_ORDER_UPDATED',
      description: `Pagamento ${paymentDetails.status} para pedido ${paymentDetails.external_reference}`,
      metadata: {
        payment_id: paymentId,
        status: paymentDetails.status,
        amount: paymentDetails.transaction_amount
      },
      system: 'SITE'
    });

    console.log('Pagamento processado:', paymentDetails);
    
  } catch (error) {
    console.error('Erro ao processar notificação de pagamento:', error);
    throw error;
  }
}

async function handleMerchantOrderNotification(body: any) {
  console.log('Notificação de merchant order recebida:', body);
  // Implementar lógica para merchant orders se necessário
}

async function updateOrderStatus(supabase: any, paymentDetails: any) {
  const orderId = paymentDetails.external_reference;
  
  if (!orderId) {
    throw new Error('External reference (Order ID) não encontrado');
  }

  let orderStatus;
  
  switch (paymentDetails.status) {
    case 'approved':
      orderStatus = 'ENVIADO'; // Pagamento aprovado, pode processar envio
      break;
    case 'pending':
      orderStatus = 'PENDENTE'; // Aguardando pagamento
      break;
    case 'rejected':
    case 'cancelled':
      orderStatus = 'CANCELADO';
      break;
    default:
      orderStatus = 'PENDENTE';
  }

  // Atualizar pedido na tabela orders (compartilhada com o painel SYS)
  const { error } = await supabase
    .from('orders')
    .update({
      status: orderStatus,
      updated_at: new Date().toISOString(),
      notes: `Pagamento ${paymentDetails.status} - MP ID: ${paymentDetails.id}`
    })
    .eq('id', orderId);

  if (error) {
    throw new Error(`Erro ao atualizar pedido: ${error.message}`);
  }

  console.log(`Pedido ${orderId} atualizado para status: ${orderStatus}`);
}

// Endpoint GET para verificar se o webhook está funcionando
export async function GET() {
  return NextResponse.json({
    status: 'Webhook Mercado Pago ativo',
    timestamp: new Date().toISOString(),
    endpoints: {
      webhook_url: '/api/mercadopago/webhook',
      supported_events: ['payment', 'merchant_order']
    }
  });
}
