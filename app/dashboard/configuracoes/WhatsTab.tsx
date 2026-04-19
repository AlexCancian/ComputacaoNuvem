"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/Buttons";
import { Input } from "@/components/Inputs";
import { toast } from "react-toastify";
import { whatsService } from "@/services/whatsService";
import { socketService } from "@/services/socketService";
import { Phone, QrCode, Trash2, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function WhatsTab() {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loadingQr, setLoadingQr] = useState(false);
    const [loadingPhone, setLoadingPhone] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [status, setStatus] = useState<string>("Desconectado");
    const [pairingCode, setPairingCode] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialStatus = async () => {
            try {
                const data = await whatsService.getStatus();
                if (data.status === "qr" && data.qrcode) {
                    setQrCode(data.qrcode);
                    setStatus("Aguardando leitura do QRCode...");
                } else if (data.status === "connected") {
                    setStatus("connected");
                } else if (data.status) {
                    setStatus(data.status);
                }
            } catch (err) {
                console.error("Erro ao puxar status inicial:", err);
            }
        };

        fetchInitialStatus();

        const socket = socketService.connect();

        socket.on("whatsapp_status", (payload: any) => {
            console.log("Status do WhatsApp:", payload);

            if (payload?.data?.status === "qr" && payload?.data?.qrCode) {
                setQrCode(payload.data.qrCode);
                setPairingCode(null);
                setStatus("Aguardando leitura do QRCode...");
            } else if (payload?.data?.status === "pairingCode" && payload?.data?.pairingCode) {
                setPairingCode(payload.data.pairingCode);
                setStatus("Aguardando pareamento. Insira o código no seu WhatsApp.");
            } else if (payload?.data?.status) {
                // Clear codes if connected
                if (payload.data.status === "connected" || payload.data.status === "open") {
                    setQrCode(null);
                    setPairingCode(null);
                }
                setStatus(payload.data.status);
            }
        });

        // Also fallback to generic if the server sends anything else
        socket.on("whats_event", (payload: any) => {
            console.log("Outro evento do Whats chegou:", payload);
            if (payload?.status) {
                setStatus(payload.status);
            }
        });

        return () => {
            socket.off("whatsapp_status");
            socket.off("whats_event");
        };
    }, []);

    const handleGetQrCode = async () => {
        setLoadingQr(true);
        setPairingCode(null);
        try {
            const data = await whatsService.getQrCode();
            if (data.qrcode) setQrCode(data.qrcode);
            setStatus("Aguardando leitura do QRCode...");
            toast.success("Aguardando QR Code...");
        } catch (error) {
            toast.error("Erro ao solicitar QR Code");
        } finally {
            setLoadingQr(false);
        }
    };

    const handleSendPhone = async () => {
        const cleanPhone = phoneNumber.replace(/\D/g, "");
        if (cleanPhone.length !== 13) {
            toast.error("O número de telefone deve conter exatamente 13 dígitos (DDI + DDD + Número)");
            return;
        }
        setLoadingPhone(true);
        setQrCode(null);
        try {
            const data = await whatsService.getPairingCode(cleanPhone);
            if (data.pairingCode) setPairingCode(data.pairingCode);
            toast.success("Número enviado, aguardando código de pareamento...");
            setStatus("Aguardando código de pareamento...");
        } catch (error) {
            toast.error("Erro ao solicitar código de pareamento");
        } finally {
            setLoadingPhone(false);
        }
    };

    const handleDeleteSession = async () => {
        setLoadingDelete(true);
        try {
            await whatsService.clearSession();
            setQrCode(null);
            setPairingCode(null);
            setPhoneNumber("");
            setStatus("Sessão limpa. Desconectado.");
            toast.success("Sessão limpa com sucesso.");
        } catch (error) {
            toast.error("Erro ao limpar sessão");
        } finally {
            setLoadingDelete(false);
        }
    };

    return (
        <div className="space-y-8 p-6 bg-white rounded-lg shadow-sm border border-border">
            <div>
                <h2 className="text-xl font-semibold mb-2">Conexão WhatsApp</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Conecte seu WhatsApp lendo o QRCode ou inserindo o número de telefone.
                </p>

                <div className="mb-4 flex items-center">
                    <span className="text-sm font-medium mr-2 text-gray-700">Status da Conexão:</span>
                    {(status === "connected" || status === "open") ? (
                        <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800 border border-green-200 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                            Conectado ao WhatsApp!
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {status}
                        </span>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Conexão por QR Code */}
                <div className="p-6 border border-gray-100 rounded-lg bg-gray-50 space-y-4">
                    <div className="flex items-center space-x-2 mb-2">
                        <QrCode className="h-5 w-5 text-gray-500" />
                        <h3 className="font-medium">Conectar via QR Code</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 tracking-tight">
                        Clique no botão abaixo para gerar o QRCode e usar a conexão via aparelho.
                    </p>

                    <div className="flex flex-col items-center space-y-4">
                        {qrCode ? (
                            <div className="p-4 bg-white border rounded-lg shadow-sm flex justify-center">
                                {/* Usa QRCodeSVG para renderizar o token que o backend enviou */}
                                <QRCodeSVG value={qrCode} size={200} />
                            </div>
                        ) : (
                            <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                                <QrCode className="w-12 h-12 opacity-50" />
                            </div>
                        )}

                        <Button onClick={handleGetQrCode} disabled={loadingQr} className="w-full">
                            {loadingQr ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
                            {qrCode ? "Atualizar QR Code" : "Gerar QR Code"}
                        </Button>
                    </div>
                </div>

                {/* Conexão via Telefone */}
                <div className="p-6 border border-gray-100 rounded-lg bg-gray-50 space-y-4">
                    <div className="flex items-center space-x-2 mb-2">
                        <Phone className="h-5 w-5 text-gray-500" />
                        <h3 className="font-medium">Conectar via Telefone</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 tracking-tight">
                        Se preferir não usar o QRCode, insira o número do telefone com DDI (Ex: 5511999999999).
                    </p>

                    <div className="space-y-4">
                        {pairingCode && (
                            <div className="p-4 bg-primary/10 border-primary/20 border rounded-lg text-center mb-4">
                                <p className="text-sm font-medium text-primary mb-1">Código de Pareamento:</p>
                                <p className="text-3xl font-bold tracking-[0.2em] text-primary">
                                    {pairingCode}
                                </p>
                            </div>
                        )}

                        <div>
                            <Input
                                placeholder="Ex. 5555999999999"
                                value={phoneNumber}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
                            />
                        </div>

                        <Button onClick={handleSendPhone} disabled={loadingPhone || !phoneNumber} className="w-full">
                            {loadingPhone ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Phone className="mr-2 h-4 w-4" />}
                            Enviar Número
                        </Button>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t mt-8">
                <h3 className="font-medium mb-4 text-red-600">Ações Críticas</h3>
                <Button variant="destructive" onClick={handleDeleteSession} disabled={loadingDelete}>
                    {loadingDelete ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Limpar Sessão
                </Button>
            </div>
        </div>
    );
}
