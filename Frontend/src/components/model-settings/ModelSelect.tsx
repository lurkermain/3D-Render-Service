"use client";
import { useState } from "react";
import { ModelManageDialog } from "./ModelManageDialog";
import { ModelSwitcher } from '@/components/model-settings/ModelSwitcher';
import { useModels } from "@/hooks/useModels";
import { useRefresh } from "@/hooks/useRefresh";
import { useProductsContext } from '@/context/ProductsContext';

interface Model {
  id: number;
  modelType: string;
  file: File;
  isGlb: boolean; // Добавляем isGlb в интерфейс модели
}

interface ModelSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ModelSelect({ value, onChange, placeholder = "Выберите 3D модель" }: ModelSelectProps) {
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const { models, addModel, updateModel, deleteModel } = useModels();

  const { refresh } = useRefresh();
  const {fetchProducts} =  useProductsContext();

  const handleAddModel = () => {
    setEditingModel(null);
    setIsModelDialogOpen(true);
  };

  const handleEditModel = (modelId: number) => {
    const model = models.find((m) => m.id === modelId);
    if (model) {
      setEditingModel(model);
      setIsModelDialogOpen(true);
    }
  };

  const handleSaveModel = async (modelData: { id?: number; name: string; file?: File; isGlb: boolean }) => {
    try {
      if (modelData.id) {
        // Если файл не загружен, используем текущее значение isGlb из редактируемой модели
        const currentModel = models.find((m) => m.id === modelData.id);
        const isGlb = modelData.file ? modelData.isGlb : currentModel?.isGlb || false;

        await updateModel(modelData.id, modelData.name, modelData.file || undefined, isGlb);
        await fetchProducts();
        refresh();
        console.log("refresh start")
        // Если редактируемая модель была выбрана, обновляем значение `value`
        if (value === modelData.id.toString()) {
          onChange(modelData.name); // Обновляем значение `value` на новое имя модели
        }
      } else {
        if (!modelData.file) return; // Файл обязателен только для новой модели
        await addModel(modelData.name, modelData.file, modelData.isGlb);
      }
      setIsModelDialogOpen(false);
    } catch (error) {
      console.error("Ошибка при сохранении модели:", error);
    }
  };

  const handleDeleteModel = async (id: number) => {
    await deleteModel(id);
  };

  return (
    <>
      <ModelSwitcher
        models={models}
        value={value}
        onValueChange={onChange}
        placeholder={placeholder}
        onAddModel={handleAddModel}
        onEditModel={handleEditModel}
        onDeleteModel={handleDeleteModel}
        showModelActions
      />

      <ModelManageDialog
        open={isModelDialogOpen}
        onOpenChange={setIsModelDialogOpen}
        model={editingModel || undefined}
        onSave={handleSaveModel}
      />
    </>
  );
}