'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { type Product, type Category } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  slug: z.string().min(3, 'O slug deve ter pelo menos 3 caracteres.'),
  price: z.coerce.number().min(0, 'O preço não pode ser negativo.'),
  description: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres.'),
  image: z.string().url('A imagem deve ser uma URL válida.'),
  featured: z.boolean(),
  categoryId: z.coerce.number(),
  weight: z.coerce.number().min(0.01, 'O peso deve ser maior que 0.'),
  dimensions: z.string().min(5, 'As dimensões devem estar no formato LxAxC (ex: 20x15x10).'),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: Product;
  categories: Category[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      slug: product?.slug || '',
      price: product?.price || 0,
      description: product?.description || '',
      image: product?.image || '',
      featured: product?.featured || false,
      categoryId: product?.category.id || categories[0]?.id,
      weight: product?.weight || 0.3,
      dimensions: product?.dimensions || '20x15x10',
    },
  });

  function onSubmit(values: FormValues) {
    console.log(values);
    // Aqui seria a lógica para salvar no banco de dados
    toast({
      title: `Produto ${product ? 'Atualizado' : 'Criado'}!`,
      description: `O produto "${values.name}" foi salvo com sucesso.`,
    });
    router.push('/admin/produtos');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Produto</FormLabel>
              <FormControl>
                <Input placeholder="Zarabatana X-Pro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="zarabatana-zark-x-pro" {...field} />
              </FormControl>
               <FormDescription>
                Identificador único na URL (ex: /loja/categoria/slug-do-produto).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea rows={5} placeholder="Descreva o produto..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
               <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem</FormLabel>
              <FormControl>
                <Input placeholder="https://picsum.photos/seed/product/400/400" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.3" {...field} />
                </FormControl>
                <FormDescription>
                  Peso do produto em quilogramas
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dimensions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dimensões (cm)</FormLabel>
                <FormControl>
                  <Input placeholder="20x15x10" {...field} />
                </FormControl>
                <FormDescription>
                  Formato: Largura x Altura x Comprimento
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Produto em Destaque
                </FormLabel>
                <FormDescription>
                  Marque para exibir este produto na página inicial.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit">{product ? 'Salvar Alterações' : 'Adicionar Produto'}</Button>
      </form>
    </Form>
  );
}
