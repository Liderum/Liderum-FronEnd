import { inventoryApi } from '../services/api/apiFactory';
import { 
  CategoriaDto, 
  CategoriaRequest, 
  ProdutoRequest,
  CategoriaApiResponse,
  CategoriaCreateResponse,
  ProdutoCreateResponse
} from '../types/category';

export class CategoryService {
  /**
   * Busca todas as categorias
   */
  static async getCategories(): Promise<CategoriaDto[]> {
    try {
      const response = await inventoryApi.get<CategoriaApiResponse>('/Categories/GetAll');
      
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Erro ao buscar categorias');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw new Error('Falha ao carregar categorias');
    }
  }

  /**
   * Cria uma nova categoria
   */
  static async createCategory(categoria: CategoriaRequest): Promise<string> {
    try {
      const response = await inventoryApi.post<CategoriaCreateResponse>('/Categories/Create', categoria);
      
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Erro ao criar categoria');
      }
      
      return response.data.message;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw new Error('Falha ao criar categoria');
    }
  }
}

export class ProductService {
  /**
   * Cria um novo produto
   */
  static async createProduct(produto: ProdutoRequest): Promise<string> {
    try {
      const response = await inventoryApi.post<ProdutoCreateResponse>('/Products/Create', produto);
      
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Erro ao criar produto');
      }
      
      return response.data.message;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw new Error('Falha ao criar produto');
    }
  }
}
