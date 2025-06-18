import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  ArrowRightLeft, 
  Plus, 
  FileText, 
  User 
} from "lucide-react";

export function MobileNav() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        <Link href="/">
          <Button 
            variant="ghost" 
            size="sm"
            className={`flex flex-col items-center py-2 px-3 ${
              isActive("/") ? "text-primary" : "text-gray-500"
            }`}
          >
            <BarChart3 className="h-5 w-5 mb-1" />
            <span className="text-xs">Home</span>
          </Button>
        </Link>
        
        <Link href="/transactions">
          <Button 
            variant="ghost" 
            size="sm"
            className={`flex flex-col items-center py-2 px-3 ${
              isActive("/transactions") ? "text-primary" : "text-gray-500"
            }`}
          >
            <ArrowRightLeft className="h-5 w-5 mb-1" />
            <span className="text-xs">Transações</span>
          </Button>
        </Link>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="flex flex-col items-center py-2 px-3 text-gray-500"
        >
          <Plus className="h-6 w-6 mb-1" />
          <span className="text-xs">Adicionar</span>
        </Button>
        
        <Link href="/reports">
          <Button 
            variant="ghost" 
            size="sm"
            className={`flex flex-col items-center py-2 px-3 ${
              isActive("/reports") ? "text-primary" : "text-gray-500"
            }`}
          >
            <FileText className="h-5 w-5 mb-1" />
            <span className="text-xs">Relatórios</span>
          </Button>
        </Link>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="flex flex-col items-center py-2 px-3 text-gray-500"
        >
          <User className="h-5 w-5 mb-1" />
          <span className="text-xs">Perfil</span>
        </Button>
      </div>
    </div>
  );
}
