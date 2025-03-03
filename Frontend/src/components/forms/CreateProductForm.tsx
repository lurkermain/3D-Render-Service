import { useState } from 'react';
import { ProductCreate } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ProductBasicInfo } from '@/components/product/ProductBasicInfo';
import { ProductImage } from '@/components/product/ProductImage';
import { ActionButtons } from '@/components/ui/action-buttons';

interface CreateProductFormProps {
  onSubmit: (product: ProductCreate) => Promise<void>;
  onCancel: () => void;
}

export function CreateProductForm({ onSubmit, onCancel }: CreateProductFormProps) {
  const [productInfo, setProductInfo] = useState({
    name:  '',
    description:  '',
    modelType: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('/placeholder.svg');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!productInfo.name.trim()) {
      toast({ 
        title: 'Ошибка', 
        description: 'Название товара обязательно', 
        variant: 'destructive' 
      });
      return false;
    }
    if (!productInfo.description.trim()) { // Исправленное условие
      toast({ 
        title: 'Ошибка', 
        description: 'Описание товара обязательно', 
        variant: 'destructive' 
      });
      return false;
    }
    if (!productInfo.modelType) { // Проверка на выбор упаковки
      toast({ title: 'Ошибка', description: 'Выберите тип упаковки', variant: 'destructive' });
      return false;
    }
    if (!image) {
      toast({
        title: 'Ошибка',
        description: 'Изображение товара обязательно',
        variant: 'destructive'
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(validateForm())
    
    if (isSubmitting) return;
    if (!validateForm()) return;

    const productData: ProductCreate = { 
      name: productInfo.name.trim(), 
      description: productInfo.description.trim(), 
      modelType: productInfo.modelType, 
      image 
    };

    try {
      setIsSubmitting(true);
      await onSubmit(productData);
      onCancel();
      toast({ 
        title: 'Успешно', 
        description: 'Новый товар успешно добавлен.' 
      });
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast({ 
          title: 'Ошибка', 
          description: 'Товар с таким названием уже существует', 
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'Ошибка', 
          description: 'Не удалось создать товар', 
          variant: 'destructive' 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pl-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Новый товар</h2>
        <ActionButtons
          onSave={() => {
            const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
            handleSubmit(fakeEvent);
          }}
          onClose={onCancel}
          showDelete={false}
          // disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
        <ProductBasicInfo 
          productInfo={productInfo} 
          setProductInfo={setProductInfo} 
        />
        </div>

        <div className="space-y-6">
          <ProductImage
            imagePreview={imagePreview}
            handleImageUpload={handleImageUpload}
            
          />
        </div>
      </div>
    </form>
  );
}