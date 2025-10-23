import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, amount, customer, description } = body;

    // Validar dados básicos
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token do cartão inválido' },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valor inválido' },
        { status: 400 }
      );
    }

    if (!customer.email || !customer.name) {
      return NextResponse.json(
        { success: false, error: 'Dados do cliente inválidos' },
        { status: 400 }
      );
    }

    // Integração real com a API do Mercado Pago
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transaction_amount: amount,
        token: token,
        description: description,
        installments: 1,
        payment_method_id: 'master',
        issuer_id: 310,
        payer: {
          email: customer.email,
          identification: {
            type: 'CPF',
            number: '12345678901'
          }
        }
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Erro no processamento do pagamento');
    }
    
    return NextResponse.json({
      success: true,
      payment: result
    });

  } catch (error: any) {
    console.error('Erro no processamento do pagamento:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}
