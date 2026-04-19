"use client";

import React, { useEffect, useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/Table";
import { Button } from "@/components/Buttons";
import { Job, jobService } from "@/services/jobService";
import { toast } from "react-toastify";
import { 
  Download, 
  ClipboardList, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await jobService.getJobs();
      setJobs(data || []);
    } catch (error: any) {
      console.error(error);
      if (!silent) toast.error("Erro ao carregar os trabalhos solicitados.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    const hasActiveJobs = jobs.some(job => 
      ["PENDENTE", "PROCESSANDO", "EM_PROCESSAMENTO"].includes(job.status?.toUpperCase())
    );

    if (hasActiveJobs) {
      const interval = setInterval(() => {
        fetchJobs(true);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [jobs]);

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "FINALIZADO":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Finalizado
          </span>
        );
      case "EM_PROCESSAMENTO":
      case "PROCESSANDO":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 mr-1 animate-spin" />
            Processando
          </span>
        );
      case "PENDENTE":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            {status || "Erro"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trabalhos Solicitados</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Lista de todos os processamentos de mensagens e seus status.
          </p>
        </div>
        <Button onClick={() => fetchJobs()} variant="outline" size="sm" disabled={loading}>
          {loading ? <Clock className="w-4 h-4 animate-spin mr-2" /> : <ClipboardList className="w-4 h-4 mr-2" />}
          Atualizar Lista
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-250px)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Prompt / Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j} className="h-16">
                        <div className="h-4 bg-slate-100 animate-pulse rounded w-3/4 mx-auto" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : jobs.length > 0 ? (
                jobs.map((job) => (
                  <TableRow key={job.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-700">
                      #{job.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center text-sm font-medium text-slate-900">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          {job.created_at ? format(new Date(job.created_at), "dd/MM/yyyy", { locale: ptBR }) : "N/A"}
                        </div>
                        <span className="text-xs text-slate-500 ml-5">
                          {job.created_at ? format(new Date(job.created_at), "HH:mm:ss", { locale: ptBR }) : ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col max-w-[300px]">
                        <div className="flex items-center">
                           <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-primary" />
                           <span className="text-sm font-semibold text-slate-900 truncate">
                             {job.prompt?.tipo || "Código: " + job.idTipoMensagem}
                           </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-1">
                          {job.prompt?.prompt || "Conteúdo não disponível"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(job.status)}
                    </TableCell>
                    <TableCell className="text-right">
                       {job.file_url ? (
                         <a 
                           href={job.file_url} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="inline-block"
                         >
                            <Button size="sm" variant="outline" className="h-8 border-[#1FA84F] text-[#1FA84F] hover:bg-[#1FA84F]/10">
                              <Download className="w-3.5 h-3.5 mr-1.5" />
                              XLSX
                            </Button>
                         </a>
                       ) : (
                         <span className="text-xs text-muted-foreground mr-4 italic">Sem arquivo</span>
                       )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    Nenhum trabalho encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
