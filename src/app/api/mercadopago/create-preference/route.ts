import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, payer, back_urls, external_reference, notification_url, payment_methods } = body;

    if (!items || !payer || !back_urls) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dados obrigatórios não fornecidos' 
      }, { status: 400 });
    }

    console.log('Criando preferência de pagamento:', {
      items,
      payer: payer.email,
      external_reference
    });

    // Configurar preferência de pagamento
    const preference = {
      items,
      payer,
      back_urls,
      external_reference: external_reference || `ORDER-${Date.now()}`,
      notification_url: notification_url || `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`,
      payment_methods: payment_methods || {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12,
        default_payment_method_id: null,
        default_installments: null
      },
      // Habilitar todos os métodos de pagamento disponíveis
      payment_methods_configuration: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      }
    };

    // Criar preferência usando API REST do Mercado Pago
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erro da API Mercado Pago:', errorData);
      throw new Error(`Erro da API Mercado Pago: ${response.status}`);
    }

    const result = await response.json();

    if (!result.id) {
      throw new Error('Erro ao criar preferência de pagamento');
    }

    console.log('Preferência criada com sucesso:', result.id);

    return NextResponse.json({
      success: true,
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point
    });

  } catch (error: any) {
    console.error('Erro ao criar preferência:', error);
    
    // Em caso de erro, retornar simulação para desenvolvimento
    if (process.env.NODE_ENV !== 'production') {
      console.log('Modo desenvolvimento: simulando criação de preferência');
      return NextResponse.json({
        success: true,
        id: `dev-${Date.now()}`,
        init_point: `${request.nextUrl.origin}/checkout/success?order_id=${external_reference || 'dev'}`,
        sandbox_init_point: `${request.nextUrl.origin}/checkout/success?order_id=${external_reference || 'dev'}`
      });
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}