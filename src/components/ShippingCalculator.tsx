'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Truck, Package, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';

interface ShippingOption {
  id: string;
  name: string;
  company: string;
  companyId: number;
  price: number;
  originalPrice: number;
  deliveryTime: number;
  deliveryRange: {
    min: number;
    max: number;
  };
  isCheapest: boolean;
  logo?: string;
  currency: string;
}

interface ShippingCalculatorProps {
  onShippingSelect?: (option: ShippingOption) => void;
  selectedShipping?: ShippingOption | null;
  className?: string;
  showTitle?: boolean;
  autoCalculate?: boolean;
}

export function ShippingCalculator({
  onShippingSelect,
  selectedShipping,
  className = '',
  showTitle = true,
  autoCalculate = false
}: ShippingCalculatorProps) {
  const [zipCode, setZipCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { cart } = useCart();
  
  // Verificar se cart está disponível
  const cartItems = cart || [];

  // Máscara para CEP
  const formatZipCode = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatZipCode(e.target.value);
    setZipCode(formatted);
    setError(null);
    setShippingOptions([]);
    
    // Auto-calcular se habilitado e CEP completo
    if (autoCalculate && formatted.length === 9) {
      calculateShipping();
    }
  };

  const calculateShipping = async () => {
    // Remover formatação do CEP para validação
    const cleanZipCode = zipCode.replace(/\D/g, '');
    if (!cleanZipCode || cleanZipCode.length !== 8) {
      setError('Digite um CEP válido');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setError('Adicione produtos ao carrinho primeiro');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zipCode: cleanZipCode,
          cartItems: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity
          }))
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao calcular frete');
      }

      if (data.options && data.options.length > 0) {
        setShippingOptions(data.options);
        
        // Auto-selecionar opção mais barata
        if (data.options.length > 0 && onShippingSelect) {
          onShippingSelect(data.options[0]);
        }

        toast({
          title: 'Frete calculado!',
          description: `${data.options.length} opções de entrega encontradas.`,
        });
      } else {
        setError('Nenhuma opção de frete disponível para este CEP');
      }

    } catch (error: any) {
      console.error('Erro ao calcular frete:', error);
      setError(error.message || 'Erro ao calcular frete');
      
      toast({
        title: 'Erro ao calcular frete',
        description: error.message || 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (option: ShippingOption) => {
    if (onShippingSelect) {
      onShippingSelect(option);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  const formatDeliveryTime = (time: number) => {
    if (time === 1) return '1 dia útil';
    return `${time} dias úteis`;
  };

  const getCompanyLogo = (company: string) => {
    const companyLower = company.toLowerCase();
    if (companyLower.includes('correios')) {
      return '🇧🇷'; // Emoji da bandeira brasileira para Correios
    }
    if (companyLower.includes('jadlog')) {
      return '📦'; // Emoji de pacote para Jadlog
    }
    return '🚚'; // Emoji genérico de caminhão
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {showTitle && (
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Calcular Frete</h3>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="zipCode">CEP de destino</Label>
        <div className="flex gap-2">
          <Input
            id="zipCode"
            type="text"
            placeholder="00000-000"
            value={zipCode}
            onChange={handleZipCodeChange}
            maxLength={9}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={calculateShipping}
            disabled={isLoading || zipCode.replace(/\D/g, '').length !== 8 || !cartItems || cartItems.length === 0}
            className="px-6"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Calcular'
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      {shippingOptions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Opções de entrega:</h4>
          
          {shippingOptions.map((option) => (
            <Card 
              key={option.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedShipping?.id === option.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:border-blue-300'
              }`}
              onClick={() => handleOptionSelect(option)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {getCompanyLogo(option.company)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium">{option.name}</h5>
                        {option.isCheapest && (
                          <Badge variant="secondary" className="text-xs">
                            Mais barato
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        {option.company}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="h-3 w-3" />
                          {formatDeliveryTime(option.deliveryTime)}
                        </div>
                        
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Package className="h-3 w-3" />
                          {option.deliveryRange.min}-{option.deliveryRange.max} dias
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {formatPrice(option.price)}
                    </div>
                    {option.originalPrice > option.price && (
                      <div className="text-sm text-gray-500 line-through">
                        {formatPrice(option.originalPrice)}
                      </div>
                    )}
                  </div>
                  
                  {selectedShipping?.id === option.id && (
                    <CheckCircle className="h-5 w-5 text-blue-600 ml-2" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-600">Calculando frete...</p>
          </div>
        </div>
      )}
    </div>
  );
}
