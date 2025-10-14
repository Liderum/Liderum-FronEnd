// Tipos para categorias
export interface CategoriaDto {
  id: string;
  nome: string;
  descricao: string;
  dataCadastro: string;
}

export interface CategoriaRequest {
  nome: string;
  descricao: string;
}

export interface ProdutoRequest {
  nome: string;
  sku: string;
  precoCusto: number;
  precoVenda: number;
  quantidadeEstoque: number;
  quantidadeMinima: number;
  unidadeMedida: string;
  marca: string;
  categoriaId: string;
}

// Resposta da API para categorias
export interface CategoriaApiResponse {
  statusCode: number;
  message: string;
  data: CategoriaDto[];
  error: null | string;
  isSuccess: boolean;
}

// Resposta da API para criação de categoria
export interface CategoriaCreateResponse {
  statusCode: number;
  message: string;
  data: null;
  error: null | string;
  isSuccess: boolean;
}

// Resposta da API para criação de produto
export interface ProdutoCreateResponse {
  statusCode: number;
  message: string;
  data: null;
  error: null | string;
  isSuccess: boolean;
}
