"use client";

import React, { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Buttons";
import { Modal } from "@/components/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/Table";
import { toast } from "react-toastify";
import { jobService } from "@/services/jobService";
import { promptIAService } from "@/services/promptIAService";
import { PromptIA } from "@/types/prompt-ia";
import {
  validarPlanilha,
  validarTamanhoArquivo,
  ResultadoValidacao,
} from "@/utils/validarPlanilha";
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Phone,
  Loader2,
  Trash2,
  Eye,
  Send,
} from "lucide-react";

const MAX_FILE_SIZE_LABEL = "10MB";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [validacao, setValidacao] = useState<ResultadoValidacao | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [prompts, setPrompts] = useState<PromptIA[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null);
  const [showErrosTelefone, setShowErrosTelefone] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Carregar prompts ao montar
  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await promptIAService.getAll();
        const ativos = (data || []).filter((p) => p.status);
        setPrompts(ativos);
        if (ativos.length > 0 && ativos[0].idTipoMensagem) {
          setSelectedPromptId(ativos[0].idTipoMensagem!);
        }
      } catch {
        toast.error("Erro ao carregar prompts");
      }
    };
    load();
  }, []);

  const processarArquivo = useCallback(async (arquivo: File) => {
    // Validação rápida de extensão
    const ext = arquivo.name.split(".").pop()?.toLowerCase();
    if (ext !== "xlsx" && ext !== "xls") {
      toast.error("Somente arquivos .xlsx ou .xls são aceitos.");
      return;
    }

    // Validação de tamanho
    const erroTamanho = validarTamanhoArquivo(arquivo);
    if (erroTamanho) {
      toast.error(erroTamanho);
      return;
    }

    setFile(arquivo);
    setValidacao(null);
    setLoading(true);

    try {
      const resultado = await validarPlanilha(arquivo);
      setValidacao(resultado);

      if (resultado.valido) {
        toast.success(
          `Planilha válida! ${resultado.totalLinhas} registro(s) encontrado(s).`
        );
      } else {
        toast.warn("A planilha contém erros que precisam ser corrigidos.");
      }
    } catch (err) {
      toast.error("Erro ao processar a planilha.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) processarArquivo(droppedFile);
    },
    [processarArquivo]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) processarArquivo(selected);
    },
    [processarArquivo]
  );

  const handleUpload = async () => {
    if (!file || !validacao?.valido || !selectedPromptId) return;

    setUploading(true);
    try {
      await jobService.uploadFile(file, selectedPromptId);
      toast.success("Arquivo enviado com sucesso! O job foi criado e será processado em breve.");
      limpar();
      router.push("/dashboard/trabalhos");
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Erro ao enviar arquivo.";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const limpar = () => {
    setFile(null);
    setValidacao(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Upload de Planilha</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Envie um arquivo Excel (.xlsx) com as colunas <strong>nome</strong>,{" "}
            <strong>telefone</strong> e opcionalmente <strong>valor</strong>.
          </p>
        </div>
      </div>

      {/* Seleção de Prompt */}
      <div className="bg-white rounded-lg border border-border p-5 shadow-sm">
        <label className="block text-sm font-medium text-foreground mb-2">
          Tipo de Mensagem (Prompt)
        </label>
        <select
          className="w-full md:w-96 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={selectedPromptId ?? ""}
          onChange={(e) => setSelectedPromptId(Number(e.target.value))}
        >
          <option value="" disabled>
            Selecione um prompt...
          </option>
          {prompts.map((p) => (
            <option key={p.idTipoMensagem} value={p.idTipoMensagem}>
              {p.tipo} — {p.valor} {p.unidade}
            </option>
          ))}
        </select>
        {prompts.length === 0 && (
          <p className="text-xs text-amber-600 mt-2">
            Nenhum prompt ativo encontrado. Crie um na aba &quot;Prompt Mensagens&quot;.
          </p>
        )}
      </div>

      {/* Drop Zone */}
      <div
        className={`
          relative rounded-xl border-2 border-dashed transition-all duration-300
          flex flex-col items-center justify-center p-10 cursor-pointer
          ${
            dragOver
              ? "border-primary bg-primary/5 scale-[1.01]"
              : file
              ? "border-green-400 bg-green-50/50"
              : "border-gray-300 bg-white hover:border-primary/50 hover:bg-primary/[0.02]"
          }
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />

        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Analisando planilha...</p>
          </div>
        ) : file ? (
          <div className="flex flex-col items-center gap-3">
            <FileSpreadsheet className="h-10 w-10 text-green-600" />
            <p className="text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="h-10 w-10 text-muted-foreground/60" />
            <p className="text-sm font-medium text-foreground">
              Arraste e solte seu arquivo aqui
            </p>
            <p className="text-xs text-muted-foreground">
              ou clique para selecionar • .xlsx / .xls • máx. {MAX_FILE_SIZE_LABEL}
            </p>
          </div>
        )}
      </div>

      {/* Resultado da Validação */}
      {validacao && (
        <div className="space-y-4">
          {/* Status geral */}
          <div
            className={`rounded-lg border p-4 flex items-start gap-3 ${
              validacao.valido
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            {validacao.valido ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            )}
            <div>
              <p
                className={`font-medium text-sm ${
                  validacao.valido ? "text-green-800" : "text-red-800"
                }`}
              >
                {validacao.valido
                  ? `Planilha válida — ${validacao.totalLinhas} registro(s)`
                  : "A planilha contém erros"}
              </p>

              {/* Erros */}
              {validacao.erros.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {validacao.erros.map((err, idx) => (
                    <li key={idx} className="text-sm text-red-700 flex items-start gap-1.5">
                      <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      {err}
                    </li>
                  ))}
                </ul>
              )}

              {/* Avisos */}
              {validacao.avisos.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {validacao.avisos.map((aviso, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-amber-700 flex items-start gap-1.5"
                    >
                      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      {aviso}
                    </li>
                  ))}
                </ul>
              )}

              {/* Link para erros de telefone */}
              {validacao.errosTelefone.length > 0 && (
                <button
                  className="mt-2 text-sm text-red-700 underline hover:text-red-900 flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowErrosTelefone(true);
                  }}
                >
                  <Phone className="h-3.5 w-3.5" />
                  Ver detalhes dos {validacao.errosTelefone.length} telefone(s) inválido(s)
                </button>
              )}
            </div>
          </div>

          {/* Colunas encontradas */}
          <div className="bg-white rounded-lg border border-border p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Colunas Encontradas
            </p>
            <div className="flex flex-wrap gap-2">
              {validacao.colunasEncontradas.map((col) => {
                const normalizado = col.toLowerCase().trim();
                const aceita = ["nome", "telefone", "valor"].includes(normalizado);
                return (
                  <span
                    key={col}
                    className={`
                      inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                      ${
                        aceita
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }
                    `}
                  >
                    {aceita ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {col}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Preview Table (Top 10) */}
          {validacao.preview.length > 0 && (
            <div className="bg-white rounded-lg border border-border shadow-sm">
              <div className="p-4 border-b border-border flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Prévia dos dados (primeiros {validacao.preview.length} de{" "}
                  {validacao.totalLinhas})
                </p>
              </div>
              <div className="overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center">#</TableHead>
                      {validacao.colunasEncontradas.map((col) => (
                        <TableHead key={col}>{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validacao.preview.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-center text-muted-foreground text-xs">
                          {idx + 1}
                        </TableCell>
                        {validacao!.colunasEncontradas.map((col) => (
                          <TableCell key={col}>
                            {String(row[col] ?? "")}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={handleUpload}
              disabled={
                !validacao.valido || uploading || !selectedPromptId
              }
              isLoading={uploading}
              className="flex-1 sm:flex-none"
            >
              <Send className="mr-2 h-4 w-4" />
              {uploading ? "Enviando..." : "Enviar para Processamento"}
            </Button>

            <Button variant="outline" onClick={limpar} className="flex-1 sm:flex-none">
              <Trash2 className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Erros de Telefone */}
      <Modal
        isOpen={showErrosTelefone}
        onClose={() => setShowErrosTelefone(false)}
        title="Telefones Inválidos"
        className="max-w-2xl"
      >
        <div className="overflow-auto max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Linha</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validacao?.errosTelefone.map((err, idx) => (
                <TableRow key={idx}>
                  <TableCell className="text-center font-mono text-xs">
                    {err.linha}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {err.telefone}
                  </TableCell>
                  <TableCell className="text-sm text-red-700">
                    {err.motivo}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Modal>
    </div>
  );
}
