/**
 * Utilitários de formatação e validação para campos de cadastro.
 * Pensado pra minimizar erros do franqueado preenchendo o quiz.
 */

/**
 * Máscara de telefone brasileiro.
 * Aceita 10 ou 11 dígitos. Formata como (XX) XXXX-XXXX ou (XX) XXXXX-XXXX.
 */
export function maskTelefoneBR(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    // 10 dígitos: fixo (XX) XXXX-XXXX
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  // 11 dígitos: celular (XX) XXXXX-XXXX
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Valida se um telefone (já mascarado ou cru) tem 10 ou 11 dígitos.
 */
export function isTelefoneValido(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}

/**
 * Retorna apenas dígitos do telefone (E.164-ish sem +55).
 */
export function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

/**
 * Adiciona +55 se ainda não tiver código de país.
 * Útil pra salvar no banco em formato internacional.
 */
export function telefoneE164BR(raw: string): string {
  const d = digitsOnly(raw);
  if (!d) return "";
  if (d.startsWith("55")) return `+${d}`;
  return `+55${d}`;
}

/**
 * Validação simples de email.
 */
export function isEmailValido(raw: string): boolean {
  if (!raw || !raw.trim()) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw.trim());
}

/**
 * Normaliza handle do Instagram: garante @ no início e remove espaços.
 */
export function maskInstagram(raw: string): string {
  let v = raw.trim().replace(/\s+/g, "");
  if (!v) return "";
  // Remove URL completa caso colem
  v = v.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  v = v.replace(/\/.*$/, "");
  // Garante @
  if (!v.startsWith("@")) v = "@" + v;
  // Permite só caracteres válidos do IG (letras, números, ponto, underscore)
  v = "@" + v.slice(1).replace(/[^a-zA-Z0-9._]/g, "");
  return v.slice(0, 32);
}

/**
 * Capitaliza primeira letra de cada palavra (Title Case BR).
 * Mantém preposições em minúsculo.
 */
export function titleCase(raw: string): string {
  if (!raw) return "";
  const stopWords = new Set([
    "de", "da", "do", "das", "dos", "e", "para", "com",
  ]);
  return raw
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) => {
      if (i > 0 && stopWords.has(w)) return w;
      if (w.length === 0) return w;
      return w[0].toUpperCase() + w.slice(1);
    })
    .join(" ")
    .trim();
}

/**
 * Trim e colapsa múltiplos espaços.
 */
export function cleanText(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

/**
 * Limpa email: trim + lowercase.
 */
export function cleanEmail(raw: string): string {
  return raw.trim().toLowerCase();
}
