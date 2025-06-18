import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { University, PiggyBank, Plus } from "lucide-react";
import type { Account } from "@shared/schema";

export function AccountList() {
  const { data: accounts, isLoading } = useQuery<(Account & { currentBalance: number })[]>({
    queryKey: ["/api/accounts"],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getAccountIcon = (type: string) => {
    return type === 'poupanca' ? (
      <PiggyBank className="h-5 w-5 text-success-600" />
    ) : (
      <University className="h-5 w-5 text-primary" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Minhas Contas</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary-600">
            <Plus className="h-4 w-4 mr-1" />
            Nova Conta
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between py-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 ml-auto"></div>
                </div>
              </div>
            ))}
          </div>
        ) : accounts && accounts.length > 0 ? (
          <div className="space-y-4">
            {accounts.slice(0, 3).map((account) => (
              <div key={account.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {getAccountIcon(account.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{account.name}</p>
                    <p className="text-sm text-gray-500">{account.bank}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    account.currentBalance >= 0 ? 'text-gray-900' : 'text-error-600'
                  }`}>
                    {formatCurrency(account.currentBalance)}
                  </p>
                  <p className="text-xs text-gray-500">Saldo atual</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <University className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>Nenhuma conta cadastrada</p>
            <Button variant="ghost" size="sm" className="mt-2 text-primary">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar conta
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
