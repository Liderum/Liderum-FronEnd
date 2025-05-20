
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="border-b py-4 px-6 bg-white sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to="/" className="font-bold text-2xl text-primary">Liderum</Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <a href="/#funcionalidades" className="text-sm font-medium hover:text-primary transition-colors">
            Funcionalidades
          </a>
          <a href="/#modulos" className="text-sm font-medium hover:text-primary transition-colors">
            Módulos
          </a>
          <a href="/#beneficios" className="text-sm font-medium hover:text-primary transition-colors">
            Benefícios
          </a>
          <Link to="/cadastros" className="text-sm font-medium hover:text-primary transition-colors">
            Cadastros
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="hidden sm:inline-flex" asChild>
            <Link to="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link to="/cadastro">Comece Agora</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
