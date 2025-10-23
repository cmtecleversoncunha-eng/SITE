
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateBlogContent, type GenerateBlogContentOutput } from '@/ai/flows/ai-blog-content-generator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Wand2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  topic: z.string().min(5, { message: 'O tópico deve ter pelo menos 5 caracteres.' }),
  keywords: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function BlogContentForm() {
  const [result, setResult] = useState<GenerateBlogContentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      keywords: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const output = await generateBlogContent(values);
      setResult(output);
    } catch (e) {
      setError('Ocorreu um erro ao gerar o conteúdo. Tente novamente.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Gerar Conteúdo</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tópico Principal</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Como escolher a melhor flecha para caça" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Palavras-chave (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: precisão, material, tipo de ponta" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                 <Wand2 className="mr-2 h-4 w-4" />
                {isLoading ? 'Gerando...' : 'Gerar Conteúdo'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
         <div className="space-y-8">
            <Card>
                <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </CardContent>
            </Card>
        </div>
      )}

      {error && <p className="text-destructive">{error}</p>}

      {result && (
        <div className="space-y-8">
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Conteúdo Sugerido</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert">
                <p>{result.suggestedContent}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Parágrafos Gerados</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert">
                <p>{result.generatedParagraphs}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
