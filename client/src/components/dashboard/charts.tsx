import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  transactionsByCategory: Array<{
    categoryId: number;
    categoryName: string;
    total: number;
  }>;
}

export function Charts() {
  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary"],
  });

  // Mock data for the line chart (last 6 months)
  const incomeExpensesData = [
    { month: 'Jun', receitas: 7500, despesas: 5200 },
    { month: 'Jul', receitas: 8200, despesas: 6100 },
    { month: 'Ago', receitas: 7800, despesas: 5800 },
    { month: 'Set', receitas: 8500, despesas: 6500 },
    { month: 'Out', receitas: 8100, despesas: 5900 },
    { month: 'Nov', receitas: summary?.totalIncome || 0, despesas: summary?.totalExpenses || 0 },
  ];

  const categoryColors = [
    '#1976D2', '#4CAF50', '#FF9800', '#9C27B0', '#607D8B',
    '#F44336', '#00BCD4', '#8BC34A', '#FFEB3B', '#795548'
  ];

  const categoryData = summary?.transactionsByCategory.map((category, index) => ({
    name: category.categoryName,
    value: category.total,
    color: categoryColors[index % categoryColors.length]
  })) || [];

  if (isLoading) {
    return (
      <>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <>
      {/* Income vs Expenses Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Receitas x Despesas</CardTitle>
          <p className="text-sm text-gray-500">Últimos 6 meses</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={incomeExpensesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="receitas" 
                stroke="#4CAF50" 
                strokeWidth={2}
                name="Receitas"
              />
              <Line 
                type="monotone" 
                dataKey="despesas" 
                stroke="#F44336" 
                strokeWidth={2}
                name="Despesas"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Gastos por Categoria</CardTitle>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
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
            <div className="h-64 flex items-center justify-center text-gray-500">
              Nenhuma despesa cadastrada este mês
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
