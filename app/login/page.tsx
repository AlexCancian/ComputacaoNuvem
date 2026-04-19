"use client";

import React, { useState } from "react";
import Image from "next/image";
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
import { KeyRound, User, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    login: "", // email or cpf
    senha: "",
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});

  const validate = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.login) newErrors.login = "Login é obrigatório";
    if (!formData.senha) newErrors.senha = "Senha é obrigatória";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await authService.login(formData);

      if (result?.success) {
        toast.success("Login realizado com sucesso!");
        // Usamos router.push para manter o estado da memória (accessToken) ativo.
        // O window.location.href causaria um reload e perderíamos o token salvo em memória.
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message || error.message || "Erro ao realizar login. Verifique suas credenciais."
      );
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
          <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center -mb-15">
            <Image
              src="/principal.png"
              alt="Logo"
              width={280}
              height={280}
              priority
              className="object-contain"
            />
          </div>
          <div className="space-y-1">
            <CardDescription className="text-slate-500 font-medium">
              Acesse sua conta para continuar
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                label="Login (E-mail ou CPF)"
                placeholder="Digite seu e-mail ou CPF"
                type="text"
                value={formData.login}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, login: e.target.value }))
                }
                error={errors.login}
                iconLeft={<User className="h-4 w-4" />}
              />
            </div>

            <div className="space-y-2">
              <Input
                label="Senha"
                placeholder="**************"
                type={showPassword ? "text" : "password"}
                value={formData.senha}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, senha: e.target.value }))
                }
                error={errors.senha}
                iconLeft={<KeyRound className="h-4 w-4" />}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button
            className="w-full bg-[#1FA84F] hover:bg-[#178A40] text-[#FFFFFF] shadow-lg transition-all duration-300 transform hover:scale-[1.02] border-none"
            size="lg"
            onClick={handleSubmit}
            isLoading={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <div className="flex items-center justify-center w-full">
            <Link
              href="/esqueceu-senha"
              className="text-sm text-slate-500 hover:text-[#1FA84F] hover:underline transition-colors"
            >
              Esqueceu sua senha?
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
