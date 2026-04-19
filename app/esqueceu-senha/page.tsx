"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/Card";
import { Button } from "@/components/Buttons";
import { Input } from "@/components/Inputs";
import { authService } from "@/services/authService";
import { toast } from "react-toastify";
import Link from "next/link";
import { Mail, ArrowLeft, KeyRound, Lock, Eye, EyeOff } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Email
  const [email, setEmail] = useState("");

  // Step 2: Code & New Password
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 2 && codeRefs.current[0]) {
      codeRefs.current[0].focus();
    }
  }, [step]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Informe o e-mail");
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setStep(2);
      toast.success("Código de verificação enviado para o e-mail.");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Erro ao enviar e-mail.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1]; // Only 1 char

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next
    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleResetSubmit = async () => {
    if (code.some((c) => !c)) {
      toast.error("Preencha todo o código de verificação.");
      return;
    }
    if (!novaSenha || !confirmarSenha) {
      toast.error("Preencha a nova senha.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const codeString = code.join("");
      await authService.resetPassword({
        email,
        code: codeString,
        newPassword: novaSenha,
      });
      toast.success("Senha alterada com sucesso!");
      router.push("/login");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Erro ao alterar senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#F5F5F5]"
    >
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />

      <Card className="w-full max-w-md relative z-10 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.08)] border-none">
        <CardHeader className="space-y-4 flex flex-col items-center text-center pb-2">
          <div className="w-20 h-20 rounded-full bg-[#1FA84F]/10 flex items-center justify-center mb-2">
            <KeyRound className="w-10 h-10 text-[#1FA84F]" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">
              Recuperar Senha
            </CardTitle>
            <CardDescription className="text-slate-500">
              {step === 1
                ? "Informe seu e-mail para receber o código."
                : "Digite o código recebido e sua nova senha."}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <Input
                label="E-mail"
                placeholder="seu@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                iconLeft={<Mail className="h-4 w-4" />}
              />
               <Button
                className="w-full bg-[#1FA84F] hover:bg-[#178A40] text-[#FFFFFF] shadow-lg transition-all duration-300 transform hover:scale-[1.02] border-none"
                size="lg"
                type="submit"
                isLoading={loading}
              >
                Enviar Código
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Code Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Código de Verificação
                </label>
                <div className="flex justify-between gap-2">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        codeRefs.current[index] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-10 h-12 text-center text-xl font-bold border rounded-md border-input bg-background focus:outline-none focus:ring-2 focus:ring-[#1FA84F] transition-all uppercase"
                    />
                  ))}
                </div>
              </div>

              {/* New Passwords */}
              <div className="space-y-4">
                <Input
                  label="Nova Senha"
                  type={showPassword ? "text" : "password"}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  iconLeft={<Lock className="h-4 w-4" />}
                  iconRight={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none hover:text-slate-700 p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                />
                <Input
                  label="Confirmar Nova Senha"
                  type={showPassword ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  iconLeft={<Lock className="h-4 w-4" />}
                  error={
                    novaSenha && confirmarSenha && novaSenha !== confirmarSenha
                      ? "Senhas não conferem"
                      : undefined
                  }
                />
              </div>

               <Button
                className="w-full bg-[#1FA84F] hover:bg-[#178A40] text-[#FFFFFF] shadow-lg transition-all duration-300 transform hover:scale-[1.02] border-none"
                size="lg"
                onClick={handleResetSubmit}
                isLoading={loading}
                disabled={
                  !novaSenha ||
                  !confirmarSenha ||
                  novaSenha !== confirmarSenha ||
                  code.some((c) => !c)
                }
              >
                Alterar Senha
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center pt-2">
           <Link
            href="/login"
            className="flex items-center text-sm text-slate-500 hover:text-[#1FA84F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar para Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
