"use client";

import React, { useState } from "react";
import { Tabs } from "@/components/Tabs";
import SemanaTab from "./SemanaTab";
import WhatsTab from "./WhatsTab";

export default function ConfiguracoesPage() {
    const [activeTab, setActiveTab] = useState("semana");

    const tabs = [
        { label: "Semana", value: "semana" },
        { label: "WhatsApp", value: "whats" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground mt-2">
                    Gerencie os horários de funcionamento e a conexão com o WhatsApp.
                </p>
            </div>

            <div className="flex border-b border-border pb-4">
                <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            <div className="mt-6">
                {activeTab === "semana" && <SemanaTab />}
                {activeTab === "whats" && <WhatsTab />}
            </div>
        </div>
    );
}
