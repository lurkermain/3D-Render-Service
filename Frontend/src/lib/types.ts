export interface Product {
  id: number
  name: string
  description: string
  modelType: string
  imageUrl: string
  
}

export  interface BlenderModel {
  id: number;
  modelType: string;
  file: File;
  isGlb: boolean;
}

export interface Product extends ProductCreate {
  id: number;
  imageUrl: string;  // Ссылка на изображение товара
}

export interface ProductCreate {
  id?: number;
  name: string
  description: string
  modelType: string
  image: File | null  
}

