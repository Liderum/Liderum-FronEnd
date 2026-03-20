import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, BarChart3, FileText, Plus, RefreshCw } from 'lucide-react';
import { DEFAULT_LOAD_ERROR_MESSAGE } from '@/lib/errorMessages';

interface Invoice {
  id: string;
  number: string;
  customer: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  dueDate: string;
}

export function Billing() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/billing/invoices');
      setInvoices(response.data);
    } catch (err) {
      setError(DEFAULT_LOAD_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <RefreshCw className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-border shadow-none">
        <CardContent className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={loadInvoices}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6 text-foreground">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Financeiro</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <BarChart3 className="h-5 w-5 text-primary" />
            Faturamento
          </h1>
        </div>
        <Button asChild>
          <Link to="/billing/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Fatura
          </Link>
        </Button>
      </div>

      <Card className="border-border shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lista de Faturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0">
                        Número
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold">
                        Cliente
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold">
                        Valor
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold">
                        Vencimento
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold">
                        Status
                      </th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                          {invoice.number}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                          {invoice.customer}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                          R$ {invoice.amount.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <Badge className={getStatusColor(invoice.status)}>
                            {getStatusText(invoice.status)}
                          </Badge>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <Link
                            to={`/billing/${invoice.id}`}
                            className="text-primary hover:underline"
                          >
                            Ver detalhes
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 