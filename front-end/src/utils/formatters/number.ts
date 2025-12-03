export const formatPercent = (
  value: number | null | undefined,
  decimals = 0
): string => {
  if (value === null || value === undefined || isNaN(Number(value)))
    return "0%";
  return `${Number(value).toFixed(decimals)}%`;
};

export const formatCompactNumber = (
  value: number | null | undefined
): string => {
  if (value === null || value === undefined || isNaN(Number(value))) return "0";
  const num = Number(value);
  if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
};

export const formatFileSize = (bytes: number | null | undefined): string => {
  if (bytes === null || bytes === undefined || isNaN(Number(bytes)))
    return "0 B";
  let size = Math.abs(Number(bytes));
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(2)} ${units[i]}`;
};
