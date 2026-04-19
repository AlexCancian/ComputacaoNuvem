export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const formatDate = (dateString: string) => {
  if (!dateString) return "";
  // Extract just the date part (YYYY-MM-DD) to handle both 'YYYY-MM-DD' and 'YYYY-MM-DDTHH:mm:ss...'
  // This prevents timezone shifts (e.g. UTC 00:00 -> Local Previous Day) when displaying dates.
  const datePart = dateString.substring(0, 10);

  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [year, month, day] = datePart.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("pt-BR");
  }
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
};

export const formatTime = (timeString: string) => {
  if (!timeString) return "";
  return timeString.substring(0, 5);
};

export const stripNonDigits = (value: string) => {
  return value.replace(/\D/g, "");
};

export const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

export const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
};
