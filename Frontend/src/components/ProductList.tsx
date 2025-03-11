// components/ProductList.tsx
import { memo } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/lib/types';

interface ProductListProps {
  products: Product[];
  onProductClick: (productId: number) => void;
}


export const ProductList = memo(({ products, onProductClick }: ProductListProps) => {
    console.log('product list render')
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onClick={() => onProductClick(product.id)} />
      ))}
    </div>
  );
});
