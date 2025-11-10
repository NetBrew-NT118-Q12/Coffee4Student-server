import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { MoreDotIcon } from "../../icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState } from "react";

// Define the TypeScript interface for the table rows
interface Order {
  id: string;
  customer: string;
  items: string;
  total: string;
  status: "Completed" | "Processing" | "Pending" | "Cancelled";
}

// Define the table data using the interface
const tableData: Order[] = [
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

export default function RecentOrders() {
  const [isHeaderOpen, setIsHeaderOpen] = useState(false);
  const [openRowId, setOpenRowId] = useState<string | null>(null);

  function toggleHeaderDropdown() {
    setIsHeaderOpen(!isHeaderOpen);
  }

  function closeHeaderDropdown() {
    setIsHeaderOpen(false);
  }

  function toggleRowDropdown(orderId: string) {
    setOpenRowId(openRowId === orderId ? null : orderId);
  }

  function closeRowDropdown() {
    setOpenRowId(null);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/3 sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">
            Đơn hàng gần đây
          </h3>
        </div>

        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleHeaderDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          <Dropdown
            isOpen={isHeaderOpen}
            onClose={closeHeaderDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeHeaderDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Xem chi tiết
            </DropdownItem>
            <DropdownItem
              onItemClick={closeHeaderDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Xuất báo cáo
            </DropdownItem>
            <DropdownItem
              onItemClick={closeHeaderDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Lọc theo trạng thái
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-600 text-start text-theme-sm dark:text-gray-400"
              >
                ID
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-600 text-start text-theme-sm dark:text-gray-400"
              >
                Customer
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-600 text-start text-theme-sm dark:text-gray-400"
              >
                Items
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-600 text-start text-theme-sm dark:text-gray-400"
              >
                Total
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-600 text-start text-theme-sm dark:text-gray-400"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-semibold text-gray-600 text-center text-theme-sm dark:text-gray-400"
              >
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tableData.map((order) => (
              <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                <TableCell className="py-4 text-gray-900 text-theme-sm dark:text-white/90">
                  {order.id}
                </TableCell>
                <TableCell className="py-4 font-normal text-gray-900 text-theme-sm dark:text-white/90">
                  {order.customer}
                </TableCell>
                <TableCell className="py-4 text-gray-900 text-theme-sm dark:text-white/90">
                  {order.items}
                </TableCell>
                <TableCell className="py-4 text-gray-900 text-theme-sm dark:text-white/90">
                  {order.total}
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    size="sm"
                    color={
                      order.status === "Completed"
                        ? "success"
                        : order.status === "Processing"
                        ? "info"
                        : order.status === "Pending"
                        ? "warning"
                        : "error"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 text-center">
                  <div className="relative inline-block">
                    <button 
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={() => toggleRowDropdown(order.id)}
                    >
                      <MoreDotIcon className="size-5" />
                    </button>
                    <Dropdown
                      isOpen={openRowId === order.id}
                      onClose={closeRowDropdown}
                      className="w-40 p-2"
                    >
                      <DropdownItem
                        onItemClick={closeRowDropdown}
                        className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                      >
                        Xem chi tiết
                      </DropdownItem>
                      <DropdownItem
                        onItemClick={closeRowDropdown}
                        className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                      >
                        Chỉnh sửa
                      </DropdownItem>
                      <DropdownItem
                        onItemClick={closeRowDropdown}
                        className="flex w-full font-normal text-left text-red-500 rounded-lg hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                      >
                        Hủy đơn
                      </DropdownItem>
                    </Dropdown>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}