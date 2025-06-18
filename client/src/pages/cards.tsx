import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { CardForm } from "@/components/forms/card-form";
import { Plus, CreditCard, MoreVertical, Eye, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Card as CardType } from "@shared/schema";

export default function Cards() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: cards, isLoading } = useQuery<(CardType & { currentUsage: number })[]>({
    queryKey: ["/api/cards"],
  });

  const createCardMutation = useMutation({
    mutationFn: async (cardData: any) => {
      const res = await apiRequest("POST", "/api/cards", cardData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      setIsDialogOpen(false);
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getCardColor = (brand: string) => {
    const colors: Record<string, string> = {
      'mastercard': 'bg-orange-600',
      'visa': 'bg-blue-600',
      'elo': 'bg-yellow-600',
      'american express': 'bg-green-600'
    };
    return colors[brand.toLowerCase()] || 'bg-gray-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-error-500';
    if (percentage >= 60) return 'bg-warning-500';
    return 'bg-success-500';
  };

  const getTotalLimit = () => {
    if (!cards) return 0;
    return cards.reduce((total, card) => total + Number(card.creditLimit), 0);
  };

  const getTotalUsage = () => {
    if (!cards) return 0;
    return cards.reduce((total, card) => total + card.currentUsage, 0);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cartões de Crédito</h1>
              <p className="text-gray-500">Gerencie seus cartões e faturas</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Cartão
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Cartão</DialogTitle>
                </DialogHeader>
                <CardForm
                  onSubmit={(data) => createCardMutation.mutate(data)}
                  isLoading={createCardMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Limite Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(getTotalLimit())}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Limite disponível em todos os cartões
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Utilizado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-error-600">
                  {formatCurrency(getTotalUsage())}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Valor usado em todos os cartões
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Disponível</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success-600">
                  {formatCurrency(getTotalLimit() - getTotalUsage())}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Limite disponível para uso
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : cards && cards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => {
                const usagePercentage = getUsagePercentage(card.currentUsage, Number(card.creditLimit));
                const remainingLimit = Number(card.creditLimit) - card.currentUsage;
                
                return (
                  <Card key={card.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCardColor(card.brand)}`}>
                            <CreditCard className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{card.name}</h3>
                            <p className="text-sm text-gray-500 capitalize">
                              {card.brand} • Final {String(card.id).padStart(4, '0')}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-error-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Limit Info */}
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Limite total:</span>
                          <span className="font-medium">{formatCurrency(Number(card.creditLimit))}</span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Utilizado:</span>
                            <span className="font-medium">{formatCurrency(card.currentUsage)}</span>
                          </div>
                          <Progress value={usagePercentage} className="h-2" />
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">{usagePercentage.toFixed(1)}% usado</span>
                            <span className="text-gray-500">
                              Disponível: {formatCurrency(remainingLimit)}
                            </span>
                          </div>
                        </div>

                        {/* Billing Info */}
                        <div className="pt-4 border-t border-gray-100">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Fechamento:</span>
                              <p className="font-medium">Dia {card.closeDay}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Vencimento:</span>
                              <p className="font-medium">Dia {card.dueDay}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 space-y-2">
                          <Button variant="outline" size="sm" className="w-full">
                            Ver Fatura
                          </Button>
                          <Button variant="outline" size="sm" className="w-full">
                            Nova Compra
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum cartão cadastrado
                </h3>
                <p className="text-gray-500 mb-4">
                  Comece adicionando seu primeiro cartão de crédito
                </p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Cartão
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Cartão</DialogTitle>
                    </DialogHeader>
                    <CardForm
                      onSubmit={(data) => createCardMutation.mutate(data)}
                      isLoading={createCardMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
