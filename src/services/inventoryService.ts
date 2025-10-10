import { inventoryApi } from '../services/api/apiFactory';
import { ProdutoDashboardDto, ProdutoDto, Product, InventoryStats, ApiResponse } from '../types/inventory';

export class InventoryService {
  /**
   * Busca todos os produtos do dashboard
   */
  static async getProducts(): Promise<ProdutoDashboardDto> {
    try {
      const response = await inventoryApi.get<ApiResponse<ProdutoDashboardDto>>('/api/Produtos');
      
      // Verifica se a resposta é bem-sucedida
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Erro na API');
      }
      
      // A API retorna os dados em data[0]
      const dashboardData = response.data.data[0];
      
      if (!dashboardData) {
        // Retorna dados vazios se não há produtos
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

  /**
   * Converte ProdutoDto da API para Product do componente
   */
  static convertApiProductToComponent(produto: ProdutoDto): Product {
    return {
      id: produto.id,
      name: produto.nome,
      sku: produto.sku,
      barcode: '', // Não disponível na API
      quantity: produto.quantidadeEstoque,
      minQuantity: produto.quantidadeMinima,
      maxQuantity: produto.quantidadeMinima * 3, // Estimativa baseada no mínimo
      price: produto.precoVenda,
      costPrice: produto.precoCusto,
      category: produto.categoriaNome,
      brand: produto.marca,
      supplier: 'N/A', // Não disponível na API
      location: 'N/A', // Não disponível na API
      status: produto.status.toLowerCase() as 'active' | 'inactive' | 'discontinued',
      lastMovement: new Date().toISOString().split('T')[0], // Data atual como fallback
      createdAt: new Date().toISOString().split('T')[0], // Data atual como fallback
      updatedAt: new Date().toISOString().split('T')[0], // Data atual como fallback
      description: '', // Não disponível na API
      weight: undefined, // Não disponível na API
      dimensions: undefined, // Não disponível na API
      image: undefined // Não disponível na API
    };
  }

  /**
   * Converte ProdutoDashboardDto da API para InventoryStats do componente
   */
  static convertApiStatsToComponent(dashboardData: ProdutoDashboardDto): InventoryStats {
    return {
      totalProducts: dashboardData.totalProdutos,
      totalValue: dashboardData.valorTotalEstoque,
      lowStockItems: dashboardData.estoqueBaixo,
      outOfStockItems: dashboardData.semEstoque,
      categoriesCount: dashboardData.totalCategorias,
      suppliersCount: 0 // Não disponível na API
    };
  }

  /**
   * Busca produtos e converte para o formato do componente
   */
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
      
      // Se não há produtos, retorna uma mensagem informativa
      const message = products.length === 0 ? 'Nenhum produto encontrado no estoque.' : undefined;
      
      return { products, stats, message };
    } catch (error) {
      console.error('Erro ao processar dados do estoque:', error);
      throw error;
    }
  }
}
