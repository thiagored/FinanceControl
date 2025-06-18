import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Wifi, Home, AlertCircle } from "lucide-react";

// Mock data for upcoming bills - in a real app, this would come from the API
const upcomingBills = [
  {
    id: 1,
    name: "Cartão de Crédito",
    amount: 1850.00,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    status: 'urgent',
    icon: CreditCard
  },
  {
    id: 2,
    name: "Internet",
    amount: 89.90,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    status: 'warning',
    icon: Wifi
  },
  {
    id: 3,
    name: "Aluguel",
    amount: 1200.00,
    dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
    status: 'normal',
    icon: Home
  },
];

export function UpcomingBills() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Vence hoje";
    if (diffDays === 1) return "Vence amanhã";
    if (diffDays < 0) return `Venceu há ${Math.abs(diffDays)} dias`;
    return `Vence em ${diffDays} dias`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent':
        return {
          bg: 'bg-error-50',
          border: 'border-error-200',
          dot: 'bg-error-500',
          text: 'text-error-600'
        };
      case 'warning':
        return {
          bg: 'bg-warning-50',
          border: 'border-warning-200',
          dot: 'bg-warning-500',
          text: 'text-warning-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          dot: 'bg-gray-400',
          text: 'text-gray-600'
        };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contas a Pagar</CardTitle>
        <p className="text-sm text-gray-500">Próximos vencimentos</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingBills.map((bill) => {
            const colors = getStatusColor(bill.status);
            const Icon = bill.icon;
            
            return (
              <div 
                key={bill.id} 
                className={`flex items-center justify-between p-4 rounded-lg border ${colors.bg} ${colors.border}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${colors.dot}`}></div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/50 rounded-lg flex items-center justify-center">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{bill.name}</p>
                      <p className={`text-sm ${colors.text}`}>
                        {getDaysUntilDue(bill.dueDate)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <p className={`font-semibold ${colors.text}`}>
                    {formatCurrency(bill.amount)}
                  </p>
                  {bill.status === 'urgent' && (
                    <AlertCircle className="h-4 w-4 text-error-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
