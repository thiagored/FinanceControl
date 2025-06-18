import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { InsertAccount } from "@shared/schema";

interface AccountFormProps {
  onSubmit: (data: InsertAccount) => void;
  isLoading?: boolean;
}

export function AccountForm({ onSubmit, isLoading }: AccountFormProps) {
  const [formData, setFormData] = useState<InsertAccount>({
    name: "",
    bank: "",
    type: "corrente",
    initialBalance: "0"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof InsertAccount, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome da Conta</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Ex: Conta Corrente Principal"
          required
        />
      </div>

      <div>
        <Label htmlFor="bank">Banco</Label>
        <Input
          id="bank"
          value={formData.bank}
          onChange={(e) => handleInputChange("bank", e.target.value)}
          placeholder="Ex: Banco do Brasil"
          required
        />
      </div>

      <div>
        <Label htmlFor="type">Tipo da Conta</Label>
        <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="corrente">Conta Corrente</SelectItem>
            <SelectItem value="poupanca">Poupança</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="initialBalance">Saldo Inicial</Label>
        <Input
          id="initialBalance"
          type="number"
          step="0.01"
          value={formData.initialBalance}
          onChange={(e) => handleInputChange("initialBalance", e.target.value)}
          placeholder="0,00"
          required
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1"
          onClick={() => {
            // Reset form or close dialog logic would go here
          }}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          className="flex-1"
          disabled={isLoading}
        >
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
