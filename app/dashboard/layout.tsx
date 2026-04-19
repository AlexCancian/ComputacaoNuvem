"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isFinanceiro = pathname?.startsWith("/dashboard/financeiro");

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Top Navigation */}
      <DashboardHeader />

      {/* Main Content */}
      <main
        className={cn(
          "animate-in fade-in duration-500",
          !isFinanceiro && "container mx-auto py-8 px-4 sm:px-6 lg:px-8"
        )}
      >
        {children}
      </main>
    </div>
  );
}
