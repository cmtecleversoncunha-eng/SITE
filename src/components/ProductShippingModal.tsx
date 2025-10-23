'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShippingCalculator } from './ShippingCalculator';
import { Truck, Package } from 'lucide-react';

interface ProductShippingModalProps {
  product: {
    id: number;
    name: string;
    weight: number | null;
    dimensions: string | null;
    price: number;
  };
  children?: React.ReactNode;
}

export function ProductShippingModal({ product, children }: ProductShippingModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="w-full">
            <Truck className="h-4 w-4 mr-2" />
            Calcular Frete
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Calcular Frete - {product.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações do Produto */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              {product.name}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div>
                <span className="font-medium">Peso:</span> {product.weight || 0.3} kg
              </div>
              <div>
                <span className="font-medium">Dimensões:</span> {product.dimensions || '20x15x10'} cm
              </div>
            </div>
          </div>

          {/* Calculadora de Frete */}
          <ShippingCalculator
            onShippingSelect={(option) => {
              console.log('Opção de frete selecionada:', option);
              // Aqui você pode adicionar lógica para salvar a seleção se necessário
            }}
            showTitle={false}
            autoCalculate={true}
          />

          {/* Informações Adicionais */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 Dicas sobre o frete:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• O frete é calculado com base no peso e dimensões do produto</li>
              <li>• Prazos de entrega são estimativas em dias úteis</li>
              <li>• O valor final será confirmado no checkout</li>
              <li>• Entregas para todo o Brasil</li>
            </ul>
          </div>

          {/* Botão de Fechar */}
          <div className="flex justify-end">
            <Button onClick={() => setIsOpen(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
