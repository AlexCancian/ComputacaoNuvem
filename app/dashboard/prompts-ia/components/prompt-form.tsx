"use client";

import { Button } from "@/components/Buttons";
import { FilterInput, FilterSelect } from "@/components/Filters";
import { PromptIA } from "@/types/prompt-ia";
import React, { useEffect, useState, useRef } from "react";

interface PromptFormProps {
  initialData?: Partial<PromptIA>;
  onSave: (data: Partial<PromptIA>) => void;
  onCancel: () => void;
}

export function PromptForm({ initialData, onSave, onCancel }: PromptFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const variables = ["nome", "valor"];

  const handleAddVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.prompt || "";
    const tag = `{{${variable}}}`;

    const newText = text.substring(0, start) + tag + text.substring(end);

    // Update state - simulate event to reuse handle change logic or set directly
    setFormData((prev) => ({ ...prev, prompt: newText }));

    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  };
  const [formData, setFormData] = useState<Partial<PromptIA>>({
    tipo: "Lembrete",
    prompt: "",
    unidade: "minutes",
    valor: 15,
    associado: false,
    status: true,
    nomeCompleto: false,
    ...initialData,
  });

  useEffect(() => {
    setFormData({
      tipo: "Lembrete",
      prompt: "",
      unidade: "minutes",
      valor: 15,
      associado: false,
      status: true,
      nomeCompleto: false,
      ...initialData,
    });
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let val: any = value;
    if (type === "checkbox") {
      val = (e.target as HTMLInputElement).checked;
    } else if (type === "number") {
      val = parseFloat(value) || 0;
    }
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FilterInput
        label="Tipo"
        name="tipo"
        value={formData.tipo}
        onChange={handleChange}
        required
      />

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium leading-none">
          Texto da Mensagem
        </label>

        <div className="flex flex-wrap gap-2 mb-1">
          {variables.map((v) => (
            <Button
              key={v}
              type="button"
              variant="secondary"
              size="sm"
              className="h-7 text-xs"
              onClick={() => handleAddVariable(v)}
            >
              + {v}
            </Button>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          name="prompt"
          value={formData.prompt}
          onChange={handleChange}
          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FilterInput
          label="Valor"
          name="valor"
          type="number"
          value={formData.valor}
          onChange={handleChange}
          required
        />
        <FilterSelect
          label="Unidade"
          name="unidade"
          value={formData.unidade}
          onChange={handleChange}
          options={[
            { label: "Minutos", value: "minutes" },
            { label: "Horas", value: "hours" },
            { label: "Dias", value: "days" },
          ]}
        />
      </div>

      <div className="space-y-2 pt-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="associado"
            name="associado"
            checked={formData.associado}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label
            htmlFor="associado"
            className="text-sm font-medium text-muted-foreground"
          >
            Associado
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="status"
            name="status"
            checked={formData.status}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="status" className="text-sm font-medium">
            Ativo
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="nomeCompleto"
            name="nomeCompleto"
            checked={formData.nomeCompleto}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="nomeCompleto" className="text-sm font-medium">
            Nome Completo
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}
