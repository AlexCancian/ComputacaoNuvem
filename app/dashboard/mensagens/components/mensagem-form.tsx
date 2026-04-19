"use client";

import { Button } from "@/components/Buttons";
import { FilterInput } from "@/components/Filters";
import { Mensagem } from "@/types/mensagem";
import { formatDate, formatTime } from "@/utils/format";
import React, { useState } from "react";

interface MensagemFormProps {
  initialData?: Partial<Mensagem>;
  onSave: (data: Partial<Mensagem>) => void;
  onCancel: () => void;
  readOnly?: boolean;
}

export function MensagemForm({
  initialData,
  onSave,
  onCancel,
  readOnly,
}: MensagemFormProps) {
  const [formData, setFormData] = useState<Partial<Mensagem>>({
    agendaPara: (() => {
      // Começamos com a data atual formatada para o seletor local
      const d = new Date();
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 16);
    })(),
    payload: {
      texto: "",
      telefone: "",
    },
    nome: "",
    status: "pendente",
    ...initialData,
  });

  const handlePayloadChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (readOnly) return;
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      payload: {
        ...prev.payload!,
        [name]: value,
      },
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    setFormData((prev) => ({ ...prev, agendaPara: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalAgendaPara = formData.agendaPara;
    
    // Se o valor estiver no formato do input (T sem Z), convertemos para o formato ISO com 'Z'
    // tratando os valores numéricos como UTC para que o que o usuário viu no calendário
    // chegue igual no backend (ex: 12:31 no calendario -> 12:31:00.000Z).
    if (finalAgendaPara && finalAgendaPara.includes("T") && !finalAgendaPara.includes("Z")) {
      const d = new Date(finalAgendaPara);
      if (!isNaN(d.getTime())) {
        // Extrai os valores numéricos exatamente como estão no input
        const utcDate = new Date(
          Date.UTC(
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
            d.getHours(),
            d.getMinutes(),
            0
          )
        );
        finalAgendaPara = utcDate.toISOString();
      }
    }
    // Se já tiver 'Z', enviamos como está, evitando o re-processamento que causava o shift.

    onSave({
      ...formData,
      agendaPara: finalAgendaPara,
    });
  };

  return (
    <div className="space-y-6">
      {/* Show Read-Only Agenda Details if available */}
      {initialData?.agendaId && (
        <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2 border border-border">
          <h4 className="font-semibold text-foreground">
            Detalhes da Agenda Vinculada
          </h4>
          <p>
            <span className="text-muted-foreground">ID Agenda:</span>{" "}
            {initialData.agendaId.idAgenda}
          </p>
          <p>
            <span className="text-muted-foreground">Data:</span>{" "}
            {formatDate(initialData.agendaId.dataAgenda)}
          </p>
          <p>
            <span className="text-muted-foreground">Horário:</span>{" "}
            {formatTime(initialData.agendaId.horaInicialAgenda)} -{" "}
            {formatTime(initialData.agendaId.horaFinal)}
          </p>
          <p>
            <span className="text-muted-foreground">Pagamento:</span>{" "}
            <span
              className={
                initialData.agendaId.pagamento
                  ? "text-green-600 font-medium"
                  : "text-yellow-600 font-medium"
              }
            >
              {initialData.agendaId.pagamento ? "Pago" : "Pendente"}
            </span>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FilterInput
          label="Agendar Para"
          name="agendaPara"
          type="datetime-local"
          // Handle ISO string or simple string format
          value={String(formData.agendaPara).substring(0, 16)}
          onChange={handleDateChange}
          min={(() => {
            const d = new Date();
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            return d.toISOString().slice(0, 16);
          })()}
          required
          disabled={readOnly}
        />

        <FilterInput
          label="Nome"
          name="nome"
          value={formData.nome}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, nome: e.target.value }))
          }
          required
          placeholder="Nome do Cliente"
          disabled={readOnly}
        />

        <FilterInput
          label="Telefone Destino"
          name="telefone"
          value={formData.payload?.telefone}
          onChange={handlePayloadChange}
          required
          placeholder="(00) 00000-0000"
          disabled={readOnly}
        />

        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-medium leading-none">
            Texto da Mensagem
          </label>
          <textarea
            name="texto"
            value={formData.payload?.texto}
            onChange={handlePayloadChange}
            className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
            disabled={readOnly}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            {readOnly ? "Fechar" : "Cancelar"}
          </Button>
          {!readOnly && <Button type="submit">Salvar</Button>}
        </div>
      </form>
    </div>
  );
}
