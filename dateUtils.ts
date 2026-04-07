/**
 * Formata uma data para o formato DD-MM-YYYY
 */
export function formatDateBR(date: Date | string | null | undefined): string {
  if (!date) return "";
  
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  
  return `${day}-${month}-${year}`;
}

/**
 * Converte uma string DD-MM-YYYY para Date
 */
export function parseDateBR(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  
  return new Date(year, month - 1, day);
}

/**
 * Converte uma data para formato YYYY-MM-DD (para input type="date")
 */
export function toInputFormat(date: Date | string | null | undefined): string {
  if (!date) return "";
  
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
}

/**
 * Converte um input type="date" (YYYY-MM-DD) para Date
 */
export function fromInputFormat(dateStr: string): Date | null {
  if (!dateStr) return null;
  return new Date(dateStr);
}
