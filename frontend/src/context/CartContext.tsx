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
  totalPrice: number; // Алиас для subtotal
  totalItemsCount: number;
  
  // Поля для поздравительной открытки
  cardMessage: string;
  greetingCardNote: string; // Алиас для cardMessage
  setCardMessage: (message: string) => void;
  setGreetingCardNote: (message: string) => void; // Алиас для setCardMessage

  // Поля для логистики доставки
  deliveryDate: string;
  setDeliveryDate: (date: string) => void;
  timeSlot: string;
  deliverySlot: string; // Алиас для timeSlot
  setTimeSlot: (slot: string) => void;
  setDeliverySlot: (slot: string) => void; // Алиас для setTimeSlot
  setDeliveryDetails: (date: string, slot: string) => void;

  // Методы управления товарами
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
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

  const [deliveryDate, setDeliveryDateState] = useState<string>('');
  const [timeSlot, setTimeSlotState] = useState<string>('10:00 - 13:00');

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

  const setDeliveryDate = (date: string) => {
    setDeliveryDateState(date);
  };

  const setTimeSlot = (slot: string) => {
    setTimeSlotState(slot);
  };

  const setDeliveryDetails = (date: string, slot: string) => {
    setDeliveryDateState(date);
    setTimeSlotState(slot);
  };

  const clearCart = () => {
    setItems([]);
    setCardMessageState('');
    setDeliveryDateState('');
    setTimeSlotState('10:00 - 13:00');
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
        totalPrice: subtotal,
        totalItemsCount,

        cardMessage,
        greetingCardNote: cardMessage,
        setCardMessage,
        setGreetingCardNote: setCardMessage,

        deliveryDate,
        setDeliveryDate,
        timeSlot,
        deliverySlot: timeSlot,
        setTimeSlot,
        setDeliverySlot: setTimeSlot,
        setDeliveryDetails,

        addToCart,
        removeFromCart,
        updateQuantity,
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