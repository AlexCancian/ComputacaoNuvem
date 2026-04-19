/**
 * Valida um número de telefone brasileiro para envio via WhatsApp.
 *
 * Regras:
 * - Não pode começar com 0
 * - Deve ter entre 10 e 13 dígitos (ex: DDD+numero ou DDI+DDD+numero)
 * - Formato esperado final: 55XXXXXXXXXXX (13 dígitos com DDI)
 * - Aceita somente dígitos
 */
export interface ValidacaoTelefone {
  valido: boolean;
  motivo?: string;
  telefoneFormatado?: string;
}

export function validarTelefone(telefone: string | number | undefined | null): ValidacaoTelefone {
  if (telefone === undefined || telefone === null || String(telefone).trim() === "") {
    return { valido: false, motivo: "Telefone vazio" };
  }

  // Remove qualquer caractere não numérico
  const limpo = String(telefone).replace(/\D/g, "");

  if (limpo.length === 0) {
    return { valido: false, motivo: "Telefone não contém números" };
  }

  // Não pode começar com 0
  if (limpo.startsWith("0")) {
    return { valido: false, motivo: "Telefone não pode começar com 0" };
  }

  // Tamanho: mínimo 10 (DDD+número fixo), máximo 13 (DDI+DDD+celular)
  if (limpo.length < 11) {
    return { valido: false, motivo: `Telefone muito curto (${limpo.length} dígitos, mínimo 11)` };
  }

  if (limpo.length > 11) {
    return { valido: false, motivo: `Telefone muito longo (${limpo.length} dígitos, máximo 11)` };
  }

  return { valido: true, telefoneFormatado: limpo };
}
