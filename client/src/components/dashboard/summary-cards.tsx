import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, ArrowDown, ArrowUp, PiggyBank, TrendingUp, TrendingDown } from "lucide-react";

interface DashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  monthlySavings: number;
}

export function SummaryCards() {
  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary"],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            Erro ao carregar dados
          </CardContent>
        </Card>
      </div>
    );
  }

  const savingsPercentage = summary.totalIncome > 0 
    ? (summary.monthlySavings / summary.totalIncome) * 100 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Balance */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.totalBalance)}
              </p>
              <p className="text-sm text-success-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Patrimônio atual
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Income */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receitas do Mês</p>
              <p className="text-2xl font-bold text-success-600">
                {formatCurrency(summary.totalIncome)}
              </p>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <ArrowDown className="h-3 w-3 mr-1 text-success-600" />
                {new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="w-12 h-12 bg-success-600/10 rounded-lg flex items-center justify-center">
              <ArrowDown className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Expenses */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Despesas do Mês</p>
              <p className="text-2xl font-bold text-error-600">
                {formatCurrency(summary.totalExpenses)}
              </p>
              <p className="text-sm text-error-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Gastos mensais
              </p>
            </div>
            <div className="w-12 h-12 bg-error-600/10 rounded-lg flex items-center justify-center">
              <ArrowUp className="h-6 w-6 text-error-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Savings */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Economia</p>
              <p className={`text-2xl font-bold ${
                summary.monthlySavings >= 0 ? 'text-success-600' : 'text-error-600'
              }`}>
                {formatCurrency(summary.monthlySavings)}
              </p>
              <p className="text-sm text-success-600 flex items-center mt-1">
                <PiggyBank className="h-3 w-3 mr-1" />
                {savingsPercentage.toFixed(1)}% da receita
              </p>
            </div>
            <div className="w-12 h-12 bg-success-600/10 rounded-lg flex items-center justify-center">
              <PiggyBank className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
