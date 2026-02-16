import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Load cart from sessionStorage on mount
  useEffect(() => {
    const savedCart = sessionStorage.getItem('kioskCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('kioskCart', JSON.stringify(cart));
  }, [cart]);

  // Update last activity time
  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  const addToCart = (product, quantity = 1) => {
    updateActivity();
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    updateActivity();
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    updateActivity();
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    updateActivity();
    setCart([]);
    sessionStorage.removeItem('kioskCart');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const getTax = () => {
    return getCartTotal() * 0.08; // 8% tax
  };

  const getGrandTotal = () => {
    return getCartTotal() + getTax();
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    getTax,
    getGrandTotal,
    lastActivity,
    updateActivity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
