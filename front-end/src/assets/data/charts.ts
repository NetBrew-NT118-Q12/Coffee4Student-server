export interface ChartData {
  categories: string[];
  data: number[];
  title: string;
}

export const monthlyChartData: Record<"week" | "month" | "year", ChartData> = {
  week: {
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    data: [45, 52, 38, 65, 72, 85, 68],
    title: "Doanh thu tuần này",
  },
  month: {
    categories: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
    data: [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112],
    title: "Doanh thu hàng tháng",
  },
  year: {
    categories: ["2020", "2021", "2022", "2023", "2024"],
    data: [2500, 3200, 2800, 3800, 4200],
    title: "Doanh thu hàng năm",
  },
};

export interface TopSellingProduct {
  name: string;
  price: string;
  sales: number;
}

export const topSellingProducts: TopSellingProduct[] = [
  { name: "Caramel macchiato đá", price: "59,000 VND", sales: 240 },
  { name: "Cappuccino nóng", price: "59,000 VND", sales: 210 },
  { name: "Espresso đá", price: "59,000 VND", sales: 180 },
  { name: "Caramel macchiato đá", price: "59,000 VND", sales: 150 },
  { name: "Latte nóng", price: "59,000 VND", sales: 100 },
];