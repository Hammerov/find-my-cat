export function sanitizeWhatsappNumber(value: string): string {
  return value.replace(/[^\d]/g, "");
}

export function buildWhatsappLink(value: string, message: string): string {
  const number = sanitizeWhatsappNumber(value);
  const text = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${text}`;
}
