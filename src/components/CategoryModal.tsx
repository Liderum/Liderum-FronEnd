import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { 
  Package, 
  Plus, 
  ArrowLeft, 
  Loader2,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { CategoryService } from '../services/categoryService';
import { CategoriaDto, CategoriaRequest } from '../types/category';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelected: (category: CategoriaDto) => void;
}

type ModalStep = 'initial' | 'select' | 'create';

export function CategoryModal({ isOpen, onClose, onCategorySelected }: CategoryModalProps) {
  const [step, setStep] = useState<ModalStep>('initial');
  const [categories, setCategories] = useState<CategoriaDto[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [newCategory, setNewCategory] = useState<CategoriaRequest>({
    nome: '',
    descricao: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  // Carrega categorias quando abre o modal
  useEffect(() => {
    if (isOpen && step === 'select') {
      loadCategories();
    }
  }, [isOpen, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await CategoryService.getCategories();
      setCategories(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar categorias';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Cria a categoria e obtém os dados completos (incluindo ID)
      const createdCategory = await CategoryService.createCategory(newCategory);
      
      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso",
        variant: "default",
      });

      // Redireciona imediatamente com a categoria criada (com ID real)
      onCategorySelected(createdCategory);
      handleClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar categoria';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = () => {
    const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
    if (selectedCategory) {
      onCategorySelected(selectedCategory);
      handleClose();
    }
  };

  const handleClose = () => {
    setStep('initial');
    setSelectedCategoryId('');
    setNewCategory({ nome: '', descricao: '' });
    setError('');
    onClose();
  };

  const handleBack = () => {
    setStep('initial');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Package className="h-12 w-12 text-blue-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {step === 'initial' && 'Selecionar Categoria'}
              {step === 'select' && 'Categorias Disponíveis'}
              {step === 'create' && 'Nova Categoria'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {step === 'initial' && 'Escolha uma categoria existente ou crie uma nova'}
              {step === 'select' && 'Selecione uma categoria para o produto'}
              {step === 'create' && 'Preencha os dados da nova categoria'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Passo inicial */}
            {step === 'initial' && (
              <div className="space-y-4">
                <Button
                  onClick={() => setStep('select')}
                  className="w-full h-12 text-left justify-start"
                  variant="outline"
                >
                  <div className="flex items-center">
                    <Package className="h-5 w-5 mr-3 text-blue-500" />
                    <div>
                      <div className="font-medium">Selecionar Categoria Existente</div>
                      <div className="text-sm text-gray-500">Escolher entre categorias já cadastradas</div>
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => setStep('create')}
                  className="w-full h-12 text-left justify-start"
                  variant="outline"
                >
                  <div className="flex items-center">
                    <Plus className="h-5 w-5 mr-3 text-green-500" />
                    <div>
                      <div className="font-medium">Incluir Nova Categoria</div>
                      <div className="text-sm text-gray-500">Criar uma nova categoria</div>
                    </div>
                  </div>
                </Button>
              </div>
            )}

            {/* Passo de seleção */}
            {step === 'select' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Carregando categorias...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <XCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={loadCategories} variant="outline" size="sm">
                      Tentar Novamente
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              <div>
                                <div className="font-medium">{category.nome}</div>
                                <div className="text-sm text-gray-500">{category.descricao}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex space-x-3">
                      <Button onClick={handleBack} variant="outline" className="flex-1">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                      </Button>
                      <Button 
                        onClick={handleSelectCategory} 
                        className="flex-1"
                        disabled={!selectedCategoryId}
                      >
                        Continuar
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Passo de criação */}
            {step === 'create' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome da Categoria *</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Eletrônicos"
                    value={newCategory.nome}
                    onChange={(e) => setNewCategory({ ...newCategory, nome: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descreva a categoria..."
                    value={newCategory.descricao}
                    onChange={(e) => setNewCategory({ ...newCategory, descricao: e.target.value })}
                    disabled={loading}
                    rows={3}
                  />
                </div>

                {error && (
                  <div className="text-center py-2">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button onClick={handleBack} variant="outline" className="flex-1" disabled={loading}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleCreateCategory} 
                    className="flex-1"
                    disabled={loading || !newCategory.nome.trim()}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
