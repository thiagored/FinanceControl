import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, Calendar } from "lucide-react";
import type { Account, Transaction } from "@shared/schema";

export default function Forecasts() {
  const [forecastPeriod, setForecastPeriod] = useState("12");

  const { data: accounts } = useQuery<(Account & { currentBalance: number })[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Generate forecast data based on historical transactions
  const generateForecastData = () => {
    if (!transactions || !accounts) return [];

    const months = parseInt(forecastPeriod);
    const currentDate = new Date();
    const data = [];

    // Calculate average monthly income and expenses from last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentTransactions = transactions.filter(t => 
      new Date(t.date) >= threeMonthsAgo
    );

    const monthlyIncome = recentTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + Number(t.value), 0) / 3;

    const monthlyExpenses = recentTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + Number(t.value), 0) / 3;

    // Get current total balance
    const currentBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

    let runningBalance = currentBalance;

    for (let i = 0; i < months; i++) {
      const month = new Date(currentDate);
      month.setMonth(month.getMonth() + i);
      
      // Add some variation to make it more realistic
      const incomeVariation = (Math.random() - 0.5) * 0.2; // ±10% variation
      const expenseVariation = (Math.random() - 0.5) * 0.3; // ±15% variation
      
      const projectedIncome = monthlyIncome * (1 + incomeVariation);
      const projectedExpenses = monthlyExpenses * (1 + expenseVariation);
      
      runningBalance += projectedIncome - projectedExpenses;

      data.push({
        month: month.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        balance: Math.round(runningBalance),
        income: Math.round(projectedIncome),
        expenses: Math.round(projectedExpenses),
        netFlow: Math.round(projectedIncome - projectedExpenses)
      });
    }

    return data;
  };

  const forecastData = generateForecastData();
  const currentBalance = accounts?.reduce((sum, acc) => sum + acc.currentBalance, 0) || 0;
  const finalBalance = forecastData.length > 0 ? forecastData[forecastData.length - 1].balance : currentBalance;
  const projectedGrowth = ((finalBalance - currentBalance) / currentBalance) * 100;

  // Find months with negative balance
  const negativeMonths = forecastData.filter(month => month.balance < 0);
  const firstNegativeMonth = negativeMonths.length > 0 ? negativeMonths[0] : null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Previsões Financeiras</h1>
              <p className="text-gray-500">Projeções baseadas no histórico de transações</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 meses</SelectItem>
                  <SelectItem value="12">12 meses</SelectItem>
                  <SelectItem value="24">24 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Saldo Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(currentBalance)}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Patrimônio atual
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Projeção Final</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${finalBalance >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                  {formatCurrency(finalBalance)}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Em {forecastPeriod} meses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Crescimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold flex items-center ${
                  projectedGrowth >= 0 ? 'text-success-600' : 'text-error-600'
                }`}>
                  {projectedGrowth >= 0 ? (
                    <TrendingUp className="h-5 w-5 mr-1" />
                  ) : (
                    <TrendingDown className="h-5 w-5 mr-1" />
                  )}
                  {Math.abs(projectedGrowth).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Variação projetada
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alerta</CardTitle>
              </CardHeader>
              <CardContent>
                {firstNegativeMonth ? (
                  <div className="text-error-600">
                    <div className="flex items-center text-sm font-medium mb-1">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Saldo negativo
                    </div>
                    <p className="text-xs text-gray-500">
                      Em {firstNegativeMonth.month}
                    </p>
                  </div>
                ) : (
                  <div className="text-success-600">
                    <div className="flex items-center text-sm font-medium mb-1">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Saldo positivo
                    </div>
                    <p className="text-xs text-gray-500">
                      Durante todo período
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Balance Projection Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução do Saldo</CardTitle>
                <p className="text-sm text-gray-500">Projeção mensal do patrimônio</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), 'Saldo']}
                      labelFormatter={(label) => `Mês: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Income vs Expenses Projection */}
            <Card>
              <CardHeader>
                <CardTitle>Receitas vs Despesas</CardTitle>
                <p className="text-sm text-gray-500">Projeção mensal de fluxo de caixa</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip 
                      formatter={(value, name) => [
                        formatCurrency(Number(value)), 
                        name === 'income' ? 'Receitas' : 'Despesas'
                      ]}
                      labelFormatter={(label) => `Mês: ${label}`}
                    />
                    <Legend 
                      formatter={(value) => value === 'income' ? 'Receitas' : 'Despesas'}
                    />
                    <Bar dataKey="income" fill="hsl(var(--success-500))" />
                    <Bar dataKey="expenses" fill="hsl(var(--error-500))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Forecast Table */}
          <Card>
            <CardHeader>
              <CardTitle>Previsão Detalhada</CardTitle>
              <p className="text-sm text-gray-500">
                Valores projetados mês a mês
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Mês</th>
                      <th className="text-right py-3 px-4">Receitas</th>
                      <th className="text-right py-3 px-4">Despesas</th>
                      <th className="text-right py-3 px-4">Saldo Líquido</th>
                      <th className="text-right py-3 px-4">Saldo Acumulado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastData.map((month, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {month.month}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-success-600 font-medium">
                          {formatCurrency(month.income)}
                        </td>
                        <td className="py-3 px-4 text-right text-error-600 font-medium">
                          {formatCurrency(month.expenses)}
                        </td>
                        <td className={`py-3 px-4 text-right font-medium ${
                          month.netFlow >= 0 ? 'text-success-600' : 'text-error-600'
                        }`}>
                          {formatCurrency(month.netFlow)}
                        </td>
                        <td className={`py-3 px-4 text-right font-bold ${
                          month.balance >= 0 ? 'text-gray-900' : 'text-error-600'
                        }`}>
                          {formatCurrency(month.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
