import { ProductCreate } from '../../lib/types';
import { Sheet, SheetContent } from '../ui/sheet';
import { CreateProductForm } from '../forms/CreateProductForm';

interface ProductCreateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (product: ProductCreate) => Promise<boolean>;
}

export function ProductCreateModal({
  isOpen,
  onOpenChange,
  onCreate,
}: ProductCreateModalProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl max-h-screen overflow-y-auto w-[95vw]">
    
        <CreateProductForm
          onSubmit={async (product) => {
            await onCreate(product);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
} 