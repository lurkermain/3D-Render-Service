import React, { useState, useEffect } from 'react';
import { Product } from '../../lib/types';
import { useToast } from '@/hooks/use-toast';
import { api } from '../../lib/api';
import { ProductBasicInfo } from '../product/ProductBasicInfo';
import { RenderSettings } from '../render-settings/RenderSettings';
import { ProductImage } from '../product/ProductImage';
import { ActionButtons } from '../ui/action-buttons';
import { Separator } from "@/components/ui/separator"

interface ProductFormProps {
  product: Product | null;
  onSubmit: (product: Product) => Promise<void>;
  onDelete?: () => void;
  onClose: () => void;
}

export function ProductForm({ product, onSubmit, onDelete, onClose }: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [modelType, setModelType] = useState(product?.modelType ?? '');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(product ? api.getImageUrl(product.id) : '');
  const { toast } = useToast();

  // Обновление imagePreview, если product изменился
  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setModelType(product.modelType);
      setImagePreview(api.getImageUrl(product.id)); // Обновляем превью с URL
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      const updatedProduct = { name, description, modelType, image };
      await api.updateProduct(product.id, updatedProduct);
      const freshProduct = await api.getProductById(product.id);
      await onSubmit(freshProduct);
      onClose(); // Закрываем форму после успешного сохранения
    } catch (error) {
      toast({ 
        title: 'Ошибка', 
        description: 'Не удалось сохранить товар.', 
        variant: 'destructive' 
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string); // Обновляем превью изображения
      };
      reader.readAsDataURL(file); // Читаем файл как Data URL для превью
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex justify-between items-center mb-6 ">
        <h2 className="text-2xl font-bold">Товар</h2>
        <ActionButtons
          onSave={() => {
            const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
            handleSubmit(fakeEvent);
          }}
          onDelete={onDelete}
          onClose={onClose}
          showDelete={!!onDelete}
        />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <ProductBasicInfo {...{ name, description, modelType, setName, setDescription, setModelType }} />
        <ProductImage {...{ imagePreview, handleImageUpload }} />
      </div>
      <Separator className="my-6" />
      {product && <RenderSettings productId={product.id} />}
    </form>
  );
}