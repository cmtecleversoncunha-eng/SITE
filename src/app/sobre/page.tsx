import type { Metadata } from 'next';
import Image from 'next/image';
import { getSiteImages } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Sobre Nós',
  description: 'Conheça nossa história e paixão pelas zarabatanas.',
};

export default async function AboutPage() {
  const siteImages = await getSiteImages();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold font-headline tracking-tight text-foreground mb-6">
              Sobre Nós
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Somos apaixonados por zarabatanas e dedicados a fornecer os melhores produtos e serviços para a comunidade de praticantes.
            </p>
          </div>
          
          {/* Imagem do Sobre */}
          <div className="mb-12">
            <div className="relative h-96 overflow-hidden rounded-lg">
              <Image
                src={siteImages.aboutImage}
                alt="Nossa história"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Nossa História */}
            <div className="bg-card p-8 rounded-lg shadow-sm">
              <h2 className="text-3xl font-bold font-headline mb-6 text-foreground">Nossa História</h2>
              <p className="text-muted-foreground leading-relaxed">
                Fundada com a missão de democratizar o acesso a equipamentos de qualidade, nossa empresa nasceu da paixão pelo esporte e da necessidade de oferecer produtos confiáveis e acessíveis.
              </p>
            </div>

            {/* Nossa Missão */}
            <div className="bg-card p-8 rounded-lg shadow-sm">
              <h2 className="text-3xl font-bold font-headline mb-6 text-foreground">Nossa Missão</h2>
              <p className="text-muted-foreground leading-relaxed">
                Proporcionar equipamentos de alta qualidade, suporte técnico especializado e uma experiência de compra excepcional para todos os praticantes de zarabatana.
              </p>
            </div>
          </div>

          {/* Por que Escolher a Gente */}
          <div className="bg-card p-8 rounded-lg shadow-sm mb-16">
            <h2 className="text-3xl font-bold font-headline mb-8 text-foreground text-center">Por que Escolher a Gente?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Produtos Testados", desc: "Todos os produtos são testados e aprovados por profissionais" },
                { title: "Suporte Especializado", desc: "Equipe técnica especializada em zarabatanas" },
                { title: "Garantia de Qualidade", desc: "Garantia de qualidade em todos os produtos" },
                { title: "Entrega Rápida", desc: "Entrega rápida e segura em todo o Brasil" },
                { title: "Atendimento Personalizado", desc: "Atendimento personalizado para cada cliente" },
                { title: "Preços Justos", desc: "Preços competitivos e acessíveis" }
              ].map((item, index) => (
                <div key={index} className="text-center p-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-primary rounded-full"></div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-primary/5 p-8 rounded-lg">
            <h3 className="text-2xl font-bold font-headline mb-4 text-foreground">Pronto para Começar?</h3>
            <p className="text-muted-foreground mb-6">Explore nossa loja e descubra os melhores equipamentos para sua prática.</p>
            <a 
              href="/loja" 
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Ver Produtos
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
