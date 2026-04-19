"use client";
import { toast } from "react-toastify";

import { Button } from "@/components/Buttons";
import {
  FilterContainer,
  FilterInput,
  FilterSelect,
} from "@/components/Filters";
import { Modal } from "@/components/Modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/Table";
import { Tabs } from "@/components/Tabs";
import { mensagemService } from "@/services/mensagemService";
import { Mensagem } from "@/types/mensagem";
import { formatDate, formatTime } from "@/utils/format";
import { ChevronLeft, ChevronRight, Edit, Eye, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import { MensagemForm } from "./components/mensagem-form";
const PaginationControls = ({
  meta,
  onPageChange,
}: {
  meta: any;
  onPageChange: (page: number) => void;
}) => {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(meta.currentPage - 1)}
        disabled={meta.currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm">
        Página {meta.currentPage} de {meta.totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(meta.currentPage + 1)}
        disabled={meta.currentPage === meta.totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default function MensagensPage() {
  const [activeTab, setActiveTab] = useState("pendente"); // Default to pending usually more actionable? Or Sent? User listed items with status=pendente in example.
  // Actually user JSON example showed 'pendente'.
  // Request asked for specific tabs: Falhas/Canceladas, plus existing?
  // "Todas as 3 abas devem possuir paginação". The 3 tabs likely: Pendente (A Enviar), Enviada, Falha/Cancelada.

  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMensagem, setCurrentMensagem] = useState<Mensagem | undefined>(
    undefined
  );

  // Filters
  const [filterDate, setFilterDate] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Map tab to "tipo" param expected by backend or filter locally?
      // Service supports: tipo?: 'Enviada' | 'Pendente' | 'Falha'
      let status: "pendente" | "enviado" | "falhou" = "pendente";
      if (activeTab === "pendente") status = "pendente";
      if (activeTab === "enviada") status = "enviado";
      if (activeTab === "falhas") status = "falhou";

      const data = await mensagemService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        status,
        telefone: debouncedPhone,
        data: filterDate,
      });

      setMensagens(data.items || []);
      setMeta(data.meta);
    } catch (error) {
      console.error(error);
      setMensagens([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce phone filter
  const [debouncedPhone, setDebouncedPhone] = useState(filterPhone);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPhone(filterPhone);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filterPhone]);

  // Refetch when filters/page/tab change
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, activeTab, filterDate, debouncedPhone]);

  // Removed handleApplyFilters as it is no longer needed

  const handleEdit = (msg: Mensagem) => {
    setCurrentMensagem(msg);
    setIsModalOpen(true);
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remover mensagem?")) return;
    try {
      await mensagemService.delete(id);
      fetchData();
    } catch (e) {
      toast.error("Erro ao remover");
    }
  };

  const handleSave = async (data: Partial<Mensagem>) => {
    try {
      if (currentMensagem?.id) {
        await mensagemService.update(currentMensagem.id, data);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      toast.error("Erro ao salvar");
    }
  };

  const filteredMensagens = mensagens.filter((msg) => {
    // Client-side Filter Fallback
    if (debouncedPhone && !msg.payload?.telefone?.includes(debouncedPhone))
      return false;
    if (filterDate && !msg.agendaPara?.startsWith(filterDate)) return false;

    // Tab Logic
    if (activeTab === "pendente" && msg.status !== "pendente") return false;
    if (
      activeTab === "falhas" &&
      !["falhou", "cancelado", "erro"].includes(msg.status.toLowerCase())
    )
      return false;
    if (
      activeTab === "enviada" &&
      (msg.status === "pendente" ||
        ["falhou", "cancelado", "erro"].includes(msg.status.toLowerCase()))
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-bold tracking-tight">Mensagens</h1>
        <Tabs
          activeTab={activeTab}
          onTabChange={(val) => {
            setActiveTab(val);
            setCurrentPage(1);
          }}
          tabs={[
            { label: "A Enviar (Pendente)", value: "pendente" },
            { label: "Enviadas", value: "enviada" },
            { label: "Falhas / Canceladas", value: "falhas" },
          ]}
        />
      </div>

      {/* Filters - Instantaneous */}
      <FilterContainer className="bg-muted/30 p-4 rounded-lg border border-border">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <FilterInput
            label="Data"
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setCurrentPage(1); // Reset page on filter change
            }}
            className="w-full sm:w-auto"
          />
          <FilterInput
            label="Telefone"
            value={filterPhone}
            onChange={(e) => {
              setFilterPhone(e.target.value);
              setCurrentPage(1); // Reset page on filter change
            }}
            placeholder="Filtrar por telefone..."
            className="w-full sm:w-auto min-w-[200px]"
          />
          <FilterSelect
            label="Itens por página"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset page on limit change
            }}
            options={[
              { label: "50 itens", value: 50 },
              { label: "100 itens", value: 100 },
            ]}
          />
        </div>
      </FilterContainer>

      {loading ? (
        <div className="text-center py-10">Carregando mensagens...</div>
      ) : (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data / Hora</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Texto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMensagens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      Nenhuma mensagem encontrada nesta aba.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMensagens.map((msg) => (
                    <TableRow key={msg.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {formatDate(msg.agendaPara)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(
                              (msg.agendaPara.includes("T")
                                ? msg.agendaPara.split("T")[1]
                                : msg.agendaPara.split(" ")[1]) || ""
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{msg.nome || "—"}</TableCell>
                      <TableCell>{msg.payload.telefone}</TableCell>
                      <TableCell
                        className="max-w-xs truncate"
                        title={msg.payload.texto}
                      >
                        {msg.payload.texto}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                                                ${["Enviada", "SENT", "enviado"].includes(
                            msg.status
                          )
                              ? "bg-green-100 text-green-800"
                              : [
                                "falhou",
                                "cancelado",
                                "erro",
                              ].includes(
                                msg.status.toLowerCase()
                              )
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                        >
                          {msg.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(msg)}
                            title={
                              activeTab === "enviada" ? "Visualizar" : "Editar"
                            }
                          >
                            {activeTab === "enviada" ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <Edit className="h-4 w-4" />
                            )}
                          </Button>
                          {activeTab === "pendente" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemove(msg.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredMensagens.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 border rounded-lg bg-card">
                Nenhuma mensagem encontrada.
              </div>
            ) : (
              filteredMensagens.map((msg) => (
                <Card key={msg.id} className="hover:shadow-md transition-all">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <CardTitle className="text-lg font-semibold truncate">
                        {formatDate(msg.agendaPara)}
                      </CardTitle>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                                                    ${[
                            "Enviada",
                            "SENT",
                            "enviado",
                          ].includes(msg.status)
                            ? "bg-green-100 text-green-800"
                            : [
                              "falhou",
                              "cancelado",
                              "erro",
                            ].includes(
                              msg.status.toLowerCase()
                            )
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                      >
                        {msg.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Hora:</span>{" "}
                      {formatTime(
                        (msg.agendaPara.includes("T")
                          ? msg.agendaPara.split("T")[1]
                          : msg.agendaPara.split(" ")[1]) || ""
                      )}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Nome:</span>{" "}
                      <span className="font-medium">{msg.nome || "—"}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Telefone:</span>{" "}
                      {msg.payload.telefone}
                    </p>

                    <div className="pt-2">
                      <span className="text-muted-foreground block text-xs mb-1">
                        Mensagem:
                      </span>
                      <p className="text-sm text-foreground/90 line-clamp-3 bg-muted/20 p-2 rounded-md">
                        {msg.payload.texto}
                      </p>
                    </div>

                    <div className="pt-4 flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleEdit(msg)}
                      >
                        {activeTab === "enviada" ? (
                          <>
                            <Eye className="mr-2 h-3 w-3" /> Visualizar
                          </>
                        ) : (
                          <>
                            <Edit className="mr-2 h-3 w-3" /> Editar
                          </>
                        )}
                      </Button>
                      {activeTab === "pendente" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => handleRemove(msg.id)}
                        >
                          <Trash className="mr-2 h-3 w-3" /> Remover
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <PaginationControls meta={meta} onPageChange={setCurrentPage} />
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detalhes da Mensagem"
      >
        <MensagemForm
          initialData={currentMensagem || {}}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
          readOnly={
            activeTab === "enviada" || ["Enviada", "enviado"].includes(currentMensagem?.status || "")
          }
        />
      </Modal>
    </div>
  );
}
