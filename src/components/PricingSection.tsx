import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Users, Package, ShoppingCart, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

const PricingSection = () => {
  const pricingPlans = [
    {
      name: 'Cadastros',
      price: 'R$ 29',
      period: '/mês',
      description: 'Usuários, clientes, fornecedores e produtos.',
      icon: <Users className="h-7 w-7 text-cyan-300" />,
      badge: null,
      features: ['Cadastro de usuários', 'Cadastro de produtos', 'Perfis de acesso', 'Importação em massa'],
      buttonText: 'Começar agora',
      popular: false
    },
    {
      name: 'Vendas',
      price: 'R$ 49',
      period: '/mês',
      description: 'Pedidos, orçamento e emissão no mesmo fluxo.',
      icon: <ShoppingCart className="h-7 w-7 text-emerald-300" />,
      badge: 'Mais escolhido',
      features: ['Pedidos de vendas', 'Orçamentos', 'Notas fiscais', 'Relatórios comerciais'],
      buttonText: 'Escolher plano',
      popular: true
    },
    {
      name: 'Estoque',
      price: 'R$ 39',
      period: '/mês',
      description: 'Controle de nível, giro e reposição.',
      icon: <Package className="h-7 w-7 text-amber-300" />,
      badge: null,
      features: ['Entradas e saídas', 'Inventário', 'Alertas de ruptura', 'Integração com vendas'],
      buttonText: 'Começar agora',
      popular: false
    },
    {
      name: 'Financeiro',
      price: 'Sob consulta',
      period: '',
      description: 'Planejamento, caixa e inteligência financeira.',
      icon: <Wallet className="h-7 w-7 text-fuchsia-300" />,
      badge: 'Em expansão',
      features: ['Contas a pagar/receber', 'Fluxo de caixa', 'Conciliação', 'Visão financeira'],
      buttonText: 'Avisar lançamento',
      popular: false
    }
  ];

  return (
    <section className="bg-slate-950 px-6 py-20" id="precos">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Planos modulares para crescer no seu ritmo</h2>
          <p className="mx-auto mt-3 max-w-3xl text-lg text-slate-300">
            Escolha apenas o que faz sentido agora e evolua com uma arquitetura que não trava sua operação.
          </p>
          <div className="mt-6 inline-flex items-center rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200">
            <Star className="mr-2 h-4 w-4" />
            Sem taxa de instalação • Cancelamento simples
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="relative"
            >
              <Card className={`h-full border-slate-800 bg-slate-900/60 shadow-none ${plan.popular ? 'ring-1 ring-cyan-300/60' : ''}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                    <Badge className={plan.popular ? 'bg-cyan-300 text-slate-950' : 'bg-slate-800 text-slate-200'}>
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-950/70">
                    {plan.icon}
                  </div>
                  <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-slate-300">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="pb-4">
                  <div className="mb-4 text-center">
                    <span className="text-3xl font-semibold text-white">{plan.price}</span>
                    <span className="ml-1 text-slate-400">{plan.period}</span>
                  </div>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-300" />
                        <span className="text-sm text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className={`w-full ${plan.popular ? 'bg-cyan-300 text-slate-950 hover:bg-cyan-200' : 'border-slate-700 bg-slate-950/50 text-slate-100 hover:bg-slate-800'}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center"
        >
          <h4 className="text-xl font-semibold text-white">Escala sem retrabalho de plataforma</h4>
          <div className="mt-4 grid gap-4 text-sm text-slate-300 md:grid-cols-3">
            <div className="inline-flex items-center justify-center">
              <Check className="mr-2 h-4 w-4 text-cyan-300" />
              Setup orientado por operação
            </div>
            <div className="inline-flex items-center justify-center">
              <Check className="mr-2 h-4 w-4 text-cyan-300" />
              Evolução por módulos
            </div>
            <div className="inline-flex items-center justify-center">
              <Check className="mr-2 h-4 w-4 text-cyan-300" />
              Time de suporte especialista
            </div>
          </div>
          <div className="mt-6 inline-flex items-center text-cyan-300">
            <Zap className="mr-2 h-4 w-4" />
            Estrutura pronta para expansão contínua
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
