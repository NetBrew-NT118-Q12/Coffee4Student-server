export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
}

export const productsData: Product[] = [
  {
    id: "1",
    name: "Americano",
    price: "59,000 VND",
    image: "/images/americano.png",
    category: "Cà phê phin",
  },
  {
    id: "2",
    name: "Caramel macchiato đá",
    price: "59,000 VND",
    image: "/images/caramel-macchiato.png",
    category: "Cà phê phin",
  },
  {
    id: "3",
    name: "Cappuccino nóng",
    price: "59,000 VND",
    image: "/images/cappuccino-hot.png",
    category: "Cà phê nóng",
  },
  {
    id: "4",
    name: "Cappuccino đá",
    price: "59,000 VND",
    image: "/images/cappuccino-cold.png",
    category: "Cà phê phin",
  },
  {
    id: "5",
    name: "Chocolate",
    price: "59,000 VND",
    image: "/images/chocolate.png",
    category: "Đồ uống khác",
  },
  {
    id: "6",
    name: "Espresso đá",
    price: "59,000 VND",
    image: "/images/espresso-cold.png",
    category: "Cà phê phin",
  },
  {
    id: "7",
    name: "Espresso nóng",
    price: "59,000 VND",
    image: "/images/espresso-hot.png",
    category: "Cà phê nóng",
  },
  {
    id: "8",
    name: "Latte nóng",
    price: "59,000 VND",
    image: "/images/latte-hot.png",
    category: "Cà phê nóng",
  },
  {
    id: "9",
    name: "Matcha",
    price: "59,000 VND",
    image: "/images/matcha.png",
    category: "Trà",
  },
  {
    id: "10",
    name: "Matcha đá xay",
    price: "59,000 VND",
    image: "/images/matcha-frappe.png",
    category: "Trà",
  },
  {
    id: "11",
    name: "Trà sữa",
    price: "59,000 VND",
    image: "/images/milk-tea.png",
    category: "Trà",
  },
  {
    id: "12",
    name: "Trà trái cây",
    price: "59,000 VND",
    image: "/images/fruit-tea.png",
    category: "Trà",
  },
];

export const categories = [
  "Tất cả",
  "Americano",
  "Espresso",
  "Cà phê phin",
  "Cold Brew",
  "Matcha",
  "Trà sữa",
];