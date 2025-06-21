import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { Charts } from "@/components/dashboard/charts";
import { AccountList } from "@/components/dashboard/account-list";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { UpcomingBills } from "@/components/dashboard/upcoming-bills";
import { CreditCards } from "@/components/dashboard/credit-cards";
import { Button } from "@/components/ui/button";
import { Plus, Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
                <p className="text-gray-500">{new Date().toLocaleDateString('pt-BR', { 
                  month: 'long', 
                  year: 'numeric' 
                })}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button className="hidden sm:flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Nova Transação</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.email.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <SummaryCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Charts />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <AccountList />
            <RecentTransactions />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UpcomingBills />
            <CreditCards />
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
