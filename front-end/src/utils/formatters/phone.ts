export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return "";
  const cleaned = String(phone).replace(/\D/g, "");
  // Common VN format for 10-digit mobile: 0xx xxxx xxx
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }
  // Fallback: group by 3
  return cleaned.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
};
