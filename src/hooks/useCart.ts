
'use client';

import { useContext } from 'react';
import { CartContext, type ShippingOption } from '@/context/CartProvider';

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export type { ShippingOption };
