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

