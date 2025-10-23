import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Entre em contato conosco. Estamos aqui para ajudar com suas dúvidas, sugestões ou suporte.',
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground sm:text-4xl">Fale Conosco</h1>
        <p className="mt-2 text-lg leading-8 text-muted-foreground">
          Tem alguma dúvida ou sugestão? Preencha o formulário abaixo ou utilize um de nossos canais de atendimento.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-2">
        <form className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first-name">Nome</Label>
              <Input id="first-name" autoComplete="given-name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Sobrenome</Label>
              <Input id="last-name" autoComplete="family-name" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea id="message" rows={4} />
          </div>
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">Enviar Mensagem</Button>
        </form>

        <div className="space-y-8">
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Mail className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold font-headline">Email</h3>
                    <p className="mt-1 text-muted-foreground">
                        Entre em contato por email para dúvidas e suporte.
                    </p>
                    <a href="mailto:contato@zark.com.br" className="mt-2 block text-accent hover:underline">contato@zark.com.br</a>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Phone className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold font-headline">Telefone</h3>
                    <p className="mt-1 text-muted-foreground">
                        Nosso time de atendimento está disponível em horário comercial.
                    </p>
                    <a href="tel:+5511999998888" className="mt-2 block text-accent hover:underline">(11) 99999-8888</a>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <MapPin className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold font-headline">Endereço</h3>
                    <p className="mt-1 text-muted-foreground">
                        Nossa sede administrativa (não aberta ao público).
                    </p>
                    <p className="mt-2 text-accent">São Paulo, SP - Brasil</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
