export interface DiaSemana {
  idHorario: number;
  diaSemana: number;
  horaInicio: string | null;
  horaFim: string | null;
  intervaloSlotMinutos: number;
  ativo: boolean;
}

export interface IntervaloFuncionamento {
  idIntervalo: number;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  descricao: string;
  status: boolean;
}

export interface Feriado {
  idBloqueio: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  motivo: string;
  ativo: boolean;
}
