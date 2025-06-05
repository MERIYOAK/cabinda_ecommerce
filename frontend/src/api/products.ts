import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  inStock: boolean;
  isPromoted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  status: string;
  results: number;
  total: number;
  data: Product[];
}

export const fetchProducts = async (
  params: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<ProductsResponse> => {
  const response = await axios.get(`${API_URL}/api/products`, { params });
  return response.data;
};

export const fetchProduct = async (id: string): Promise<{ data: Product }> => {
  const response = await axios.get(`${API_URL}/api/products/${id}`);
  return response.data;
};

export const fetchPromotedProducts = async (): Promise<{ data: Product[] }> => {
  const response = await axios.get(`${API_URL}/api/products/promoted`);
  return response.data;
};

export const fetchCategories = async (): Promise<{ data: string[] }> => {
  const response = await axios.get(`${API_URL}/api/products/categories`);
 