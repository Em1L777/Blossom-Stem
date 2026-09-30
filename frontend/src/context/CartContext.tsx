// frontend/src/context/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  subtotal: number;
  totalItemsCount: number;
  cardMessage: string;
  deliveryDate: string;
  timeSlot: string;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setCardMessage: (message: string) => void;
  setDeliveryDetails: (date: string, slot: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('blossom_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [cardMessage, setCardMessageState] = useState<string>(() => {
    return localStorage.getItem('blossom_card_msg') || '';
  });

  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('blossom_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('blossom_card_msg', cardMessage);
  }, [cardMessage]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product.id === product.id);

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIndex].quantity + quantity;
        // Ограничиваем остатком на складе
        updated[existingIndex].quantity = Math.min(newQty, product.stockQuantity);
        return updated;
      }

      return [...prevItems, { product, quantity: Math.min(quantity, product.stockQuantity) }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product.id === productId) {
          const maxQty = item.product.stockQuantity;
          return { ...item, quantity: Math.min(quantity, maxQty) };
        }
        return item;
      })
    );
  };

  const setCardMessage = (msg: string) => {
    setCardMessageState(msg);
  };

  const setDeliveryDetails = (date: string, slot: string) => {
    setDeliveryDate(date);
    setTimeSlot(slot);
  };

  const clearCart = () => {
    setItems([]);
    setCardMessageState('');
    setDeliveryDate('');
    setTimeSlot('');
    localStorage.removeItem('blossom_cart');
    localStorage.removeItem('blossom_card_msg');
  };

  const subtotal = items.reduce((sum, item) => {
    const price = typeof item.product.price === 'string' ? parseFloat(item.product.price) : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        totalItemsCount,
        cardMessage,
        deliveryDate,
        timeSlot,
        addToCart,
        removeFromCart,
        updateQuantity,
        setCardMessage,
        setDeliveryDetails,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};