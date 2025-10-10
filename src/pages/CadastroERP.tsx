
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSessionCleanup } from '@/hooks/useSessionCleanup';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Package, FileText, Building, Save } from "lucide-react";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CadastroERP = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('produto');
  
  // Limpa sessão ao acessar página pública
  useSessionCleanup();
  
  const handleSave = (formType: string) => {
    toast({
      title: "Cadastro salvo!",
      description: `${formType} cadastrado com sucesso.`,
      duration: 3000,
    });
  };
  
  console.log("CadastroERP component rendering with activeTab:", activeTab);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-gray-50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">Cadastros</h1>
            <p className="text-lg text-gray-600 mt-2">
              Gerencie todos os cadastros do seu negócio em um só lugar
            </p>
          </div>
          
          <Card className="border-0 shadow-lg">
            <Tabs defaultValue="produto" className="w-full" onValueChange={setActiveTab}>
              <CardHeader className="bg-white rounded-t-lg border-b">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="produto" className="flex items-center gap-2">
                    <Package size={18} />
                    <span className="hidden sm:inline">Produto</span>
                  </TabsTrigger>
                  <TabsTrigger value="servico" className="flex items-center gap-2">
                    <FileText size={18} />
                    <span className="hidden sm:inline">Serviço</span>
                  </TabsTrigger>
                  <TabsTrigger value="empresa" className="flex items-center gap-2">
                    <Building size={18} />
                    <span className="hidden sm:inline">Empresa</span>
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <CardContent className="pt-6">
                <TabsContent value="produto">
                  <CardDescription className="mb-6">
                    Cadastre e gerencie informações detalhadas sobre seus produtos
                  </CardDescription>
                  
                  <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="produtoNome">Nome do produto*</Label>
                        <Input id="produtoNome" placeholder="Digite o nome do produto" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="produtoCodigo">Código interno / SKU*</Label>
                        <Input id="produtoCodigo" placeholder="Ex: PROD001" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="produtoCategoria">Categoria*</Label>
                        <Select>
                          <SelectTrigger id="produtoCategoria">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                            <SelectItem value="moveis">Móveis</SelectItem>
                            <SelectItem value="alimentos">Alimentos</SelectItem>
                            <SelectItem value="vestuario">Vestuário</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="produtoPreco">Preço de venda*</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                            R$
                          </div>
                          <Input id="produtoPreco" className="pl-10" placeholder="0,00" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="produtoUnidade">Unidade de medida*</Label>
                        <Select>
                          <SelectTrigger id="produtoUnidade">
                            <SelectValue placeholder="Selecione uma unidade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="un">Unidade (un)</SelectItem>
                            <SelectItem value="kg">Quilograma (kg)</SelectItem>
                            <SelectItem value="g">Grama (g)</SelectItem>
                            <SelectItem value="l">Litro (l)</SelectItem>
                            <SelectItem value="ml">Mililitro (ml)</SelectItem>
                            <SelectItem value="m">Metro (m)</SelectItem>
                            <SelectItem value="cm">Centímetro (cm)</SelectItem>
                            <SelectItem value="pc">Peça (pc)</SelectItem>
                            <SelectItem value="cx">Caixa (cx)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="produtoEstoque">Estoque atual*</Label>
                        <Input id="produtoEstoque" type="number" placeholder="0" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="produtoDescricao">Descrição</Label>
                      <Textarea 
                        id="produtoDescricao" 
                        placeholder="Descreva detalhes sobre o produto..." 
                        className="min-h-32"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-4 pt-4">
                      <Button variant="outline">Cancelar</Button>
                      <Button 
                        className="gap-2" 
                        onClick={(e) => {
                          e.preventDefault();
                          handleSave('Produto');
                        }}
                      >
                        <Save size={18} />
                        Salvar produto
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="servico">
                  <CardDescription className="mb-6">
                    Cadastre e gerencie os serviços oferecidos pela sua empresa
                  </CardDescription>
                  
                  <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="servicoNome">Nome do serviço*</Label>
                        <Input id="servicoNome" placeholder="Digite o nome do serviço" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="servicoCodigo">
                          Código interno <span className="text-xs text-gray-500">(opcional)</span>
                        </Label>
                        <Input id="servicoCodigo" placeholder="Ex: SERV001" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="servicoCategoria">Categoria*</Label>
                        <Select>
                          <SelectTrigger id="servicoCategoria">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consultoria">Consultoria</SelectItem>
                            <SelectItem value="manutencao">Manutenção</SelectItem>
                            <SelectItem value="treinamento">Treinamento</SelectItem>
                            <SelectItem value="suporte">Suporte técnico</SelectItem>
                            <SelectItem value="design">Design</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="servicoPreco">Preço padrão*</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                            R$
                          </div>
                          <Input id="servicoPreco" className="pl-10" placeholder="0,00" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="servicoDuracao">Duração estimada*</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Input id="servicoDuracao" type="number" placeholder="0" />
                        <Select defaultValue="horas">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minutos">Minutos</SelectItem>
                            <SelectItem value="horas">Horas</SelectItem>
                            <SelectItem value="dias">Dias</SelectItem>
                            <SelectItem value="semanas">Semanas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="servicoDescricao">Descrição</Label>
                      <Textarea 
                        id="servicoDescricao" 
                        placeholder="Descreva detalhes sobre o serviço..." 
                        className="min-h-32"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-4 pt-4">
                      <Button variant="outline">Cancelar</Button>
                      <Button 
                        className="gap-2" 
                        onClick={(e) => {
                          e.preventDefault();
                          handleSave('Serviço');
                        }}
                      >
                        <Save size={18} />
                        Salvar serviço
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="empresa">
                  <CardDescription className="mb-6">
                    Cadastre informações sobre clientes, fornecedores e parceiros de negócios
                  </CardDescription>
                  
                  <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="empresaRazao">Razão social*</Label>
                        <Input id="empresaRazao" placeholder="Digite a razão social" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="empresaNome">Nome fantasia*</Label>
                        <Input id="empresaNome" placeholder="Digite o nome fantasia" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="empresaCNPJ">CNPJ*</Label>
                      <Input id="empresaCNPJ" placeholder="00.000.000/0000-00" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="empresaEndereco">Endereço completo*</Label>
                      <Input id="empresaEndereco" placeholder="Rua, número, bairro" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="empresaCidade">Cidade*</Label>
                        <Input id="empresaCidade" placeholder="Cidade" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="empresaEstado">Estado*</Label>
                        <Select>
                          <SelectTrigger id="empresaEstado">
                            <SelectValue placeholder="UF" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AC">AC</SelectItem>
                            <SelectItem value="AL">AL</SelectItem>
                            <SelectItem value="AP">AP</SelectItem>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="BA">BA</SelectItem>
                            <SelectItem value="CE">CE</SelectItem>
                            <SelectItem value="DF">DF</SelectItem>
                            <SelectItem value="ES">ES</SelectItem>
                            <SelectItem value="GO">GO</SelectItem>
                            <SelectItem value="MA">MA</SelectItem>
                            <SelectItem value="MT">MT</SelectItem>
                            <SelectItem value="MS">MS</SelectItem>
                            <SelectItem value="MG">MG</SelectItem>
                            <SelectItem value="PA">PA</SelectItem>
                            <SelectItem value="PB">PB</SelectItem>
                            <SelectItem value="PR">PR</SelectItem>
                            <SelectItem value="PE">PE</SelectItem>
                            <SelectItem value="PI">PI</SelectItem>
                            <SelectItem value="RJ">RJ</SelectItem>
                            <SelectItem value="RN">RN</SelectItem>
                            <SelectItem value="RS">RS</SelectItem>
                            <SelectItem value="RO">RO</SelectItem>
                            <SelectItem value="RR">RR</SelectItem>
                            <SelectItem value="SC">SC</SelectItem>
                            <SelectItem value="SP">SP</SelectItem>
                            <SelectItem value="SE">SE</SelectItem>
                            <SelectItem value="TO">TO</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="empresaCEP">CEP*</Label>
                        <Input id="empresaCEP" placeholder="00000-000" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="empresaTelefone">Telefone comercial*</Label>
                        <Input id="empresaTelefone" placeholder="(00) 0000-0000" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="empresaEmail">Email de contato*</Label>
                        <Input id="empresaEmail" placeholder="contato@empresa.com" type="email" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="empresaSite">
                        Site <span className="text-xs text-gray-500">(opcional)</span>
                      </Label>
                      <Input id="empresaSite" placeholder="www.empresa.com.br" />
                    </div>
                    
                    <div className="flex justify-end gap-4 pt-4">
                      <Button variant="outline">Cancelar</Button>
                      <Button 
                        className="gap-2" 
                        onClick={(e) => {
                          e.preventDefault();
                          handleSave('Empresa');
                        }}
                      >
                        <Save size={18} />
                        Salvar empresa
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CadastroERP;
