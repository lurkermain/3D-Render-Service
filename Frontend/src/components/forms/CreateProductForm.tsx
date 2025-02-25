import { useState } from 'react';
import { ProductCreate } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ProductBasicInfo } from '../product/ProductBasicInfo';
import { ProductImage } from '../product/ProductImage';
import { ActionButtons } from '../ui/action-buttons';

interface CreateProductFormProps {
  onSubmit: (product: ProductCreate) => Promise<void>;
  onCancel: () => void;
}

export function CreateProductForm({ onSubmit, onCancel }: CreateProductFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [modelType, setModelType] = useState('');
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
    if (!name.trim()) {
      toast({ 
        title: 'Ошибка', 
        description: 'Название товара обязательно', 
        variant: 'destructive' 
      });
      return false;
    }
    if (!description.trim()) {
      toast({ 
        title: 'Ошибка', 
        description: 'Описание товара обязательно', 
        variant: 'destructive' 
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    if (!validateForm()) return;

    const productData: ProductCreate = { 
      name: name.trim(), 
      description: description.trim(), 
      modelType, 
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
            name={name}
            description={description}
            modelType={modelType}
            setName={setName}
            setDescription={setDescription}
            setModelType={setModelType}
            // disabled={isSubmitting}
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