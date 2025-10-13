import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from "framer-motion";
import { ArrowLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryModal } from '../../components/CategoryModal';
import { ProductForm } from './NewProduct';
import { CategoriaDto } from '../../types/category';

export function NewProductPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoriaDto | null>(null);

  // Verifica se veio com categoria pré-selecionada (do modal)
  React.useEffect(() => {
    if (location.state?.category) {
      setSelectedCategory(location.state.category);
    } else {
      // Se não tem categoria, abre o modal
      setShowCategoryModal(true);
    }
  }, [location.state]);

  const handleCategorySelected = (category: CategoriaDto) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
  };

  const handleBackToInventory = () => {
    navigate('/inventory');
  };

  // Se não tem categoria selecionada, mostra tela de seleção
  if (!selectedCategory) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Package className="h-12 w-12 text-blue-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Novo Produto
            </CardTitle>
            <CardDescription className="text-gray-600">
              Primeiro, selecione uma categoria para o produto
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => setShowCategoryModal(true)} className="w-full">
              Selecionar Categoria
            </Button>
            <Button 
              variant="outline" 
              onClick={handleBackToInventory}
              className="w-full mt-3"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Estoque
            </Button>
          </CardContent>
        </Card>

        <CategoryModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onCategorySelected={handleCategorySelected}
        />
      </motion.div>
    );
  }

  // Se tem categoria selecionada, mostra o formulário
  return (
    <>
      <ProductForm selectedCategory={selectedCategory} />
      
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCategorySelected={handleCategorySelected}
      />
    </>
  );
}
