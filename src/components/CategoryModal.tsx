import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, ArrowLeft, Loader2, CheckCircle, XCircle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CategoryService } from '../services/categoryService';
import { CategoriaDto, CategoriaRequest } from '../types/category';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');
.cm-overlay{position:fixed;inset:0;background:rgba(26,24,20,0.45);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:16px;z-index:60;font-family:'DM Sans',sans-serif;}
.cm-card{background:#fff;border-radius:10px;border:1px solid rgba(26,24,20,0.10);box-shadow:0 8px 40px rgba(26,24,20,0.14);width:100%;max-width:380px;position:relative;overflow:hidden;}
.cm-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#B8922A,#D4A843);}
.cm-close{position:absolute;top:10px;right:10px;width:26px;height:26px;border-radius:6px;border:1px solid rgba(26,24,20,0.08);background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#7A7670;transition:all 0.15s;}
.cm-close:hover{background:#F7F4EF;color:#1A1814;}
.cm-header{padding:20px 20px 14px;text-align:center;}
.cm-ico{width:42px;height:42px;border-radius:50%;background:#F0E4C4;border:1.5px solid rgba(184,146,42,0.2);display:flex;align-items:center;justify-content:center;margin:0 auto 10px;}
.cm-title{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:700;color:#1A1814;margin-bottom:3px;}
.cm-desc{font-size:12px;color:#7A7670;line-height:1.5;}
.cm-body{padding:0 20px 18px;}
.cm-option{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid rgba(26,24,20,0.09);border-radius:8px;cursor:pointer;transition:all 0.16s;background:#fff;width:100%;font-family:'DM Sans',sans-serif;text-align:left;margin-bottom:8px;}
.cm-option:hover{border-color:#B8922A;background:rgba(184,146,42,0.03);}
.cm-option-ico{width:32px;height:32px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.cm-option-label{font-size:12.5px;font-weight:500;color:#1A1814;}
.cm-option-desc{font-size:11px;color:#7A7670;margin-top:1px;}
.cm-field{display:flex;flex-direction:column;gap:4px;margin-bottom:10px;}
.cm-lbl{font-size:11px;font-weight:500;color:#3D3A34;}
.cm-btn-row{display:flex;gap:8px;margin-top:6px;}
.cm-btn{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:7px 14px;border-radius:7px;font-size:12px;font-weight:500;font-family:'DM Sans',sans-serif;border:none;cursor:pointer;transition:all 0.18s;}
.cm-btn-dark{background:#1A1814;color:#fff;}
.cm-btn-dark:hover:not(:disabled){background:#B8922A;}
.cm-btn-outline{background:#fff;color:#1A1814;border:1px solid rgba(26,24,20,0.10);}
.cm-btn-outline:hover:not(:disabled){border-color:#B8922A;color:#B8922A;}
.cm-btn:disabled{opacity:0.5;cursor:not-allowed;}
.cm-center{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px 0;gap:8px;}
.cm-err{font-size:11.5px;color:#C0392B;text-align:center;padding:4px 0;}
`;

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
  const [newCategory, setNewCategory] = useState<CategoriaRequest>({ nome: '', descricao: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && step === 'select') loadCategories();
  }, [isOpen, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await CategoryService.getCategories();
      setCategories(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar categorias';
      setError(msg);
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.nome.trim()) {
      toast({ title: "Erro", description: "Nome da categoria é obrigatório", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      setError('');
      const created = await CategoryService.createCategory(newCategory);
      toast({ title: "Sucesso", description: "Categoria criada com sucesso", variant: "default" });
      onCategorySelected(created);
      handleClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar categoria';
      setError(msg);
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleSelectCategory = () => {
    const selected = categories.find(c => c.id === selectedCategoryId);
    if (selected) { onCategorySelected(selected); handleClose(); }
  };

  const handleClose = () => {
    setStep('initial');
    setSelectedCategoryId('');
    setNewCategory({ nome: '', descricao: '' });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className="cm-overlay" onClick={handleClose}>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cm-card">
              <button className="cm-close" onClick={handleClose}><X size={13} /></button>

              <div className="cm-header">
                <div className="cm-ico"><Package size={18} color="#B8922A" /></div>
                <div className="cm-title">
                  {step === 'initial' && 'Selecionar Categoria'}
                  {step === 'select' && 'Categorias Disponíveis'}
                  {step === 'create' && 'Nova Categoria'}
                </div>
                <div className="cm-desc">
                  {step === 'initial' && 'Escolha uma categoria existente ou crie uma nova'}
                  {step === 'select' && 'Selecione uma categoria para o produto'}
                  {step === 'create' && 'Preencha os dados da nova categoria'}
                </div>
              </div>

              <div className="cm-body">

                {/* Inicial */}
                {step === 'initial' && (
                  <>
                    <button className="cm-option" onClick={() => setStep('select')}>
                      <div className="cm-option-ico" style={{ background: '#F0E4C4' }}>
                        <Package size={14} color="#B8922A" />
                      </div>
                      <div>
                        <div className="cm-option-label">Selecionar Existente</div>
                        <div className="cm-option-desc">Escolher entre categorias já cadastradas</div>
                      </div>
                    </button>
                    <button className="cm-option" onClick={() => setStep('create')}>
                      <div className="cm-option-ico" style={{ background: '#E8F5E9' }}>
                        <Plus size={14} color="#1E8449" />
                      </div>
                      <div>
                        <div className="cm-option-label">Criar Nova Categoria</div>
                        <div className="cm-option-desc">Cadastrar uma nova categoria</div>
                      </div>
                    </button>
                  </>
                )}

                {/* Selecionar */}
                {step === 'select' && (
                  <>
                    {loading ? (
                      <div className="cm-center">
                        <Loader2 size={22} color="#B8922A" className="animate-spin" />
                        <span style={{ fontSize: 12, color: '#7A7670' }}>Carregando categorias...</span>
                      </div>
                    ) : error ? (
                      <div className="cm-center">
                        <XCircle size={22} color="#C0392B" />
                        <span style={{ fontSize: 12, color: '#C0392B' }}>{error}</span>
                        <button className="cm-btn cm-btn-outline" style={{ flex: 'none', marginTop: 4 }} onClick={loadCategories}>Tentar Novamente</button>
                      </div>
                    ) : (
                      <>
                        <div className="cm-field">
                          <label className="cm-lbl">Categoria</label>
                          <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                            <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  <div>
                                    <div style={{ fontWeight: 500 }}>{cat.nome}</div>
                                    {cat.descricao && <div style={{ fontSize: 11, color: '#7A7670' }}>{cat.descricao}</div>}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="cm-btn-row">
                          <button className="cm-btn cm-btn-outline" onClick={() => setStep('initial')}>
                            <ArrowLeft size={12} /> Voltar
                          </button>
                          <button className="cm-btn cm-btn-dark" onClick={handleSelectCategory} disabled={!selectedCategoryId}>
                            Continuar
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* Criar */}
                {step === 'create' && (
                  <>
                    <div className="cm-field">
                      <label className="cm-lbl">Nome da Categoria *</label>
                      <Input placeholder="Ex: Eletrônicos" value={newCategory.nome} onChange={(e) => setNewCategory({ ...newCategory, nome: e.target.value })} disabled={loading} />
                    </div>
                    <div className="cm-field">
                      <label className="cm-lbl">Descrição</label>
                      <Textarea placeholder="Descreva a categoria..." value={newCategory.descricao} onChange={(e) => setNewCategory({ ...newCategory, descricao: e.target.value })} disabled={loading} rows={3} />
                    </div>
                    {error && <div className="cm-err">{error}</div>}
                    <div className="cm-btn-row">
                      <button className="cm-btn cm-btn-outline" onClick={() => setStep('initial')} disabled={loading}>
                        <ArrowLeft size={12} /> Voltar
                      </button>
                      <button className="cm-btn cm-btn-dark" onClick={handleCreateCategory} disabled={loading || !newCategory.nome.trim()}>
                        {loading ? <><Loader2 size={12} className="animate-spin" />Salvando...</> : <><CheckCircle size={12} />Salvar</>}
                      </button>
                    </div>
                  </>
                )}

              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
