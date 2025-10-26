# Configuração do Supabase Storage para Imagens

## 1. Configurar o Bucket no Supabase

Execute o script SQL no Supabase SQL Editor:

```sql
-- Criar o bucket para imagens de produtos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir leitura pública das imagens
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Política para permitir upload apenas para usuários autenticados
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir atualização apenas para usuários autenticados
CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir exclusão apenas para usuários autenticados
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);
```

## 2. Variáveis de Ambiente

Certifique-se de que as seguintes variáveis estão configuradas no seu `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 3. Como Usar

1. Acesse o painel de administração: `/admin/produtos/novo`
2. No campo "Imagem do Produto", você pode:
   - **Enviar arquivo**: Clique em "Escolher arquivo" e selecione uma imagem
   - **Inserir URL**: Digite uma URL de imagem existente
3. A imagem será automaticamente salva no Supabase Storage
4. A URL da imagem será salva no banco de dados

## 4. Formatos Aceitos

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- GIF (.gif)

## 5. Limitações

- Tamanho máximo: 5MB por arquivo
- Apenas usuários autenticados podem fazer upload
- As imagens são públicas (acessíveis via URL)

## 6. Solução de Problemas

### Erro: "Bucket não encontrado"
- Execute o script SQL acima no Supabase
- Verifique se o bucket `product-images` foi criado

### Erro: "Acesso negado"
- Verifique se as políticas de storage estão configuradas
- Confirme se o usuário está autenticado

### Erro: "Arquivo muito grande"
- Reduza o tamanho da imagem
- Use ferramentas online para comprimir a imagem

### Imagem não aparece no site
- Verifique se a URL está correta no banco de dados
- Confirme se o bucket está público
- Teste a URL da imagem diretamente no navegador

