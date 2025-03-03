import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { BlenderModel } from "@/lib/types";

export const useModels = () => {
  const [models, setModels] = useState<BlenderModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Получение всех моделей
  const fetchModels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAllModels();
      setModels(data);
    } catch (err) {
      setError("Ошибка при загрузке моделей");
    } finally {
      setLoading(false);
    }
  }, []);

  // Добавление модели
  const addModel = async (modelTypeName: string, blenderFile: File, isGlb: boolean) => {
    setLoading(true);
    setError(null);
    try {
      await api.addModel(modelTypeName, blenderFile, isGlb);
      await fetchModels(); // Обновляем список после добавления
    } catch (err) {
      setError("Ошибка при добавлении модели");
    } finally {
      setLoading(false);
    }
  };

  // Обновление модели
  const updateModel = async (id: number, modelTypeName: string, blenderFile?: File, isGlb?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      await api.updateModel(id, modelTypeName, blenderFile, isGlb);
      await fetchModels(); // Обновляем список после изменения
    } catch (err) {
      setError("Ошибка при обновлении модели");
    } finally {
      setLoading(false);
    }
  };

  // Удаление модели
  const deleteModel = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteModel(id);
      setModels((prev) => prev.filter((model) => model.id !== id)); // Корректно убираем удаленную модель
    } catch (err) {
      setError("Ошибка при удалении модели");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return { models, loading, error, fetchModels, addModel, updateModel, deleteModel };
};
