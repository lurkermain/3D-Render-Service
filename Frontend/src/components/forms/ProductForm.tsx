import React, { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { ProductBasicInfo } from '@/components/product/ProductBasicInfo';
// import { RenderSettings } from '@/components/render-settings/RenderSettings';
import { ProductImage } from '@/components/product/ProductImage';
import { ActionButtons } from '@/components/ui/action-buttons';
import { Separator } from "@/components/ui/separator";
import ModelViewer from "@/components/render-settings/ModelViewer";

interface ProductFormProps {
  product: Product | null;
  onSubmit: (product: Product) => Promise<void>;
  onDelete?: () => void;
  onClose: () => void;
}

export function ProductForm({ product, onSubmit, onDelete, onClose }: ProductFormProps) {
  const [productInfo, setProductInfo] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    modelType: product?.modelType ?? '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(product ? api.getImageUrl(product.id) : '');
  // const [modelUrl, setModelUrl] = useState(product ? api.getModel(product.id): '');
  const modelUrl = product ? api.getModel(product.id) : null;
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setProductInfo({
        name: product.name,
        description: product.description,
        modelType: product.modelType,
      });
      setImagePreview(api.getImageUrl(product.id));
    }
  }, [product]);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      const updatedProduct = { ...productInfo, image };
      await api.updateProduct(product.id, updatedProduct);
      const freshProduct = await api.getProductById(product.id);
      await onSubmit(freshProduct);
      onClose();
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
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
        <ProductBasicInfo 
          productInfo={productInfo} 
          setProductInfo={setProductInfo} 
        />
        <ProductImage {...{ imagePreview, handleImageUpload }} />
      </div>
      <Separator className="my-6" />
      {/* {product && <RenderSettings productId={product.id} />} */}
      {modelUrl && <ModelViewer modelUrl={modelUrl} />}
     

      

    </form>
  );
}
