import axios from 'axios';
import { Product, ProductCreate,  BlenderModel} from '@/lib/types';


const API_URL = '/api/products';
const IMAGE_API_URL = '/api/products';


export const api = {
  // Получение всех продуктов
  getAllProducts: async (): Promise<Product[]> => {
    const response = await axios.get(`${API_URL}`);
    return response.data;
  },

  // Получение продукта по ID
  getProductById: async (id: number): Promise<Product> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Создание нового продукта
  createProduct: async (product: ProductCreate): Promise<void> => {
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('modeltype', product.modelType);
    if (product.image) formData.append('image', product.image);

    await axios.post(`${API_URL}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Обновление продукта
  updateProduct: async (id: number, product: ProductCreate): Promise<void> => {
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("description", product.description);
    formData.append("modeltype", product.modelType.toString()); // Приводим к строке
  
    if (product.image) {
      formData.append("image", product.image);
    }
  
    await axios.patch(`${API_URL}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  

  // Удаление продукта
  deleteProduct: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },

  // Получение изображения продукта
  getImageUrl: (id: number): string => {
    return `${API_URL}/${id}/image?timestamp=${new Date().getTime()}`;
  },

  // Рендер модели
  renderModel: async (
    id: number,
    angle_horizontal: number,
    angle_vertical: number,
    lightEnergy: number,
    angle_light: number,
  ): Promise<Blob> => {
    console.log(`${IMAGE_API_URL}/${id}/render`, {
      params: { angle_horizontal, angle_vertical, lightEnergy, angle_light },
      responseType: 'blob',
    });
  
    const response = await axios.put(`${IMAGE_API_URL}/${id}/render`, null, {
      params: { angle_horizontal, angle_vertical, lightEnergy, angle_light },
      responseType: 'blob',
    });
  
    return response.data;
  },

  getAllModels: async (): Promise<BlenderModel[]> => {
    const response = await axios.get(`${API_URL}/models`);
    return response.data ;
  },

  // Добавление новой модели
  addModel: async (modelTypeName: string, blenderFile: File, isGlb: boolean): Promise<void> => {
    const formData = new FormData();
    formData.append("modelTypeName", modelTypeName);
    formData.append("Blender_file", blenderFile);
    formData.append("isGlb", isGlb.toString());

    await axios.post(`${API_URL}/model`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Обновление модели
  updateModel: async (id: number, modelTypeName: string, blenderFile?: File, isGlb?: boolean): Promise<void> => {
    const formData = new FormData();
    formData.append("modelTypeName", modelTypeName);
    if (blenderFile) formData.append("Blender_file", blenderFile);
    if (isGlb !== undefined) formData.append("isGlb", isGlb.toString());

    await axios.patch(`${API_URL}/model/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Удаление модели
  deleteModel: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}/model`);
  },
  
  
};
