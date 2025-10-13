import { inventoryApi } from '../services/api/apiFactory';
import { ProdutoDashboardDto, ProdutoDto, Product, InventoryStats, ApiResponse } from '../types/inventory';

export class InventoryService {
  /**
   * Busca todos os produtos do dashboard
   */
  static async getProducts(): Promise<ProdutoDashboardDto> {
    try {
      const response = await inventoryApi.get<ApiResponse<ProdutoDashboardDto>>('/api/Produtos');
      
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Erro na API');
      }
      
      const dashboardData = response.data.data[0];
      
      if (!dashboardData) {
        return {
          totalProdutos: 0,
          totalCategorias: 0,
          valorTotalEstoque: 0,
          estoqueBaixo: 0,
          semEstoque: 0,
          produtos: []
        };
      }
      
      return dashboardData;
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

  static async getInventoryData(): Promise<{
    products: Product[];
    stats: InventoryStats;
    message?: string;
  }> {
    try {
      const dashboardData = await this.getProducts();
      
      const products = dashboardData.produtos.map(produto => 
        this.convertApiProductToComponent(produto)
      );
      
      const stats = this.convertApiStatsToComponent(dashboardData);
      
      const message = products.length === 0 ? 'Nenhum produto encontrado no estoque.' : undefined;
      
      return { products, stats, message };
    } catch (error) {
      console.error('Erro ao processar dados do estoque:', error);
      throw error;
    }
  }
}
