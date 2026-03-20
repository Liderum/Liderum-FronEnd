import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Package, Tag } from "lucide-react";
import { CategoryModal } from '../../components/CategoryModal';
import { ProductForm } from './NewProduct';
import { CategoriaDto } from '../../types/category';

const LDCSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');
:root{--cream:#F7F4EF;--cream2:#EDE9E1;--ink:#1A1814;--ink2:#3D3A34;--ink3:#7A7670;--gold:#B8922A;--gold2:#D4A843;--gold-light:#F0E4C4;--bdr:rgba(26,24,20,0.11);}
.ld{font-family:'DM Sans',sans-serif;color:var(--ink);}
.ld-select-screen{min-height:60vh;display:flex;align-items:center;justify-content:center;}
.ld-select-card{background:#fff;border-radius:14px;border:1px solid var(--bdr);box-shadow:0 4px 30px rgba(26,24,20,0.08);padding:40px 36px;max-width:400px;width:100%;text-align:center;position:relative;overflow:hidden;}
.ld-select-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));}
.ld-select-ico{width:64px;height:64px;border-radius:50%;background:var(--gold-light);border:2px solid rgba(184,146,42,0.2);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;}
.ld-select-h{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:700;color:var(--ink);margin-bottom:8px;}
.ld-select-sub{font-size:13px;color:var(--ink3);line-height:1.6;margin-bottom:24px;}
.ld-btn{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:7px;font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;border:none;cursor:pointer;transition:all 0.2s;justify-content:center;width:100%;}
.ld-btn-dark{background:var(--ink);color:#fff;}
.ld-btn-dark:hover{background:var(--gold);}
.ld-btn-outline{background:#fff;color:var(--ink);border:1px solid var(--bdr);margin-top:10px;}
.ld-btn-outline:hover{border-color:var(--gold);color:var(--gold);}
@keyframes ld-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.ld-a1{animation:ld-in 0.45s cubic-bezier(0.22,1,0.36,1) both;}
`;

export function NewProductPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoriaDto | null>(null);

  React.useEffect(() => {
    if (location.state?.category) {
      setSelectedCategory(location.state.category);
    } else {
      setShowCategoryModal(true);
    }
  }, [location.state]);

  const handleCategorySelected = (category: CategoriaDto) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
  };

  const handleBackToInventory = () => navigate('/inventory');

  if (!selectedCategory) {
    return (
      <>
        <style>{LDCSS}</style>
        <div className="ld ld-select-screen">
          <div className="ld-select-card ld-a1">
            <div className="ld-select-ico">
              <Package size={28} color="var(--gold)" />
            </div>
            <h2 className="ld-select-h">Novo Produto</h2>
            <p className="ld-select-sub">
              Para cadastrar um produto, primeiro selecione a categoria à qual ele pertence.
            </p>
            <button className="ld-btn ld-btn-dark" onClick={() => setShowCategoryModal(true)}>
              <Tag size={14} />
              Selecionar Categoria
            </button>
            <button className="ld-btn ld-btn-outline" onClick={handleBackToInventory}>
              <ArrowLeft size={14} />
              Voltar ao Estoque
            </button>
          </div>

          <CategoryModal
            isOpen={showCategoryModal}
            onClose={() => setShowCategoryModal(false)}
            onCategorySelected={handleCategorySelected}
          />
        </div>
      </>
    );
  }

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
