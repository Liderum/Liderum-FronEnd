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
      const response = await inventoryApi.get<CategoriaApiResponse>('/api/Categoria');
      
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
  static async createCategory(categoria: CategoriaRequest): Promise<CategoriaDto> {
    try {
      const response = await inventoryApi.post<CategoriaCreateResponse>('/api/Categoria', categoria);
      
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Erro ao criar categoria');
      }
      
      // Após criar, busca a categoria recém-criada para obter o ID
      const categories = await this.getCategories();
      const newCategory = categories.find(cat => cat.nome === categoria.nome);
      
      if (!newCategory) {
        throw new Error('Categoria criada mas não encontrada na listagem');
      }
      
      return newCategory;
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
      const response = await inventoryApi.post<ProdutoCreateResponse>('/api/Produtos', produto);
      
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
