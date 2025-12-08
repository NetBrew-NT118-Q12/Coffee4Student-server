export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN");
};

export const formatDateTime = (
  date: string | Date | null | undefined
): string => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN");
};

export const formatTime = (date: string | Date | null | undefined): string => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("vi-VN");
};
