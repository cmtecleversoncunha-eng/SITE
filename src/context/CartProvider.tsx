
'use client';

import type { Product } from '@/lib/data';
import React, { createContext, useState, useEffect, type ReactNode } from 'react';

export interface CartItem extends Product {
  quantity: number;
}

export interface ShippingOption {
  id: string;
  name: string;
  company: string;
  companyId: number;
  price: number; // Em centavos
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

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  shipping: ShippingOption | null;
  setShipping: (option: ShippingOption | null) => void;
  total: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState<ShippingOption | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
    // NÃO carregar frete automaticamente - usuário deve calcular sempre
    setShipping(null);
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    const newSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setSubtotal(newSubtotal);
  }, [cart]);

   useEffect(() => {
    if (shipping) {
      localStorage.setItem('shipping', JSON.stringify(shipping));
    } else {
      localStorage.removeItem('shipping');
    }
    // Total = subtotal + frete (price está em centavos)
    const newTotal = shipping ? subtotal + (shipping.price / 100) : subtotal;
    setTotal(newTotal);
  }, [subtotal, shipping]);

  const addToCart = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setCart((prevCart) => {
      if (quantity <= 0) {
        return prevCart.filter((item) => item.id !== productId);
      }
      return prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
    });
  };
  
  const clearCart = () => {
    setCart([]);
    setShipping(null);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, shipping, setShipping, total }}>
      {children}
    </CartContext.Provider>
  );
}
