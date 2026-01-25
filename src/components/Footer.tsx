
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white text-gray-900 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Liderum</h3>
            <p className="text-gray-600">
              Solução completa para gestão empresarial, transformando dados em resultados para o seu negócio.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Módulos</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Cadastros</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Vendas</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Estoque</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Financeiro</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Recursos</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Demonstração</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Documentação</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Suporte</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Contato</h4>
            <ul className="space-y-2">
              <li className="text-gray-600">(11) 9999-9999</li>
              <li className="text-gray-600">contato@liderum.com</li>
              <li className="text-gray-600">São Paulo, SP</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-blue-100/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Liderum. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Termos</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Privacidade</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
