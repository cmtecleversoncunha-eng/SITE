import type { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export const metadata: Metadata = {
  title: 'Suporte',
  description: 'Encontre respostas para suas dúvidas, rastreie seu pedido e conheça nossas políticas.',
};

const faqs = [
    {
        question: "Qual o prazo de entrega?",
        answer: "O prazo de entrega varia de acordo com seu CEP e a modalidade de frete escolhida (Correios ou Jadlog). O cálculo é feito automaticamente no carrinho de compras."
    },
    {
        question: "Quais são as formas de pagamento?",
        answer: "Aceitamos PIX e Mercado Pago (cartão de crédito em até 12x ou saldo em conta)."
    },
    {
        question: "Os produtos têm garantia?",
        answer: "Sim, todos os produtos possuem garantia de 90 dias contra defeitos de fabricação."
    }
];

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
       <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground sm:text-4xl">Central de Suporte</h1>
        <p className="mt-2 text-lg leading-8 text-muted-foreground">
          Tudo o que você precisa saber está aqui.
        </p>
      </div>

      <Tabs defaultValue="rastreamento" className="mt-16 mx-auto max-w-3xl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rastreamento">Rastreamento</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="politicas">Políticas</TabsTrigger>
        </TabsList>
        <TabsContent value="rastreamento" className="mt-8">
            <h2 className="text-xl font-semibold font-headline">Rastreie seu Pedido</h2>
            <p className="text-muted-foreground mt-2">Insira seu CPF ou o código de rastreamento para ver o status do seu pedido.</p>
            <form className="mt-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="tracking-code">CPF ou Código de Rastreamento</Label>
                    <Input id="tracking-code" placeholder="Digite aqui..."/>
                </div>
                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Rastrear</Button>
            </form>
        </TabsContent>
        <TabsContent value="faq" className="mt-8">
           <h2 className="text-xl font-semibold font-headline mb-4">Perguntas Frequentes</h2>
           <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
        <TabsContent value="politicas" className="mt-8 prose dark:prose-invert max-w-none">
            <h2 className="font-headline">Política de Privacidade</h2>
            <p>Nós respeitamos sua privacidade e garantimos o sigilo das informações que você nos fornece. Seus dados pessoais são armazenados em nosso banco de dados com o intuito de melhorar nosso relacionamento através de e-mail, mala-direta, entre outras formas de interação.</p>
            <h2 className="font-headline">Política de Devolução</h2>
            <p>O prazo para solicitar a devolução de um produto é de até 7 dias corridos, a contar da data de entrega. O produto deverá ser encaminhado na embalagem original, sem indícios de uso e acompanhado de todos os seus acessórios.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
