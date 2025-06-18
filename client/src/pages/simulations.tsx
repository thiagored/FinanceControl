import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Plus, Calculator, Play, Trash2, Eye, EyeOff } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Account, Transaction, Simulation } from "@shared/schema";

interface SimulationFormData {
  name: string;
  type: 'receita' | 'despesa';
  value: string;
  startDate: string;
  endDate: string;
}

export default function Simulations() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeSimulations, setActiveSimulations] = useState<number[]>([]);
  const [formData, setFormData] = useState<SimulationFormData>({
    name: "",
    type: "despesa",
    value: "0",
    startDate: new Date().toISOString().split('T')[0],
    endDate: ""
  });

  const { data: accounts } = useQuery<(Account & { currentBalance: number })[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: simulations, isLoading } = useQuery<Simulation[]>({
    queryKey: ["/api/simulations"],
  });

  const createSimulationMutation = useMutation({
    mutationFn: async (simulationData: any) => {
      const res = await apiRequest("POST", "/api/simulations", simulationData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/simulations"] });
      setIsDialogOpen(false);
      setFormData({
        name: "",
        type: "despesa",
        value: "0",
        startDate: new Date().toISOString().split('T')[0],
        endDate: ""
      });
    },
  });

  const deleteSimulationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/simulations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/simulations"] });
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSimulationMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof SimulationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSimulation = (simulationId: number) => {
    setActiveSimulations(prev => 
      prev.includes(simulationId) 
        ? prev.filter(id => id !== simulationId)
        : [...prev, simulationId]
    );
  };

  // Generate comparison data
  const generateComparisonData = () => {
    if (!transactions || !accounts) return [];

    const months = 12;
    const currentDate = new Date();
    const data = [];

    // Calculate base scenario (without simulations)
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

    const currentBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

    let baseBalance = currentBalance;
    let simulatedBalance = currentBalance;

    for (let i = 0; i < months; i++) {
      const month = new Date(currentDate);
      month.setMonth(month.getMonth() + i);
      
      // Base scenario
      baseBalance += monthlyIncome - monthlyExpenses;

      // Simulated scenario
      let simulatedIncome = monthlyIncome;
      let simulatedExpenses = monthlyExpenses;

      // Apply active simulations
      activeSimulations.forEach(simId => {
        const simulation = simulations?.find(s => s.id === simId);
        if (!simulation) return;

        const simStartDate = new Date(simulation.startDate);
        const simEndDate = simulation.endDate ? new Date(simulation.endDate) : null;

        // Check if simulation is active for this month
        if (month >= simStartDate && (!simEndDate || month <= simEndDate)) {
          if (simulation.type === 'receita') {
            simulatedIncome += Number(simulation.value);
          } else {
            simulatedExpenses += Number(simulation.value);
          }
        }
      });

      simulatedBalance += simulatedIncome - simulatedExpenses;

      data.push({
        month: month.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        base: Math.round(baseBalance),
        simulated: Math.round(simulatedBalance),
        difference: Math.round(simulatedBalance - baseBalance)
      });
    }

    return data;
  };

  const comparisonData = generateComparisonData();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Simulações Financeiras</h1>
              <p className="text-gray-500">Teste cenários futuros sem afetar seus dados reais</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Simulação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Simulação</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome da Simulação</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Ex: Novo emprego, Financiamento casa"
                      required
                    />
                  </div>

                  <div>
                    <Label>Tipo</Label>
                    <RadioGroup 
                      value={formData.type} 
                      onValueChange={(value) => handleInputChange("type", value)}
                      className="flex space-x-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="receita" id="receita" />
                        <Label htmlFor="receita">Receita</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="despesa" id="despesa" />
                        <Label htmlFor="despesa">Despesa</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="value">Valor Mensal</Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.01"
                      value={formData.value}
                      onChange={(e) => handleInputChange("value", e.target.value)}
                      placeholder="0,00"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Data de Início</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange("startDate", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">Data de Fim (opcional)</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange("endDate", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={createSimulationMutation.isPending}
                    >
                      {createSimulationMutation.isPending ? "Criando..." : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Simulations List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Simulações Criadas</CardTitle>
                  <p className="text-sm text-gray-500">
                    Ative/desative simulações para comparar cenários
                  </p>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse p-4 border border-gray-200 rounded-lg">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : simulations && simulations.length > 0 ? (
                    <div className="space-y-3">
                      {simulations.map((simulation) => (
                        <div 
                          key={simulation.id} 
                          className={`p-4 border rounded-lg transition-colors ${
                            activeSimulations.includes(simulation.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{simulation.name}</h4>
                              <p className={`text-sm ${
                                simulation.type === 'receita' ? 'text-success-600' : 'text-error-600'
                              }`}>
                                {simulation.type === 'receita' ? '+' : '-'}{formatCurrency(Number(simulation.value))}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(simulation.startDate).toLocaleDateString('pt-BR')}
                                {simulation.endDate && ` - ${new Date(simulation.endDate).toLocaleDateString('pt-BR')}`}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={activeSimulations.includes(simulation.id)}
                                onCheckedChange={() => toggleSimulation(simulation.id)}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteSimulationMutation.mutate(simulation.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            {activeSimulations.includes(simulation.id) ? (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Ativa
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Inativa
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calculator className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Nenhuma simulação criada</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Comparison Chart */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Comparação de Cenários</CardTitle>
                  <p className="text-sm text-gray-500">
                    Compare o cenário atual com as simulações ativas
                  </p>
                </CardHeader>
                <CardContent>
                  {comparisonData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={formatCurrency} />
                        <Tooltip 
                          formatter={(value, name) => [
                            formatCurrency(Number(value)), 
                            name === 'base' ? 'Cenário Base' : 'Com Simulações'
                          ]}
                          labelFormatter={(label) => `Mês: ${label}`}
                        />
                        <Legend 
                          formatter={(value) => value === 'base' ? 'Cenário Base' : 'Com Simulações'}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="base" 
                          stroke="hsl(var(--muted-foreground))" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="simulated" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-96 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Play className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>Ative simulações para ver a comparação</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Impact Summary */}
              {activeSimulations.length > 0 && comparisonData.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Resumo do Impacto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(() => {
                        const finalBase = comparisonData[comparisonData.length - 1]?.base || 0;
                        const finalSimulated = comparisonData[comparisonData.length - 1]?.simulated || 0;
                        const totalImpact = finalSimulated - finalBase;
                        const monthlyAverage = totalImpact / 12;

                        return (
                          <>
                            <div className="text-center">
                              <div className={`text-2xl font-bold ${
                                totalImpact >= 0 ? 'text-success-600' : 'text-error-600'
                              }`}>
                                {formatCurrency(totalImpact)}
                              </div>
                              <p className="text-sm text-gray-500">Impacto total em 12 meses</p>
                            </div>
                            <div className="text-center">
                              <div className={`text-2xl font-bold ${
                                monthlyAverage >= 0 ? 'text-success-600' : 'text-error-600'
                              }`}>
                                {formatCurrency(monthlyAverage)}
                              </div>
                              <p className="text-sm text-gray-500">Impacto médio mensal</p>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">
                                {activeSimulations.length}
                              </div>
                              <p className="text-sm text-gray-500">
                                Simulação{activeSimulations.length > 1 ? 'ões' : ''} ativa{activeSimulations.length > 1 ? 's' : ''}
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
