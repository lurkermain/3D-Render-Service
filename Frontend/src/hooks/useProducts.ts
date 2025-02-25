import { useState, useMemo } from 'react';
import { Product, ProductCreate } from '../lib/types';
import { api } from '../lib/api';
import { useToast } from './use-toast';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Фильтрация продуктов на основе поискового запроса
  const filteredProducts = useMemo(() => {
    return products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      const data = await api.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить товары.",
        variant: "destructive",
      });
    }
  };

  const createProduct = async (product: ProductCreate) => {
    try {
      await api.createProduct(product);
      await fetchProducts();
      toast({
        title: "Товар создан",
        description: "Новый товар успешно добавлен.",
      });
      return true;
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать товар.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      await api.updateProduct(updatedProduct.id, updatedProduct);
      setProducts(prev => 
        prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
      );
      return true;
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить товар.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteProduct = async (productId: number) => {
    try {
      await api.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast({
        title: "Товар удален",
        description: "Товар успешно удален.",
      });
      return true;
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    products: filteredProducts,
    totalProducts: products.length,
    searchQuery,
    setSearchQuery,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
} 