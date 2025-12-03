export const truncateText = (
  text: string | null | undefined,
  length = 50,
  suffix = "..."
): string => {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.slice(0, length) + suffix;
};

export const formatTextLabel = (text: string | null | undefined): string => {
  if (!text) return "";
  let result = String(text).replace(/_/g, " ");
  result = result.replace(/([a-z])([A-Z])/g, "$1 $2");
  return result
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};
