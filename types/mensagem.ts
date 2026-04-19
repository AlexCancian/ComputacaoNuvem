export interface Mensagem {
  id: string;
  nome?: string;
  agendaPara: string;
  payload: {
    texto: string;
    telefone: string;
  };
  status: string;
  tentativas: number;
  agendaId?: {
    idAgenda: number;
    dataAgenda: string;
    horaInicialAgenda: string;
    horaFinal: string;
    pagamento: boolean;
  };
}
