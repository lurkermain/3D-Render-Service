import { Product } from '@/lib/types';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ProductForm } from '@/components/forms/ProductForm';

interface ProductEditModalProps {
  product: Product;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (product: Product) => Promise<void>;
  onDelete: () => void;
}


export function ProductEditModal({
  product,
  isOpen,
  onOpenChange,
  onUpdate,
  onDelete,
}: ProductEditModalProps) {



  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl max-h-screen overflow-y-auto w-[95vw]">
        <ProductForm
          product={product}
          onSubmit={onUpdate}
          onDelete={onDelete}
          onClose={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
} 