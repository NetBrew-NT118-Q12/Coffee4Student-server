export const getStatusColor = (
  status: string | null | undefined
): { bg: string; text: string } => {
  const s = (status || "").toLowerCase();
  const map: Record<string, { bg: string; text: string }> = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-700" },
    processing: { bg: "bg-blue-100", text: "text-blue-700" },
    completed: { bg: "bg-green-100", text: "text-green-700" },
    cancelled: { bg: "bg-red-100", text: "text-red-700" },
    active: { bg: "bg-green-100", text: "text-green-700" },
    inactive: { bg: "bg-gray-100", text: "text-gray-700" },
  };
  return map[s] || { bg: "bg-gray-100", text: "text-gray-700" };
};

export const formatStatusLabel = (
  status: string | null | undefined
): string => {
  const s = (status || "").toLowerCase();
  const map: Record<string, string> = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    active: "Hoạt động",
    inactive: "Không hoạt động",
  };
  return map[s] || status || "N/A";
};
