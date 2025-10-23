import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { melhorEnvioClient } from '@/lib/melhor-envio/client';
import { MelhorEnvioProduct } from '@/types/melhor-envio';

// Cliente Supabase para API routes
const getSupabaseClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Cache em memória (5 minutos)
const shippingCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Rate limit simples (por IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 10; // 10 requisições por minuto

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Muitas requisições. Aguarde um momento e tente novamente.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { zipCode, cartItems } = body;

    // Validar CEP
    if (!zipCode || !await melhorEnvioClient.validateZipCode(zipCode)) {
      return NextResponse.json(
        { error: 'CEP inválido. Digite um CEP válido no formato 00000-000' },
        { status: 400 }
      );
    }

    // Validar itens do carrinho
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Carrinho vazio' },
        { status: 400 }
      );
    }

    console.log('🚚 Calculando frete para CEP:', zipCode);
    console.log('📦 Itens do carrinho:', cartItems.length);

    // Verificar cache
    const cacheKey = `${zipCode}-${JSON.stringify(cartItems.map((i: any) => ({ id: i.productId, qty: i.quantity })))}`;
    const cached = shippingCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('✨ Retornando do cache');
      return NextResponse.json(cached.data);
    }

    // Buscar produtos reais no Supabase
    console.log('🔗 Criando cliente Supabase...');
    const supabase = getSupabaseClient();
    console.log('✅ Cliente criado:', typeof supabase, supabase.constructor.name);
    
    const productIds = cartItems.map((item: any) => item.productId);
    console.log('🔍 Buscando produtos:', productIds);
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, weight, dimensions')
      .in('id', productIds);

    if (productsError || !products) {
      console.error('❌ Erro ao buscar produtos:', productsError);
      throw new Error('Erro ao buscar produtos: ' + (productsError?.message || 'produtos não encontrados'));
    }

    console.log('📦 Produtos encontrados:', products.length);

    // Converter produtos para formato do Melhor Envio
    const melhorEnvioProducts: MelhorEnvioProduct[] = [];
    
    for (const cartItem of cartItems) {
      const product = products.find(p => p.id === cartItem.productId);
      if (!product) {
        throw new Error(`Produto ${cartItem.productId} não encontrado`);
      }

      console.log(`🔧 Convertendo produto ${product.id}:`, { weight: product.weight, dimensions: product.dimensions });

      try {
        const converted = melhorEnvioClient.convertProduct({
          id: product.id,
          weight: product.weight,
          dimensions: product.dimensions,
          quantity: cartItem.quantity
        });
        melhorEnvioProducts.push(converted);
      } catch (conversionError: any) {
        console.error(`❌ Erro ao converter produto ${product.id}:`, conversionError.message);
        throw new Error(`Produto "${product.name}" está sem peso ou dimensões. Configure no admin antes de calcular o frete.`);
      }
    }

    console.log('📦 Produtos convertidos:', melhorEnvioProducts);

    // Usar API real ou mock conforme ambiente
    const useMockData = !process.env.MELHOR_ENVIO_TOKEN || process.env.MELHOR_ENVIO_USE_MOCK === 'true';

    let formattedOptions;

    if (useMockData) {
      console.log('🧪 Usando dados mockados (MELHOR_ENVIO_TOKEN não configurado)');
      
      // Mock baseado no peso total
      const totalWeight = cartItems.reduce((total: number, cartItem: any) => {
        const product = products.find(p => p.id === cartItem.productId);
        return total + (product ? (product.weight || 0) * cartItem.quantity : 0);
      }, 0);

      console.log('⚖️ Peso total:', totalWeight, 'kg');
      
      const basePrice = totalWeight <= 0.1 ? 1200 : totalWeight <= 1 ? 1800 : totalWeight <= 5 ? 2500 : 4500;
      
      formattedOptions = [
        {
          id: 'correios-pac',
          name: 'PAC',
          company: 'Correios',
          companyId: 1,
          price: basePrice,
          originalPrice: basePrice,
          deliveryTime: totalWeight <= 1 ? 4 : 6,
          deliveryRange: { min: 3, max: 7 },
          isCheapest: true,
          logo: '',
          currency: 'BRL'
        },
        {
          id: 'correios-sedex',
          name: 'SEDEX',
          company: 'Correios',
          companyId: 1,
          price: Math.round(basePrice * 1.8),
          originalPrice: Math.round(basePrice * 1.8),
          deliveryTime: totalWeight <= 1 ? 2 : 4,
          deliveryRange: { min: 1, max: 5 },
          isCheapest: false,
          logo: '',
          currency: 'BRL'
        },
        {
          id: 'jadlog-package',
          name: 'Package',
          company: 'Jadlog',
          companyId: 2,
          price: Math.round(basePrice * 1.4),
          originalPrice: Math.round(basePrice * 1.4),
          deliveryTime: totalWeight <= 1 ? 3 : 5,
          deliveryRange: { min: 2, max: 6 },
          isCheapest: false,
          logo: '',
          currency: 'BRL'
        }
      ];
    } else {
      // Chamar API real do Melhor Envio
      console.log('📞 Chamando API real do Melhor Envio');
      
      const shippingResults = await melhorEnvioClient.calculateShipping({
        toZip: zipCode,
        products: melhorEnvioProducts
      });

      // Mapear resposta da API para formato do ShippingCalculator
      formattedOptions = shippingResults.map((result: any, index: number) => ({
        id: `${result.company.name.toLowerCase()}-${result.name.toLowerCase().replace(/\s/g, '-')}`,
        name: result.name,
        company: result.company.name,
        companyId: result.company.id,
        price: Math.round(result.final_price * 100), // Converter para centavos
        originalPrice: Math.round(result.price * 100),
        deliveryTime: result.delivery_time,
        deliveryRange: { 
          min: Math.max(result.delivery_time - 2, 1), 
          max: result.delivery_time + 2 
        },
        isCheapest: index === 0,
        logo: result.company.picture || '',
        currency: result.currency
      }));
    }

    console.log(`✅ Frete calculado: ${formattedOptions.length} opções`);

    const response = {
      success: true,
      options: formattedOptions,
      fromZip: process.env.MELHOR_ENVIO_FROM_ZIP,
      toZip: zipCode
    };

    // Armazenar no cache
    shippingCache.set(cacheKey, { data: response, timestamp: Date.now() });

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Erro ao calcular frete:', error);
    console.error('Stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: error.message || 'Erro interno ao calcular frete',
        details: error.toString(),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Endpoint para validar CEP
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zipCode = searchParams.get('zipCode');

    if (!zipCode) {
      return NextResponse.json(
        { error: 'CEP é obrigatório' },
        { status: 400 }
      );
    }

    const isValid = await melhorEnvioClient.validateZipCode(zipCode);
    
    return NextResponse.json({
      valid: isValid,
      zipCode: zipCode.replace(/\D/g, '')
    });

  } catch (error: any) {
    console.error('❌ Erro ao validar CEP:', error);
    
    return NextResponse.json(
      { error: 'Erro ao validar CEP' },
      { status: 500 }
    );
  }
}