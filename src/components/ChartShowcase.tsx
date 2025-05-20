
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, 
  Area,
  BarChart, 
  Bar,
  LineChart, 
  Line,
  PieChart, 
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

const data = [
  { name: 'Jan', vendas: 400, despesas: 240 },
  { name: 'Fev', vendas: 300, despesas: 220 },
  { name: 'Mar', vendas: 520, despesas: 280 },
  { name: 'Abr', vendas: 450, despesas: 250 },
  { name: 'Mai', vendas: 600, despesas: 300 },
  { name: 'Jun', vendas: 580, despesas: 290 },
];

const pieData = [
  { name: 'Produto A', value: 35 },
  { name: 'Produto B', value: 25 },
  { name: 'Produto C', value: 20 },
  { name: 'Outros', value: 20 },
];

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

const ChartShowcase = () => {
  return (
    <div className="bg-gray-50 py-20 px-6" id="funcionalidades">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Dashboards e Relatórios</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Visualize os dados da sua empresa através de gráficos interativos e tome decisões estratégicas
            baseadas em informações precisas e atualizadas.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Vendas vs. Despesas</CardTitle>
              <CardDescription>Análise comparativa dos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <defs>
                      <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="vendas" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVendas)" />
                    <Area type="monotone" dataKey="despesas" stroke="#ef4444" fillOpacity={1} fill="url(#colorDespesas)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Vendas por Produto</CardTitle>
              <CardDescription>Participação percentual de cada produto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip />
                    <Legend />
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa</CardTitle>
              <CardDescription>Entradas e saídas mensais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="vendas" fill="#3b82f6" name="Entradas" />
                    <Bar dataKey="despesas" fill="#ef4444" name="Saídas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Desempenho de Vendas</CardTitle>
              <CardDescription>Evolução das vendas ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="vendas" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChartShowcase;
