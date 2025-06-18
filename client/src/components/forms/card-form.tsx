import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { InsertCard } from "@shared/schema";

interface CardFormProps {
  onSubmit: (data: InsertCard) => void;
  isLoading?: boolean;
}

export function CardForm({ onSubmit, isLoading }: CardFormProps) {
  const [formData, setFormData] = useState<InsertCard>({
    name: "",
    brand: "visa",
    creditLimit: "0",
    closeDay: 1,
    dueDay: 10
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof InsertCard, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Cartão</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Ex: Cartão Platinum"
          required
        />
      </div>

      <div>
        <Label htmlFor="brand">Bandeira</Label>
        <Select value={formData.brand} onValueChange={(value) => handleInputChange("brand", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a bandeira" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="visa">Visa</SelectItem>
            <SelectItem value="mastercard">Mastercard</SelectItem>
            <SelectItem value="elo">Elo</SelectItem>
            <SelectItem value="american express">American Express</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="creditLimit">Limite de Crédito</Label>
        <Input
          id="creditLimit"
          type="number"
          step="0.01"
          value={formData.creditLimit}
          onChange={(e) => handleInputChange("creditLimit", e.target.value)}
          placeholder="0,00"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="closeDay">Dia de Fechamento</Label>
          <Select value={String(formData.closeDay)} onValueChange={(value) => handleInputChange("closeDay", parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Dia" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <SelectItem key={day} value={String(day)}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="dueDay">Dia de Vencimento</Label>
          <Select value={String(formData.dueDay)} onValueChange={(value) => handleInputChange("dueDay", parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Dia" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <SelectItem key={day} value={String(day)}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
