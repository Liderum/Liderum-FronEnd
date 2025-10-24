import React from 'react';
import { API_CONFIG, getApiConfig } from '@/config/api';

/**
 * Exemplo de como usar o sistema de configuração de ambientes
 * Este componente demonstra como acessar as configurações de API
 * baseadas no ambiente atual.
 */
export const EnvironmentExample: React.FC = () => {
  // Obtém a configuração atual baseada no ambiente
  const currentConfig = getApiConfig();
  
  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Configuração de Ambiente</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">URLs das APIs:</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Autenticação:</strong> 
              <code className="ml-2 bg-gray-200 px-2 py-1 rounded">
                {currentConfig.AUTH.BASE_URL}
              </code>
            </li>
            <li>
              <strong>Financeiro:</strong> 
              <code className="ml-2 bg-gray-200 px-2 py-1 rounded">
                {currentConfig.FINANCIAL.BASE_URL}
              </code>
            </li>
            <li>
              <strong>Faturamento:</strong> 
              <code className="ml-2 bg-gray-200 px-2 py-1 rounded">
                {currentConfig.BILLING.BASE_URL}
              </code>
            </li>
            <li>
              <strong>Estoque:</strong> 
              <code className="ml-2 bg-gray-200 px-2 py-1 rounded">
                {currentConfig.INVENTORY.BASE_URL}
              </code>
            </li>
            <li>
              <strong>Usuários:</strong> 
              <code className="ml-2 bg-gray-200 px-2 py-1 rounded">
                {currentConfig.USERS.BASE_URL}
              </code>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Como usar em serviços:</h3>
          <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
{`import { inventoryApi } from '@/services/api/apiFactory';

// A instância já vem configurada com a URL correta
const response = await inventoryApi.get('/api/Produtos');`}
          </pre>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Como usar diretamente:</h3>
          <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
{`import { API_CONFIG } from '@/config/api';

// Acessa a configuração atual
const authUrl = API_CONFIG.AUTH.BASE_URL;`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentExample;
