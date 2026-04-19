import * as XLSX from "xlsx";
import { validarTelefone } from "./validarTelefone";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Colunas aceitas (case-insensitive). "valor" é opcional.
const COLUNAS_OBRIGATORIAS = ["nome", "telefone"];
const COLUNAS_OPCIONAIS = ["valor"];
const TODAS_COLUNAS_ACEITAS = [...COLUNAS_OBRIGATORIAS, ...COLUNAS_OPCIONAIS];

export interface ResultadoValidacao {
  valido: boolean;
  erros: string[];
  avisos: string[];
  preview: Record<string, any>[];
  totalLinhas: number;
  colunasEncontradas: string[];
  errosTelefone: { linha: number; telefone: string; motivo: string }[];
}

/**
 * Normaliza o nome da coluna para comparação
 */
function normalizar(col: string): string {
  return col
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/\s+/g, "");
}

/**
 * Valida o tamanho do arquivo
 */
export function validarTamanhoArquivo(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return `Arquivo muito grande (${sizeMB}MB). Tamanho máximo permitido: 10MB.`;
  }
  return null;
}

/**
 * Lê e valida um arquivo XLSX no client-side
 */
export async function validarPlanilha(file: File): Promise<ResultadoValidacao> {
  const resultado: ResultadoValidacao = {
    valido: true,
    erros: [],
    avisos: [],
    preview: [],
    totalLinhas: 0,
    colunasEncontradas: [],
    errosTelefone: [],
  };

  // 1. Validar tamanho
  const erroTamanho = validarTamanhoArquivo(file);
  if (erroTamanho) {
    resultado.valido = false;
    resultado.erros.push(erroTamanho);
    return resultado;
  }

  // 2. Ler o arquivo
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  if (workbook.SheetNames.length === 0) {
    resultado.valido = false;
    resultado.erros.push("A planilha não contém nenhuma aba.");
    return resultado;
  }

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  if (data.length === 0) {
    resultado.valido = false;
    resultado.erros.push("A planilha está vazia (sem dados).");
    return resultado;
  }

  resultado.totalLinhas = data.length;

  // 3. Pegar nomes das colunas originais
  const colunasOriginais = Object.keys(data[0]);
  resultado.colunasEncontradas = colunasOriginais;

  // 4. Mapear colunas (normalizado -> original)
  const colunasNormalizadas = colunasOriginais.map((col) => ({
    original: col,
    normalizado: normalizar(col),
  }));

  // 5. Verificar colunas obrigatórias
  for (const col of COLUNAS_OBRIGATORIAS) {
    const encontrada = colunasNormalizadas.some((c) => c.normalizado === col);
    if (!encontrada) {
      resultado.valido = false;
      resultado.erros.push(`Coluna obrigatória "${col}" não encontrada na planilha.`);
    }
  }

  // 6. Verificar colunas extras não permitidas
  const colunasExtras = colunasNormalizadas.filter(
    (c) => !TODAS_COLUNAS_ACEITAS.includes(c.normalizado)
  );

  if (colunasExtras.length > 0) {
    const nomes = colunasExtras.map((c) => `"${c.original}"`).join(", ");
    resultado.valido = false;
    resultado.erros.push(
      `A planilha contém colunas não permitidas: ${nomes}. Colunas aceitas: nome, telefone e valor (opcional).`
    );
  }

  // 7. Verificar se coluna valor existe (aviso se não)
  const temValor = colunasNormalizadas.some((c) => c.normalizado === "valor");
  if (!temValor) {
    resultado.avisos.push('Coluna "valor" não encontrada – ela é opcional e será ignorada.');
  }

  // 8. Encontrar as colunas pelo nome normalizado para validação de telefone
  const colTelefone = colunasNormalizadas.find((c) => c.normalizado === "telefone");

  // 9. Validar telefones
  if (colTelefone) {
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const telefoneRaw = row[colTelefone.original];
      const val = validarTelefone(telefoneRaw);

      if (!val.valido) {
        resultado.errosTelefone.push({
          linha: i + 2, // +2 porque index 0 = linha 2 (header é linha 1)
          telefone: String(telefoneRaw),
          motivo: val.motivo || "Inválido",
        });
      }
    }

    if (resultado.errosTelefone.length > 0) {
      resultado.valido = false;
      resultado.erros.push(
        `${resultado.errosTelefone.length} telefone(s) inválido(s) encontrado(s).`
      );
    }
  }

  // 10. Preview (top 10)
  resultado.preview = data.slice(0, 10);

  return resultado;
}
