import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Plus } from "lucide-react";
import type { Card as CardType } from "@shared/schema";

export function CreditCards() {
  const { data: cards, isLoading } = useQuery<(CardType & { currentUsage: number })[]>({
    queryKey: ["/api/cards"],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return (used / limit) * 100;
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Cartões de Crédito</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary-600">
            <Plus className="h-4 w-4 mr-1" />
            Novo Cartão
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-8"></div>
                </div>
              </div>
            ))}
          </div>
        ) : cards && cards.length > 0 ? (
          <div className="space-y-4">
            {cards.map((card) => {
              const usagePercentage = getUsagePercentage(card.currentUsage, Number(card.creditLimit));
              const remainingLimit = Number(card.creditLimit) - card.currentUsage;
              
              return (
                <div key={card.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${getCardColor(card.brand)}`}>
                        <CreditCard className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{card.name}</p>
                        <p className="text-sm text-gray-500">
                          {card.brand} • Final {String(card.id).padStart(4, '0')}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      Limite: {formatCurrency(Number(card.creditLimit))}
                    </p>
                  </div>
                  
                  <Progress 
                    value={usagePercentage} 
                    className="w-full mb-2"
                  />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Usado: {formatCurrency(card.currentUsage)}
                    </span>
                    <span className="text-gray-600">
                      {usagePercentage.toFixed(0)}%
                    </span>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500">
                    Disponível: {formatCurrency(remainingLimit)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>Nenhum cartão cadastrado</p>
            <Button variant="ghost" size="sm" className="mt-2 text-primary">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar cartão
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
