// Tipos baseados na API de produtos

export interface ProdutoDto {
  id: string; // Guid convertido para string
  nome: string;
  sku: string;
  categoriaNome: string;
  marca: string;
  status: string;
  quantidadeEstoque: number;
  quantidadeMinima: number;
  precoCusto: number;
  precoVenda: number;
}

export interface ProdutoDashboardDto {
  totalProdutos: number;
  totalCategorias: number;
  valorTotalEstoque: number;
  estoqueBaixo: number;
  semEstoque: number;
  produtos: ProdutoDto[];
}

// Nova estrutura de resposta com paginação
export interface PaginatedResponse<T> {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  produtos: T[];
  totalProdutos: number;
  totalCategorias: number;
  valorTotalEstoque: number;
  estoqueBaixo: number;
  semEstoque: number;
}

// Resposta completa da API
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T[];
  error: null | string;
  isSuccess: boolean;
}

// Nova resposta da API com paginação
export interface ApiPaginatedResponse<T> {
  statusCode: number;
  message: string;
  data: PaginatedResponse<T>;
  error: null | string;
  isSuccess: boolean;
}

// Resposta da API para produto único
export interface ApiResponseSingle<T> {
  statusCode: number;
  message: string;
  data: T;
  error: null | string;
  isSuccess: boolean;
}

// Tipos para compatibilidade com o componente atual
export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  price: number;
  costPrice: number;
  category: string;
  brand: string;
  supplier: string;
  location: string;
  status: 'active' | 'inactive' | 'discontinued';
  lastMovement: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  weight?: number;
  dimensions?: string;
  image?: string;
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  categoriesCount: number;
  suppliersCount: number;
}
