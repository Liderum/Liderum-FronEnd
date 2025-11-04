// Types for Management Module

export interface Company {
  id: number;
  razaoSocial: string;
  nomeFantasia: string;
  documento: string;
  rowVersion?: string;
}

export interface CreateCompanyDto {
  razaoSocial?: string;
  nomeFantasia?: string;
  documento?: string;
}

export interface UpdateCompanyDto {
  razaoSocial?: string;
  nomeFantasia?: string;
  documento?: string;
  rowVersion?: string;
}

export interface Customer {
  id: number;
  nome: string;
  documento: string;
  email: string;
  rowVersion?: string;
}

export interface CreateCustomerDto {
  nome?: string;
  documento?: string;
  email?: string;
}

export interface UpdateCustomerDto {
  nome?: string;
  documento?: string;
  email?: string;
  rowVersion?: string;
}

export interface Supplier {
  id: number;
  nome: string;
  documento: string;
  email: string;
  rowVersion?: string;
}

export interface CreateSupplierDto {
  nome?: string;
  documento?: string;
  email?: string;
}

export interface UpdateSupplierDto {
  nome?: string;
  documento?: string;
  email?: string;
  rowVersion?: string;
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

