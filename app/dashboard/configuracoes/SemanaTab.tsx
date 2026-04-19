"use client";

import React, { useEffect, useState } from "react";
import { configuracaoService } from "@/services/configuracaoService";
import { DiaSemana, IntervaloFuncionamento } from "@/types/configuracao";
import { Switch } from "@/components/Switch";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/Card";
import { ChevronRight, Clock } from "lucide-react";

const DIAS_MAP = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
];

export default function SemanaTab() {
    const router = useRouter();
    const [dias, setDias] = useState<DiaSemana[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDias();
    }, []);

    const loadDias = async () => {
        try {
            setLoading(true);
            const data = await configuracaoService.getDias();
            setDias(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectDia = (dia: DiaSemana) => {
        router.push(`/dashboard/configuracoes/dia/${dia.idHorario}`);
    };

    const handleToggleDiaAtivo = async (dia: DiaSemana) => {
        try {
            await configuracaoService.updateDia(dia.idHorario, { ativo: !dia.ativo });
            await loadDias();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading && dias.length === 0) {
        return <div>Carregando horários...</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Lista de Dias */}
            <div className="w-full flex flex-col gap-3">
                <h2 className="text-xl font-semibold mb-2">Dias da Semana</h2>
                {dias.map((dia) => {
                    return (
                        <Card
                            key={dia.idHorario}
                            onClick={() => handleSelectDia(dia)}
                            className={`cursor-pointer transition-all hover:border-primary/50`}
                        >
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-lg">{DIAS_MAP[dia.diaSemana]}</h3>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {dia.ativo ? "Aberto" : "Fechado"}
                                    </p>
                                </div>
                                <div
                                    className="flex items-center gap-3"
                                    onClick={(e) => e.stopPropagation()} // Previne selecionar o card ao clicar no switch
                                >
                                    <Switch
                                        checked={dia.ativo}
                                        onCheckedChange={() => handleToggleDiaAtivo(dia)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
