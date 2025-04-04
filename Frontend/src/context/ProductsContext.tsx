import { createContext, useContext, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';

const ProductsContext = createContext<ReturnType<typeof useProducts> | null>(null);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const productsData = useProducts();

  // Вызов fetchProducts сразу при загрузке
  useEffect(() => {
    productsData.fetchProducts();
  }, []);

  return (
    <ProductsContext.Provider value={productsData}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProductsContext() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProductsContext должен быть использован внутри ProductsProvider");
  }
  return context;
}
