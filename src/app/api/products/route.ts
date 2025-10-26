import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - Listar produtos
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro inesperado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar produto
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { name, slug, price, description, image, categoryId, weight, dimensions, featured } = body;

    // Validar campos obrigatórios
    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: name, price, categoryId' },
        { status: 400 }
      );
    }

    // Criar produto
    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        price,
        description,
        image_url: image || null,
        category_id: categoryId,
        weight: weight || 0.3,
        dimensions: dimensions || '20x15x10',
        status: 'ACTIVE'
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar produto:', error);
      return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro inesperado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar produto
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { id, name, slug, price, description, image, categoryId, weight, dimensions, featured } = body;

    console.log('🔍 Atualizando produto:', { id, image });

    if (!id) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 });
    }

    // Construir objeto de atualização apenas com campos fornecidos
    const updateData: any = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug || name?.toLowerCase().replace(/\s+/g, '-');
    if (price !== undefined) updateData.price = price;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image_url = image || null;
    if (categoryId) updateData.category_id = categoryId;
    if (weight !== undefined) updateData.weight = weight;
    if (dimensions !== undefined) updateData.dimensions = dimensions;

    console.log('📝 Dados para atualização:', updateData);

    // Atualizar produto
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar produto:', error);
      return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro inesperado:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
