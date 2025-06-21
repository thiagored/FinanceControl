import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  BarChart3, 
  University, 
  ArrowRightLeft, 
  CreditCard, 
  Tag,
  TrendingUp, 
  Calculator, 
  FileText,
  LogOut
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Contas", href: "/accounts", icon: University },
  { name: "Transações", href: "/transactions", icon: ArrowRightLeft },
  { name: "Cartões", href: "/cards", icon: CreditCard },
  { name: "Categorias", href: "/categories", icon: Tag },
  { name: "Previsões", href: "/forecasts", icon: TrendingUp },
  { name: "Simulações", href: "/simulations", icon: Calculator },
  { name: "Relatórios", href: "/reports", icon: FileText },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  return (
    <div className="hidden md:flex md:w-64 bg-white shadow-lg flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Wallet className="text-primary-foreground text-lg" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">FinanceControl</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:bg-gray-100"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="h-5 w-5 mr-3" />
          {logoutMutation.isPending ? "Saindo..." : "Sair"}
        </Button>
      </div>
    </div>
  );
}
