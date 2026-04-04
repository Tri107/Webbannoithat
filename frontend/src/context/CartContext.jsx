import React, { createContext, useState, useEffect, useCallback } from "react";
import { getCart } from "../lib/cartApi";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setCartItems([]);
        setLoading(false);
        return;
      }
      const data = await getCart();
      setCartItems(data.data || data);
    } catch (err) {
      console.error("Fetch cart error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
    
    const handleStorageChange = () => {
      fetchCart();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchCart]);

  const optimisticUpdate = (cartItemId, newQty) => {
    setCartItems(prev => prev.map(item => 
      item.cart_item_id === cartItemId ? { ...item, quantity: newQty } : item
    ));
  };
  
  const optimisticRemove = (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.cart_item_id !== cartItemId));
  };

  const optimisticClear = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, loading, refetch: fetchCart, optimisticUpdate, optimisticRemove, optimisticClear }}>
      {children}
    </CartContext.Provider>
  );
};
