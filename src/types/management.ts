// Types for Management Module

export interface Company {
  id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
}

export interface CreateCompanyDto {
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
}

export interface UpdateCompanyDto {
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
}

export interface Customer {
  id: string;
  companyId: string;
  name: string;
  cpf?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface CreateCustomerDto {
  name: string;
  cpf?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface UpdateCustomerDto {
  name: string;
  cpf?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  companyId: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  category?: string;
  notes?: string;
}

export interface CreateSupplierDto {
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  category?: string;
  notes?: string;
}

export interface UpdateSupplierDto {
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  category?: string;
  notes?: string;
}

export type MaterialUnit = 'saco' | 'm3' | 'm2' | 'kg' | 'un' | 'lata' | 'barra' | 'rolo' | 'litro' | 'ton';
export type MaterialCategory = 'Estrutura' | 'Acabamento' | 'Hidraulica' | 'Eletrica' | 'Ferramentas' | 'EPI' | 'Outros';

export interface Material {
  id: string;
  companyId: string;
  code: string;
  name: string;
  unit: MaterialUnit | string;
  category?: MaterialCategory | string;
  brand?: string;
  description?: string;
  defaultSupplierId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMaterialDto {
  name: string;
  unit: MaterialUnit | string;
  category?: MaterialCategory | string;
  brand?: string;
  description?: string;
  defaultSupplierId?: string;
}

export interface UpdateMaterialDto {
  name: string;
  unit: MaterialUnit | string;
  category?: MaterialCategory | string;
  brand?: string;
  description?: string;
  defaultSupplierId?: string;
}

export interface Profile {
  id?: number;
  name?: string;
  phone?: string;
  cnpj?: string;
  email?: string;
  rowVersion?: string;
}

export interface UpdateMyProfileDto {
  name?: string;
  phone?: string;
  cnpj?: string;
  email?: string;
  rowVersion?: string;
}

