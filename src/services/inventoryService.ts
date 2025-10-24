import { inventoryApi } from '../services/api/apiFactory';
import { ProdutoDashboardDto, ProdutoDto, Product, InventoryStats, ApiResponse, ApiResponseSingle, ApiPaginatedResponse, PaginatedResponse } from '../types/inventory';
import { ProdutoRequest } from '../types/category';

export class InventoryService {

  static async getProducts(page: number = 1, pageSize: number = 10): Promise<ProdutoDashboardDto> {
    try {
      const response = await inventoryApi.get<ApiPaginatedResponse<ProdutoDto>>(`/Products/GetAll?page=${page}&pageSize=${pageSize}`);
      
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Erro na API');
      }
      
      const paginatedData = response.data.data;
      
      if (!paginatedData) {
        return {
          totalProdutos: 0,
          totalCategorias: 0,
          valorTotalEstoque: 0,
          estoqueBaixo: 0,
          semEstoque: 0,
          produtos: []
        };
      }
      
      // Converte a estrutura paginada para a estrutura esperada pelo dashboard
      return {
        totalProdutos: paginatedData.totalProdutos,
        totalCategorias: paginatedData.totalCategorias,
        valorTotalEstoque: paginatedData.valorTotalEstoque,
        estoqueBaixo: paginatedData.estoqueBaixo,
        semEstoque: paginatedData.semEstoque,
        produtos: paginatedData.produtos
      };
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw new Error('Falha ao carregar dados do estoque');
    }
  }

  static convertApiProductToComponent(produto: ProdutoDto): Product {
    return {
      id: produto.id,
      name: produto.nome,
      sku: produto.sku,
      barcode: '',
      quantity: produto.quantidadeEstoque,
      minQuantity: produto.quantidadeMinima,
      maxQuantity: produto.quantidadeMinima * 3,
      price: produto.precoVenda,
      costPrice: produto.precoCusto,
      category: produto.categoriaNome,
      brand: produto.marca,
      supplier: 'N/A', 
      location: 'N/A', 
      status: produto.status.toLowerCase() as 'active' | 'inactive' | 'discontinued',
      lastMovement: new Date().toISOString().split('T')[0], 
      createdAt: new Date().toISOString().split('T')[0], 
      updatedAt: new Date().toISOString().split('T')[0], 
      description: '',
      weight: undefined,
      dimensions: undefined,
      image: undefined
    };
  }

  static convertApiStatsToComponent(dashboardData: ProdutoDashboardDto): InventoryStats {
    return {
      totalProducts: dashboardData.totalProdutos,
      totalValue: dashboardData.valorTotalEstoque,
      lowStockItems: dashboardData.estoqueBaixo,
      outOfStockItems: dashboardData.semEstoque,
      categoriesCount: dashboardData.totalCategorias,
      suppliersCount: 0
    };
  }

  static async getInventoryData(page: number = 1, pageSize: number = 10): Promise<{
    products: Product[];
    stats: InventoryStats;
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
    message?: string;
  }> {
    try {
      const dashboardData = await this.getProducts(page, pageSize);
      
      const products = dashboardData.produtos.map(produto => 
        this.convertApiProductToComponent(produto)
      );
      
      const stats = this.convertApiStatsToComponent(dashboardData);
      
      const message = products.length === 0 ? 'Nenhum produto encontrado no estoque.' : undefined;
      
      return { 
        products, 
        stats, 
        pagination: {
          page,
          pageSize,
          total: dashboardData.totalProdutos,
          totalPages: Math.ceil(dashboardData.totalProdutos / pageSize)
        },
        message 
      };
    } catch (error) {
      console.error('Erro ao processar dados do estoque:', error);
      throw error;
    }
  }

  static async getProductById(id: string): Promise<Product> {
    try {
      const response = await inventoryApi.get<ApiResponseSingle<ProdutoDto>>(`/Products/GetById/${id}`);
      
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Erro ao buscar produto');
      }
      
      const produto = response.data.data;
      
      if (!produto) {
        throw new Error('Produto não encontrado');
      }
      
      return this.convertApiProductToComponent(produto);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw new Error('Falha ao carregar produto');
    }
  }

  static async deleteProduct(id: string): Promise<string> {
    try {
      const response = await inventoryApi.delete<ApiResponse<string>>(`/Products/Delete/${id}`);
      
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Erro ao excluir produto');
      }
      
      return response.data.message || 'Produto excluído com sucesso';
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      throw new Error('Falha ao excluir produto');
    }
  }

  static async updateProduct(id: string, productData: ProdutoRequest): Promise<string> {
    try {
      const response = await inventoryApi.put<ApiResponse<string>>(`/Products/Update/${id}`, productData);
      
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Erro ao atualizar produto');
      }
      
      return response.data.message || 'Produto atualizado com sucesso';
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw new Error('Falha ao atualizar produto');
    }
  }
}
