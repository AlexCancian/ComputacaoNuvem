"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { configuracaoService } from "@/services/configuracaoService";
import { DiaSemana, IntervaloFuncionamento } from "@/types/configuracao";
import { Switch } from "@/components/Switch";
import { Button } from "@/components/Buttons";
import { Modal } from "@/components/Modal";
import { Input } from "@/components/Inputs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { ArrowLeft, Clock, Plus, Trash2, Edit, Trash } from "lucide-react";

const DIAS_MAP = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
];

const formatTime = (time: string | null | undefined) => {
    if (!time) return "00:00";
    return time.substring(0, 5);
};

export default function DiaDetalhesPage() {
    const params = useParams();
    const router = useRouter();
    const rawId = params?.id;
    const idDia = typeof rawId === "string" ? parseInt(rawId, 10) : 0;

    const [dia, setDia] = useState<DiaSemana | null>(null);
    const [intervalos, setIntervalos] = useState<IntervaloFuncionamento[]>([]);
    const [loading, setLoading] = useState(true);

    // Modais de Edição
    const [isModalDiaOpen, setIsModalDiaOpen] = useState(false);
    const [diaFormData, setDiaFormData] = useState<Partial<DiaSemana>>({});

    const [isModalIntervaloOpen, setIsModalIntervaloOpen] = useState(false);
    const [intervaloFormData, setIntervaloFormData] = useState<Partial<IntervaloFuncionamento>>({});

    useEffect(() => {
        if (idDia) {
            loadData();
        }
    }, [idDia]);

    const loadData = async () => {
        try {
            setLoading(true);
            const diaData = await configuracaoService.getDiaById(idDia);
            setDia(diaData);

            const intervalosData = await configuracaoService.getIntervalosByDia(diaData.diaSemana);
            setIntervalos(intervalosData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadIntervalos = async (diaSemana: number) => {
        try {
            const data = await configuracaoService.getIntervalosByDia(diaSemana);
            setIntervalos(data);
        } catch (error) {
            console.error(error);
        }
    };

    const openDiaModal = () => {
        if (!dia) return;
        setDiaFormData({
            horaInicio: dia.horaInicio,
            horaFim: dia.horaFim,
            intervaloSlotMinutos: dia.intervaloSlotMinutos,
        });
        setIsModalDiaOpen(true);
    };

    const saveDia = async () => {
        if (!dia) return;
        try {
            await configuracaoService.updateDia(dia.idHorario, diaFormData);
            setIsModalDiaOpen(false);
            await loadData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleIntervalo = async (intv: IntervaloFuncionamento) => {
        try {
            await configuracaoService.updateIntervalo(intv.idIntervalo, { status: !intv.status });
            if (dia) await loadIntervalos(dia.diaSemana);
        } catch (error) {
            console.error(error);
        }
    };

    const openIntervaloModal = (intv?: IntervaloFuncionamento) => {
        if (intv) {
            setIntervaloFormData(intv);
        } else {
            setIntervaloFormData({
                diaSemana: dia?.diaSemana,
                status: true,
                horaInicio: "12:00:00",
                horaFim: "13:30:00",
                descricao: "Almoço",
            });
        }
        setIsModalIntervaloOpen(true);
    };

    const saveIntervalo = async () => {
        try {
            if (intervaloFormData.idIntervalo) {
                await configuracaoService.updateIntervalo(intervaloFormData.idIntervalo, intervaloFormData);
            } else {
                await configuracaoService.createIntervalo(intervaloFormData);
            }
            setIsModalIntervaloOpen(false);
            if (dia) await loadIntervalos(dia.diaSemana);
        } catch (error) {
            console.error(error);
        }
    };

    const deleteIntervalo = async (id: number) => {
        if (!window.confirm("Tem certeza que deseja excluir este intervalo/pausa?")) {
            return;
        }

        try {
            await configuracaoService.deleteIntervalo(id);
            setIsModalIntervaloOpen(false);
            if (dia) await loadIntervalos(dia.diaSemana);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return <div className="p-8">Carregando detalhes...</div>;
    }

    if (!dia) {
        return <div className="p-8">Dia não encontrado.</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/configuracoes")}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Detalhes de {DIAS_MAP[dia.diaSemana]}</h1>
                    <p className="text-muted-foreground mt-1">Gerencie os horários gerais e intervalos deste dia.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card do Dia (Horário Geral) */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-lg font-medium text-muted-foreground">Horário Geral</h3>
                    <Card className="hover:shadow-md transition-all">
                        <CardContent className="p-5 flex flex-col gap-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-muted-foreground block">Abertura</span>
                                    <span className="font-medium text-lg">{formatTime(dia.horaInicio)}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground block">Fechamento</span>
                                    <span className="font-medium text-lg">{formatTime(dia.horaFim)}</span>
                                </div>
                            </div>
                            <div className="mt-2 pt-3 border-t border-border">
                                <span className="text-sm text-muted-foreground block">Intervalo de Agenda</span>
                                <span className="font-medium">{dia.intervaloSlotMinutos} minutos</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2 pt-3 border-t border-border">
                                <span className="text-sm text-muted-foreground">Status do Dia: </span>
                                <span className={`font-medium ${dia.ativo ? 'text-green-600' : 'text-red-600'}`}>
                                    {dia.ativo ? 'Aberto' : 'Fechado'}
                                </span>
                            </div>

                            <div className="pt-4 flex flex-col gap-2 mt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={openDiaModal}
                                >
                                    <Edit className="mr-2 h-3 w-3" /> Editar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Cards de Intervalos (Pausas) */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-muted-foreground">Intervalos (Pausas)</h3>
                        <Button variant="outline" size="sm" onClick={() => openIntervaloModal()}>
                            <Plus className="w-4 h-4 mr-1" /> Novo
                        </Button>
                    </div>

                    {intervalos.length === 0 ? (
                        <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border border-dashed text-center">
                            Nenhum intervalo configurado.
                        </p>
                    ) : (
                        intervalos.map((intv) => (
                            <Card
                                key={intv.idIntervalo}
                                className="hover:shadow-md transition-all"
                            >
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="flex items-center gap-2 truncate pr-2">
                                        <CardTitle className="text-lg font-semibold truncate">
                                            {intv.descricao}
                                        </CardTitle>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {intv.status ? "Ativo" : "Inativo"}
                                            </span>
                                            <Switch
                                                checked={intv.status}
                                                onCheckedChange={() => handleToggleIntervalo(intv)}
                                                id={`status-intv-${intv.idIntervalo}`}
                                            />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-muted-foreground flex items-center">
                                            <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                                            Horário da Pausa:
                                        </span>
                                        <span className="font-medium text-primary">
                                            {formatTime(intv.horaInicio)} - {formatTime(intv.horaFim)}
                                        </span>
                                    </div>

                                    <div className="pt-4 flex flex-col gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => openIntervaloModal(intv)}
                                        >
                                            <Edit className="mr-2 h-3 w-3" /> Editar
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="w-full bg-red-500 hover:bg-red-600 text-white"
                                            onClick={() => deleteIntervalo(intv.idIntervalo)}
                                        >
                                            <Trash className="mr-2 h-3 w-3" /> Remover
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Modal Editar Dia */}
            <Modal
                isOpen={isModalDiaOpen}
                onClose={() => setIsModalDiaOpen(false)}
                title={`Editar Configuração - ${dia ? DIAS_MAP[dia.diaSemana] : ""}`}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsModalDiaOpen(false)}>Cancelar</Button>
                        <Button variant="default" onClick={saveDia}>Salvar</Button>
                    </>
                }
            >
                <div className="flex flex-col gap-4 py-4">
                    <Input
                        label="Hora de Abertura"
                        type="time"
                        value={formatTime(diaFormData.horaInicio)}
                        onChange={(e) => setDiaFormData({ ...diaFormData, horaInicio: e.target.value })}
                    />
                    <Input
                        label="Hora de Fechamento"
                        type="time"
                        value={formatTime(diaFormData.horaFim)}
                        onChange={(e) => setDiaFormData({ ...diaFormData, horaFim: e.target.value })}
                    />
                    <Input
                        label="Duração do Slot da Agenda (minutos)"
                        type="number"
                        min={1}
                        value={diaFormData.intervaloSlotMinutos || ""}
                        onChange={(e) => setDiaFormData({ ...diaFormData, intervaloSlotMinutos: parseInt(e.target.value) || 0 })}
                    />
                </div>
            </Modal>

            {/* Modal Editar Intervalo */}
            <Modal
                isOpen={isModalIntervaloOpen}
                onClose={() => setIsModalIntervaloOpen(false)}
                title={intervaloFormData.idIntervalo ? "Editar Intervalo" : "Novo Intervalo"}
                footer={
                    <div className="flex justify-between w-full">
                        {intervaloFormData.idIntervalo ? (
                            <Button
                                variant="outline"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                onClick={() => deleteIntervalo(intervaloFormData.idIntervalo!)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Excluir
                            </Button>
                        ) : <div />}
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setIsModalIntervaloOpen(false)}>Cancelar</Button>
                            <Button variant="default" onClick={saveIntervalo}>Salvar</Button>
                        </div>
                    </div>
                }
            >
                <div className="flex flex-col gap-4 py-4">
                    <Input
                        label="Descrição"
                        placeholder="Ex: Almoço"
                        value={intervaloFormData.descricao || ""}
                        onChange={(e) => setIntervaloFormData({ ...intervaloFormData, descricao: e.target.value })}
                    />
                    <Input
                        label="Hora Início"
                        type="time"
                        value={formatTime(intervaloFormData.horaInicio)}
                        onChange={(e) => setIntervaloFormData({ ...intervaloFormData, horaInicio: e.target.value })}
                    />
                    <Input
                        label="Hora Fim"
                        type="time"
                        value={formatTime(intervaloFormData.horaFim)}
                        onChange={(e) => setIntervaloFormData({ ...intervaloFormData, horaFim: e.target.value })}
                    />
                    <div className="flex items-center gap-3 pt-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status Ativo</span>
                        <Switch
                            checked={!!intervaloFormData.status}
                            onCheckedChange={(checked) => setIntervaloFormData({ ...intervaloFormData, status: checked })}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
