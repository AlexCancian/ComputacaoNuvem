import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/Card";
import {
  Bot,
  MessageCircle,
  Settings,
  Upload,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";

const modules = [
  {
    name: "Trabalhos Solicitados",
    description: "Histórico de jobs e download de planilhas",
    icon: ClipboardList,
    href: "/dashboard/trabalhos",
    color: "text-blue-500",
  },
  {
    name: "Upload Planilha",
    description: "Envio de planilhas para disparo de mensagens",
    icon: Upload,
    href: "/dashboard/upload",
    color: "text-emerald-500",
  },
  {
    name: "Mensagens",
    description: "Envio de lembretes e marketing",
    icon: MessageCircle,
    href: "/dashboard/mensagens",
    color: "text-yellow-500",
  },
  {
    name: "Prompt Mensagens",
    description: "Configuração de mensagens",
    icon: Bot,
    href: "/dashboard/prompts-ia",
    color: "text-indigo-500",
  },
  {
    name: "Configurações",
    description: "Gerenciar dias, horários e feriados",
    icon: Settings,
    href: "/dashboard/configuracoes",
    color: "text-slate-500",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo(a)</h1>
        <p className="text-muted-foreground mt-2">
          Escolha um módulo.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {modules.map((module) => (
          <Link
            key={module.name}
            href={module.href}
            className="group block h-full"
          >
            <Card className="h-full transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {module.name}
                </CardTitle>
                <module.icon
                  className={`h-6 w-6 ${module.color} opacity-75 group-hover:opacity-100 transition-opacity`}
                />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm mt-2">
                  {module.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
