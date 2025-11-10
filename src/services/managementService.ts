import { managementApi } from './api/apiFactory';
import { extractErrorMessage } from '@/utils/errorHandler';
import {
  Company,
  CreateCompanyDto,
  UpdateCompanyDto,
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
  Profile,
  UpdateMyProfileDto,
} from '@/types/management';

// Companies Service
export class CompanyService {
  static async list(): Promise<Company[]> {
    try {
      const response = await managementApi.get<Company[]>('/liderum/api/Companies');
      return response.data;
    } catch (error) {
      const message = extractErrorMessage(error);
      throw new Error(message);
    }
  }

  static async getById(id: number): Promise<Company> {
    try {
      const response = await managementApi.get<Company>(`/liderum/api/Companies/${id}`);
      return response.data;
    } catch (error) {
      const message = extractErrorMessage(error);
      throw new Error(message);
    }
  }

  static async create(payload: CreateCompanyDto): Promise<Company> {
    try {
      const response = await managementApi.post<Company>('/liderum/api/Companies', payload);
      return response.data;
    } catch (error) {
      const message = extractErrorMessage(error);
      throw new Error(message);
    }
  }

  static async update(id: number, payload: UpdateCompanyDto): Promise<void> {
    try {
      await managementApi.put(`/liderum/api/Companies/${id}`, payload);
    } catch (error) {
      const message = extractErrorMessage(error);
      throw new Error(message);
    }
  }
}

// Customers Service
export class CustomerService {
  static async list(companyId: number): Promise<Customer[]> {
    try {
      const response = await managementApi.get<Customer[]>(
        `/liderum/api/companies/${companyId}/customers`
      );
      return response.data;
    } catch (error) {
      const message = extractErrorMessage(error);
      throw new Error(message);
    }
  }

  static async getById(companyId: number, id: number): Promise<Customer> {
    try {
      const response = await managementApi.get<Customer>(
        `/liderum/api/companies/${companyId}/customers/${id}`
      );
      return response.data;
    } catch (error) {
      const message = extractErrorMessage(error);
      throw new Error(message);
    }
  }

  static async create(companyId: number, payload: CreateCustomerDto): Promise<Customer> {
    try {
      const response = await managementApi.post<Customer>(
        `/liderum/api/companies/${companyId}/customers`,
        payload
      );
      return response.data;
    } catch (error) {
      const message = extractErrorMessage(error);
      throw new Error(message);
    }
  }

  static async update(
    companyId: number,
    id: number,
    payload: UpdateCustomerDto
  ): Promise<void> {
    try {
      await managementApi.put(
        `/liderum/api/companies/${companyId}/customers/${id}`,
        payload
      );
    } catch (error) {
      const message = extractErrorMessage(error);
      throw new Error(message);
    }
  }

  static async delete(companyId: number, id: number): Promise<void> {
    try {
      await managementApi.delete(`/liderum/api/companies/${companyId}/customers/${id}`);
    } catch (error) {
      const message = extractErrorMessage(error);
      throw new Error(message);
    }
  }
}

// Suppliers Service
export class SupplierService {
  static async list(companyId: number): Promise<Supplier[]> {
    try {
      const response = await managementApi.get<Supplier[]>(
        `/liderum/api/companies/${companyId}/suppliers`
      );
      return response.data;
    } catch (error) {
      const message = extractErrorMessage(error);
      throw new Error(message);
    }
  }

  static async getById(companyId: number, id: number): Promise<Supplier> {
    try {
      const response = await managementApi.get<Supplier>(
        `/liderum/api/companies/${companyId}/suppliers/${id}`
      );
      return response.data;
    } catch (error) {
      const message = extractErrorMessage(error);
      throw new Error(message);
    }
  }

  static async create(companyId: number, payload: CreateSupplierDto): Promise<Supplier> {
    try {
      const response = await managementApi.post<Supplier>(
        `/liderum/api/companies/${companyId}/suppliers`,
        payload
      );
      return response.data;
    } catch (error) {
      const message = extractErrorMessage(error);
      throw new Error(message);
    }
  }

  static async update(
    companyId: number,
    id: number,
    payload: UpdateSupplierDto
  ): Promise<void> {
    try {
      await managementApi.put(
        `/liderum/api/companies/${companyId}/suppliers/${id}`,
        payload
      );
    } catch (error) {
      const message = extractErrorMessage(error);
      throw new Error(message);
    }
  }

  static async delete(companyId: number, id: number): Promise<void> {
    try {
      await managementApi.delete(`/liderum/api/companies/${companyId}/suppliers/${id}`);
    } catch (error) {
      const message = extractErrorMessage(error);
      throw new Error(message);
    }
  }
}

// Profile Service
export class ProfileService {
  static async get(): Promise<Profile> {
    try {
      const response = await managementApi.get<Profile>('/liderum/api/Profile');
      return response.data;
    } catch (error) {
      const message = extractErrorMessage(error);
      throw new Error(message);
    }
  }

  static async update(payload: UpdateMyProfileDto): Promise<void> {
    try {
      await managementApi.put('/liderum/api/Profile', payload);
    } catch (error) {
      const message = extractErrorMessage(error);
      throw new Error(message);
    }
  }

  static async updateAvatar(file: File, rowVersion: string): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('Avatar', file);
      formData.append('RowVersion', rowVersion);
      await managementApi.put('/liderum/api/Profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      const message = extractErrorMessage(error);
      throw new Error(message);
    }
  }

  static async deleteAvatar(): Promise<void> {
    try {
      await managementApi.delete('/liderum/api/Profile/avatar');
    } catch (error) {
      const message = extractErrorMessage(error);
      throw new Error(message);
    }
  }
}

