import { useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '@/lib/types';
import { ProductEditModal } from '@/components/modals/ProductEditModal';
import { ProductCreateModal } from '@/components/modals/ProductCreateModal';
import { Toolbar } from '@/components/Toolbar';
import { ProductList } from '@/components/ProductList';
import { useProductsContext } from '@/context/ProductsContext';



export function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

  const { products, totalProducts, searchQuery, setSearchQuery, fetchProducts, createProduct, updateProduct, deleteProduct } =
  useProductsContext();

    
    console.log('HOME RENDER', products);

  useEffect(() => {
    fetchProducts();
  }, []);

  
  // Мемоизируем products
  const memoizedProducts = useMemo(() => products, [products]);

  // Мемоизируем обработчик клика
  const handleProductClick = useCallback((productId: number) => {
    const product = products.find((p) => p.id === productId) || null;
    setSelectedProduct(product);
    setIsEditSheetOpen(true);
  }, [products]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-7">
      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalProducts={totalProducts}
        onCreateClick={() => setIsCreateSheetOpen(true)}
      />

      {memoizedProducts.length === 0 ? (
        <div className="text-center py-10">
          {searchQuery ? (
            <p className="text-muted-foreground">По запросу "{searchQuery}" ничего не найдено</p>
          ) : (
            <p className="text-muted-foreground">Список товаров пуст</p>
          )}
        </div>
      ) : (
        <ProductList products={memoizedProducts} onProductClick={handleProductClick} />
      )}

      {selectedProduct && (
        <ProductEditModal
          product={selectedProduct}
          isOpen={isEditSheetOpen}
          onOpenChange={setIsEditSheetOpen}
          onUpdate={async (updatedProduct) => {
            await updateProduct(updatedProduct);
          }}
          onDelete={async () => {
            if (selectedProduct) {
              const success = await deleteProduct(selectedProduct.id);
              if (success) {
                setIsEditSheetOpen(false);
              }
            }
          }}
        />
      )}

      <ProductCreateModal isOpen={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen} onCreate={createProduct} />
    </div>
  );
}
