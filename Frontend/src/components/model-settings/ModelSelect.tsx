"use client";

import { useState } from "react";
import { ModelManageDialog } from "./ModelManageDialog";
import { ModelSwitcher } from '@/components/model-settings/ModelSwitcher';
import { useModels } from "@/hooks/useModels";

interface Model {
  id: number;
  modelType: string;
  file: File;
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

  const handleSaveModel = async (modelData: { id?: number; name: string; file?: File }) => {
    try {
      if (modelData.id) {
        await updateModel(modelData.id, modelData.name, modelData.file || undefined, false);
        // Если редактируемая модель была выбрана, обновляем значение `value`
        if (value === modelData.id.toString()) {
          onChange(modelData.name); // Обновляем значение `value` на новое имя модели
        }
      } else {
        if (!modelData.file) return; // Файл обязателен только для новой модели
        await addModel(modelData.name, modelData.file, false);
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
        options={models}
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