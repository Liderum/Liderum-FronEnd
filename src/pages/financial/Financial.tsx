import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownCircle, ArrowUpCircle, BarChart3, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { DEFAULT_LOAD_ERROR_MESSAGE } from '@/lib/errorMessages';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

export function Financial() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/financial/transactions');
      setTransactions(response.data);
    } catch (err) {
      setError(DEFAULT_LOAD_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
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
          <Button variant="outline" onClick={loadTransactions}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 text-foreground">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Financeiro</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <BarChart3 className="h-5 w-5 text-primary" />
            Fluxo Financeiro
          </h1>
        </div>
        <Button asChild>
          <Link to="/financial/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Transação
          </Link>
        </Button>
      </div>

      <Card className="border-border shadow-none">
        <CardHeader>
          <CardTitle>Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-border">
              {transactions.map((transaction) => (
                <li key={transaction.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      {transaction.type === 'income' ? (
                        <ArrowUpCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        transaction.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'} R${' '}
                      {Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 