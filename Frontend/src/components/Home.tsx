import { useState, useEffect, useMemo } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/lib/types';
import { useProducts } from '@/hooks/useProducts';
import { ProductEditModal } from '@/components/modals/ProductEditModal';
import { ProductCreateModal } from '@/components/modals/ProductCreateModal';
import { SearchPanel } from '@/components/SearchPanel';

export function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

  const {
    products,
    totalProducts,
    searchQuery,
    setSearchQuery,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, []);

  

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsEditSheetOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (selectedProduct) {
      const success = await deleteProduct(selectedProduct.id);
      if (success) {
        setIsEditSheetOpen(false);
      }
    }
  };

  // console.log(window.innerWidth)
  const productCards = useMemo(() => {
    return products.map((product) => (

      <ProductCard
        key={product.id}
        product={product}
        onClick={() => handleProductClick(product)}
      />
     
    ));
  }, [products]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-7">
      <SearchPanel
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalProducts={totalProducts}
        onCreateClick={() => setIsCreateSheetOpen(true)}
      />
      

      {products.length === 0 ? (
        <div className="text-center py-10">
          {searchQuery ? (
            <p className="text-muted-foreground">
              По запросу "{searchQuery}" ничего не найдено
            </p>
          ) : (
            <p className="text-muted-foreground">
              Список товаров пуст
            </p>
          )}
        </div>
      ) : (
        // <div className="flex justify-center items-center">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 ">
        {productCards}
      </div>
      
        // </div>
      )}


      {selectedProduct && (
        <ProductEditModal
          product={selectedProduct}
          isOpen={isEditSheetOpen}
          onOpenChange={setIsEditSheetOpen}
          onUpdate={async (product) => {
            await updateProduct(product);
          }}
          onDelete={handleDeleteProduct}
        />
      )}

      <ProductCreateModal
        isOpen={isCreateSheetOpen}
        onOpenChange={setIsCreateSheetOpen}
        onCreate={createProduct}
      />
    </div>
  );
}
