export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export const usersData: User[] = [
  {
    id: "1",
    name: "Trần Nguyễn Khang",
    phone: "0345 987 621",
    email: "khang@gmail.com",
  },
  {
    id: "2",
    name: "Nguyễn Thúy Chi",
    phone: "0887 345 190",
    email: "chi@gmail.com",
  },
  {
    id: "3",
    name: "Lê Văn Đức",
    phone: "0912 678 453",
    email: "duc@gmail.com",
  },
  {
    id: "4",
    name: "Nguyễn Thị Mai",
    phone: "0703 516 982",
    email: "mai@gmail.com",
  },
  {
    id: "5",
    name: "Hoàng Quốc Việt",
    phone: "0567 294 305",
    email: "viet@gmail.com",
  },
];