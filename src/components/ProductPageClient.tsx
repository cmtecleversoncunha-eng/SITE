'use client';

import { ShippingCalculator } from './ShippingCalculator';
import { useCart } from '@/hooks/useCart';

export function ProductPageShipping() {
  const { setShipping, shipping } = useCart();

  return (
    <div className="pt-6 border-t">
      <ShippingCalculator 
        showTitle={true} 
        onShippingSelect={setShipping}
        selectedShipping={shipping}
      />
    </div>
  );
}

