import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStoraged = await AsyncStorage.getItem('@Products');

      if (productsStoraged) {
        setProducts([...JSON.parse(productsStoraged)]);
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const newProducts = products.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      );

      setProducts(newProducts);

      await AsyncStorage.setItem('@Products', JSON.stringify(newProducts));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProducts = products.map(item =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
      );

      setProducts(newProducts);

      await AsyncStorage.setItem('@Products', JSON.stringify(newProducts));
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const existentProduct = products.find(item => item.id === product.id);

      if (existentProduct) {
        setProducts(
          products.map(item =>
            item.id === existentProduct.id
              ? { ...item, quantity: existentProduct.quantity + 1 }
              : item,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem('@Products', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
