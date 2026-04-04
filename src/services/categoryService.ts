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
  static async getCategories(): Promise<CategoriaDto[]> {
    try {
      const response = await inventoryApi.get('/Categories/GetAll');
      const body = response.data;

      // A API retorna { statusCode, message, data, error, isSuccess }
      // body.data contém o array de categorias
      if (body && typeof body === 'object' && 'isSuccess' in body) {
        if (!body.isSuccess) {
          throw new Error(body.message || 'Erro ao buscar categorias');
        }
        return Array.isArray(body.data) ? body.data : [];
      }

      // Fallback: se body já for array (API sem wrapper)
      if (Array.isArray(body)) {
        return body;
      }

      console.warn('Formato inesperado da resposta de categorias:', body);
      return [];
    } catch (error: unknown) {
      if (error instanceof Error && error.message !== 'Falha ao carregar categorias') {
        console.error('Erro ao buscar categorias:', error.message);
        throw error;
      }
      console.error('Erro ao buscar categorias:', error);
      throw new Error('Falha ao carregar categorias');
    }
  }

  static async createCategory(categoria: CategoriaRequest): Promise<CategoriaDto> {
    try {
      const response = await inventoryApi.post('/Categories/Create', categoria);
      const body = response.data;

      if (body && typeof body === 'object' && 'isSuccess' in body && !body.isSuccess) {
        throw new Error(body.message || 'Erro ao criar categoria');
      }

      const categories = await this.getCategories();
      const newCategory = categories.find(cat => cat.nome === categoria.nome);
      
      if (!newCategory) {
        throw new Error('Categoria criada mas não encontrada na listagem');
      }
      
      return newCategory;
    } catch (error: unknown) {
      if (error instanceof Error && error.message !== 'Falha ao criar categoria') {
        console.error('Erro ao criar categoria:', error.message);
        throw error;
      }
      console.error('Erro ao criar categoria:', error);
      throw new Error('Falha ao criar categoria');
    }
  }
}

export class ProductService {
  static async createProduct(produto: ProdutoRequest): Promise<string> {
    try {
      const response = await inventoryApi.post('/Products/Create', produto);
      const body = response.data;

      if (body && typeof body === 'object' && 'isSuccess' in body) {
        if (!body.isSuccess) {
          throw new Error(body.message || 'Erro ao criar produto');
        }
        return body.message;
      }

      return 'Produto criado com sucesso';
    } catch (error: unknown) {
      if (error instanceof Error && error.message !== 'Falha ao criar produto') {
        console.error('Erro ao criar produto:', error.message);
        throw error;
      }
      console.error('Erro ao criar produto:', error);
      throw new Error('Falha ao criar produto');
    }
  }
}
