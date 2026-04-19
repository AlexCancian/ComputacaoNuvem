"use client";
import { toast } from "react-toastify";

import { Button } from "@/components/Buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Modal } from "@/components/Modal";
import { Switch } from "@/components/Switch";
import { promptIAService } from "@/services/promptIAService";
import { PromptIA } from "@/types/prompt-ia";
import { Bot, Edit, Plus, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import { PromptForm } from "./components/prompt-form";

export default function PromptsIAPage() {
  const [prompts, setPrompts] = useState<PromptIA[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<PromptIA | undefined>(
    undefined
  );

  const unitMap: Record<string, string> = {
    days: "Dias",
    minutes: "Minutos",
    hours: "Horas",
    // Fallbacks for legacy/mixed data
    Dias: "Dias",
    Minutos: "Minutos",
    Horas: "Horas",
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await promptIAService.getAll();
      setPrompts(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setCurrentPrompt(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (prompt: PromptIA) => {
    setCurrentPrompt(prompt);
    setIsModalOpen(true);
  };

  const handleQuickUpdate = async (
    prompt: PromptIA,
    field: keyof PromptIA,
    value: boolean
  ) => {
    const id = prompt.idTipoMensagem;
    if (!id) return;

    // Optimistically update local state
    setPrompts((prev) =>
      prev.map((p) => (p.idTipoMensagem === id ? { ...p, [field]: value } : p))
    );

    try {
      await promptIAService.update(id, { [field]: value });
      // Does not fetch data again to avoid loading flickering
    } catch (error) {
      console.error(error);
      // Revert state if error
      setPrompts((prev) =>
        prev.map((p) =>
          p.idTipoMensagem === id ? { ...p, [field]: !value } : p
        )
      );
      toast.error("Erro ao atualizar " + field);
    }
  };

  const handleRemove = async (prompt: PromptIA) => {
    const id = prompt.idTipoMensagem;
    if (!id) return;
    if (!confirm("Remover este prompt?")) return;
    try {
      await promptIAService.delete(id);
      fetchData();
    } catch (e) {
      toast.error("Erro ao remover");
    }
  };

  const handleSave = async (data: Partial<PromptIA>) => {
    try {
      const id = currentPrompt?.idTipoMensagem;
      if (id) {
        await promptIAService.update(id, data);
      } else {
        await promptIAService.create(data as PromptIA);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar prompt");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-bold tracking-tight">Prompt Mensagens</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Prompt
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {prompts.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-10">
              Nenhum prompt configurado.
            </div>
          ) : (
            prompts.map((prompt) => (
              <Card
                key={prompt.idTipoMensagem}
                className="hover:shadow-md transition-all flex flex-col"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">
                    {prompt.tipo}
                  </CardTitle>
                  <Bot className="h-5 w-5 text-indigo-500" />
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Configuração de Tempo
                    </p>
                    <p className="text-sm font-medium">
                      {prompt.valor} {unitMap[prompt.unidade] || prompt.unidade}
                    </p>
                  </div>

                  <div className="bg-muted/30 p-3 rounded-md border border-border/50 flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Prompt do Sistema
                    </p>
                    <p
                      className="text-sm text-foreground/90 line-clamp-4 italic"
                      title={prompt.prompt}
                    >
                      "{prompt.prompt}"
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t mt-auto">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Associado
                      </span>
                      <Switch
                        checked={prompt.associado}
                        onCheckedChange={(checked) =>
                          handleQuickUpdate(prompt, "associado", checked)
                        }
                        id={`associado-${prompt.idTipoMensagem}`}
                      />
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Ativo
                      </span>
                      <Switch
                        checked={prompt.status}
                        onCheckedChange={(checked) =>
                          handleQuickUpdate(prompt, "status", checked)
                        }
                        id={`status-${prompt.idTipoMensagem}`}
                      />
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Nome Completo
                      </span>
                      <Switch
                        checked={prompt.nomeCompleto}
                        onCheckedChange={(checked) =>
                          handleQuickUpdate(prompt, "nomeCompleto", checked)
                        }
                        id={`nomeCompleto-${prompt.idTipoMensagem}`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleEdit(prompt)}
                    >
                      <Edit className="mr-2 h-3 w-3" /> Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => handleRemove(prompt)}
                    >
                      <Trash className="mr-2 h-3 w-3" /> Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentPrompt ? "Editar Prompt" : "Novo Prompt"}
        footer={undefined}
      >
        <PromptForm
          initialData={currentPrompt || {}}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
