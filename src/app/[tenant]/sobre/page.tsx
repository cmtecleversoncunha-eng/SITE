import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Sobre Nós',
  description: 'Conheça a história e a paixão por trás da nossa marca, líder em zarabatanas e acessórios de precisão.',
};

export default function AboutPage() {
  return (
    <div className="bg-background py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-x-8 gap-y-16 lg:grid-cols-2">
          <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground sm:text-4xl">Sobre a Loja</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Nossa marca nasceu da paixão pela precisão e pelo desafio. Somos mais do que uma loja; somos uma comunidade de entusiastas que valorizam a técnica, a concentração e a conexão com a natureza.
            </p>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Nossa missão é desenvolver e fornecer as melhores zarabatanas e acessórios do mercado, combinando design inovador, materiais de alta qualidade e uma performance que inspira confiança. Cada produto é projetado e testado para exceder as expectativas dos atiradores mais exigentes, do iniciante ao profissional.
            </p>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Com orgulho de sermos uma marca brasileira, nosso compromisso é com a qualidade, o suporte ao cliente e o fomento do esporte no país. Bem-vindo à nossa comunidade.
            </p>
          </div>
          <div className="relative h-96 overflow-hidden rounded-lg">
            <Image
              src="https://picsum.photos/800/600"
              alt="Oficina de criação de produtos"
              fill
              className="object-cover"
              data-ai-hint="workshop craft"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
