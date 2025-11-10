export interface Order {
  id: string;
  customer: string;
  items: string;
  total: string;
  status: "Completed" | "Processing" | "Pending" | "Cancelled";
}

export const ordersData: Order[] = [
  {
    id: "01",
    customer: "Trần Nguyễn Khang",
    items: "Cappuccino nóng",
    total: "59,000",
    status: "Completed",
  },
  {
    id: "02",
    customer: "Nguyễn Thúy Chi",
    items: "Caramel macchiato đá",
    total: "59,000",
    status: "Processing",
  },
  {
    id: "03",
    customer: "Lê Văn Đức",
    items: "Espresso nóng",
    total: "59,000",
    status: "Pending",
  },
  {
    id: "04",
    customer: "Nguyễn Thị Mai",
    items: "Espresso đá",
    total: "59,000",
    status: "Cancelled",
  },
  {
    id: "05",
    customer: "Hoàng Quốc Việt",
    items: "Latte nóng",
    total: "59,000",
    status: "Completed",
  },
];