import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ShoppingCart, Car, Home, Coffee } from "lucide-react";
import type { Transaction } from "@shared/schema";

export function RecentTransactions() {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", { limit: 5 }],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTransactionIcon = (description: string, type: string) => {
    const desc = description.toLowerCase();
    
    if (type === 'receita') {
      return <ArrowDown className="h-5 w-5 text-success-600" />;
    }
    
    if (desc.includes('mercado') || desc.includes('supermercado') || desc.includes('alimentação')) {
      return <ShoppingCart className="h-5 w-5 text-error-600" />;
    }
    if (desc.includes('combustível') || desc.includes('gasolina') || desc.includes('posto')) {
      return <Car className="h-5 w-5 text-warning-600" />;
    }
    if (desc.includes('aluguel') || desc.includes('casa') || desc.includes('moradia')) {
      return <Home className="h-5 w-5 text-blue-600" />;
    }
    if (desc.includes('café') || desc.includes('restaurante') || desc.includes('lanche')) {
      return <Coffee className="h-5 w-5 text-amber-600" />;
    }
    
    return <ArrowUp className="h-5 w-5 text-error-600" />;
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      'dinheiro': 'Dinheiro',
      'cartao': 'Cartão',
      'debito': 'Cartão de Débito',
      'pix': 'PIX'
    };
    return methods[method] || method;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transações Recentes</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary-600">
            Ver todas
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between py-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 ml-auto"></div>
                </div>
              </div>
            ))}
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getTransactionIcon(transaction.description, transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.type === 'receita' ? 'Receita' : 'Despesa'} • {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'receita' ? 'text-success-600' : 'text-error-600'
                  }`}>
                    {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(Number(transaction.value))}
                  </p>
                  <p className="text-xs text-gray-500">{getPaymentMethodLabel(transaction.paymentMethod)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ArrowUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>Nenhuma transação encontrada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
