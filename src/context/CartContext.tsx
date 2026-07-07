import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('soley_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('soley_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const addToCart = (newItem: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => 
        i.product.id === newItem.product.id && 
        i.selectedColor === newItem.selectedColor && 
        i.selectedSize === newItem.selectedSize
      );
      if (existing) {
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + newItem.quantity } : i);
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + ((item.product as any).salePrice || item.product.price) * item.quantity, 0);
  
  // Buy 2 Get 1 Free: make the cheapest item(s) free
  const freeItems = Math.floor(totalItems / 3);
  let discount = 0;
  if (freeItems > 0) {
    const sortedPrices = items
      .flatMap(item => Array(item.quantity).fill((item.product as any).salePrice || item.product.price))
      .sort((a, b) => a - b);
    discount = sortedPrices.slice(0, freeItems).reduce((sum, p) => sum + p, 0);
  }
  const totalPrice = subtotal - discount;

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
