import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { InsertTransaction, Account, Category } from "@shared/schema";

interface TransactionFormProps {
  onSubmit: (data: InsertTransaction) => void;
  isLoading?: boolean;
}

export function TransactionForm({ onSubmit, isLoading }: TransactionFormProps) {
  const [formData, setFormData] = useState<InsertTransaction>({
    accountId: 0,
    categoryId: 0,
    type: "despesa",
    value: "0",
    date: new Date().toISOString().split('T')[0],
    description: "",
    paymentMethod: "dinheiro",
    isFixed: false,
    isParceled: false,
    totalParcels: 1,
    parcelNumber: 1
  });

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof InsertTransaction, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const filteredCategories = categories?.filter(cat => cat.type === formData.type) || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Label htmlFor="value">Valor</Label>
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

      <div>
        <Label htmlFor="account">Conta</Label>
        <Select value={String(formData.accountId)} onValueChange={(value) => handleInputChange("accountId", parseInt(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a conta" />
          </SelectTrigger>
          <SelectContent>
            {accounts?.map((account) => (
              <SelectItem key={account.id} value={String(account.id)}>
                {account.name} - {account.bank}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="category">Categoria</Label>
        <Select value={String(formData.categoryId)} onValueChange={(value) => handleInputChange("categoryId", parseInt(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
        <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange("paymentMethod", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a forma de pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dinheiro">Dinheiro</SelectItem>
            <SelectItem value="cartao">Cartão de Crédito</SelectItem>
            <SelectItem value="debito">Cartão de Débito</SelectItem>
            <SelectItem value="pix">PIX</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="date">Data</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => handleInputChange("date", e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Descrição da transação"
          required
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1"
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
