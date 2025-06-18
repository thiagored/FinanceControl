import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from "recharts";
import { FileText, Download, Filter, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import type { Transaction, Account, Category } from "@shared/schema";

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
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

  // Filter transactions based on selected criteria
  const getFilteredTransactions = () => {
    if (!transactions) return [];

    let filtered = [...transactions];

    // Filter by period
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    switch (selectedPeriod) {
      case "thisMonth":
        filtered = filtered.filter(t => new Date(t.date) >= startOfMonth);
        break;
      case "lastMonth":
        filtered = filtered.filter(t => {
          const date = new Date(t.date);
          return date >= lastMonth && date <= endOfLastMonth;
        });
        break;
      case "thisYear":
        filtered = filtered.filter(t => new Date(t.date) >= startOfYear);
        break;
      case "last3Months":
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        filtered = filtered.filter(t => new Date(t.date) >= threeMonthsAgo);
        break;
    }

    // Filter by account
    if (selectedAccount !== "all") {
      filtered = filtered.filter(t => t.accountId === parseInt(selectedAccount));
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(t => t.categoryId === parseInt(selectedCategory));
    }

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate summary statistics
  const getSummaryStats = () => {
    const income = filteredTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + Number(t.value), 0);

    const expenses = filteredTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + Number(t.value), 0);

    const balance = income - expenses;
    const transactionCount = filteredTransactions.length;

    return { income, expenses, balance, transactionCount };
  };

  const summary = getSummaryStats();

  // Generate category breakdown
  const getCategoryBreakdown = () => {
    const categoryMap = new Map();
    
    filteredTransactions
      .filter(t => t.type === 'despesa')
      .forEach(transaction => {
        const category = categories?.find(c => c.id === transaction.categoryId);
        const categoryName = category?.name || 'Sem categoria';
        
        if (categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, categoryMap.get(categoryName) + Number(transaction.value));
        } else {
          categoryMap.set(categoryName, Number(transaction.value));
        }
      });

    return Array.from(categoryMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
    }));
  };

  const categoryData = getCategoryBreakdown();

  // Generate monthly trend data
  const getMonthlyTrend = () => {
    const monthlyData = new Map();

    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { income: 0, expenses: 0 });
      }

      const data = monthlyData.get(monthKey);
      if (transaction.type === 'receita') {
        data.income += Number(transaction.value);
      } else {
        data.expenses += Number(transaction.value);
      }
    });

    return Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        income: data.income,
        expenses: data.expenses,
        balance: data.income - data.expenses
      }));
  };

  const monthlyTrend = getMonthlyTrend();

  // Generate payment method breakdown
  const getPaymentMethodBreakdown = () => {
    const methodMap = new Map();
    
    filteredTransactions.forEach(transaction => {
      const method = transaction.paymentMethod;
      const methodLabel = {
        'dinheiro': 'Dinheiro',
        'cartao': 'Cartão de Crédito',
        'debito': 'Cartão de Débito',
        'pix': 'PIX'
      }[method] || method;
      
      if (methodMap.has(methodLabel)) {
        methodMap.set(methodLabel, methodMap.get(methodLabel) + Number(transaction.value));
      } else {
        methodMap.set(methodLabel, Number(transaction.value));
      }
    });

    return Array.from(methodMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
  };

  const paymentMethodData = getPaymentMethodBreakdown();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
              <p className="text-gray-500">Análise detalhada das suas finanças</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Período</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thisMonth">Este mês</SelectItem>
                      <SelectItem value="lastMonth">Mês passado</SelectItem>
                      <SelectItem value="last3Months">Últimos 3 meses</SelectItem>
                      <SelectItem value="thisYear">Este ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Conta</label>
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as contas</SelectItem>
                      {accounts?.map((account) => (
                        <SelectItem key={account.id} value={String(account.id)}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Categoria</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Aplicar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total de Receitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success-600">
                  {formatCurrency(summary.income)}
                </div>
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Entradas no período
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total de Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-error-600">
                  {formatCurrency(summary.expenses)}
                </div>
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Saídas no período
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Saldo Líquido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  summary.balance >= 0 ? 'text-success-600' : 'text-error-600'
                }`}>
                  {formatCurrency(summary.balance)}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Resultado do período
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {summary.transactionCount}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Total de movimentações
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analysis */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="categories">Categorias</TabsTrigger>
              <TabsTrigger value="trends">Tendências</TabsTrigger>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gastos por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-80 flex items-center justify-center text-gray-500">
                        Nenhum dado disponível
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Methods */}
                <Card>
                  <CardHeader>
                    <CardTitle>Formas de Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {paymentMethodData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={paymentMethodData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={formatCurrency} />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Bar dataKey="value" fill="hsl(var(--primary))" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-80 flex items-center justify-center text-gray-500">
                        Nenhum dado disponível
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>Análise por Categorias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryData.map((category, index) => {
                      const percentage = (category.value / summary.expenses) * 100;
                      return (
                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <div>
                              <p className="font-medium">{category.name}</p>
                              <p className="text-sm text-gray-500">{percentage.toFixed(1)}% do total</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(category.value)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends">
              <Card>
                <CardHeader>
                  <CardTitle>Tendência Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={formatCurrency} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="income" 
                          stroke="hsl(var(--success-500))" 
                          strokeWidth={2}
                          name="Receitas"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="expenses" 
                          stroke="hsl(var(--error-500))" 
                          strokeWidth={2}
                          name="Despesas"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="balance" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          name="Saldo"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-96 flex items-center justify-center text-gray-500">
                      Nenhum dado disponível para o período selecionado
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Transações Detalhadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4">Data</th>
                          <th className="text-left py-3 px-4">Descrição</th>
                          <th className="text-left py-3 px-4">Categoria</th>
                          <th className="text-left py-3 px-4">Conta</th>
                          <th className="text-left py-3 px-4">Forma Pagamento</th>
                          <th className="text-right py-3 px-4">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.slice(0, 50).map((transaction) => {
                          const category = categories?.find(c => c.id === transaction.categoryId);
                          const account = accounts?.find(a => a.id === transaction.accountId);
                          
                          return (
                            <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">{formatDate(transaction.date)}</td>
                              <td className="py-3 px-4">{transaction.description}</td>
                              <td className="py-3 px-4">{category?.name || '-'}</td>
                              <td className="py-3 px-4">{account?.name || '-'}</td>
                              <td className="py-3 px-4 capitalize">{transaction.paymentMethod}</td>
                              <td className={`py-3 px-4 text-right font-medium ${
                                transaction.type === 'receita' ? 'text-success-600' : 'text-error-600'
                              }`}>
                                {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(Number(transaction.value))}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {filteredTransactions.length > 50 && (
                      <div className="text-center py-4 text-gray-500">
                        Mostrando 50 de {filteredTransactions.length} transações
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
