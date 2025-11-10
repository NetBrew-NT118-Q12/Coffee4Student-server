import { useState } from "react";
import PageMeta from "../components/common/PageMeta";
import { ordersData } from "../assets/data/orders";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import Badge from "../components/ui/badge/Badge";
import { MoreDotIcon } from "../icons";
import { Dropdown } from "../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../components/ui/dropdown/DropdownItem";

const Orders = () => {
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const [currentPage, _setCurrentPage] = useState(1);

  function toggleRowDropdown(orderId: string) {
    setOpenRowId(openRowId === orderId ? null : orderId);
  }

  function closeRowDropdown() {
    setOpenRowId(null);
  }

  return (
    <>
      <PageMeta
        title="Đơn hàng | Coffee4Student"
        description="Quản lý đơn hàng"
      />
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Orders
          </h1>
        </div>

        {/* Orders Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/3 sm:px-6">
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
                    Khách hàng
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 font-semibold text-gray-600 text-start text-theme-sm dark:text-gray-400"
                  >
                    Đơn hàng
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 font-semibold text-gray-600 text-start text-theme-sm dark:text-gray-400"
                  >
                    Tổng giá
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 font-semibold text-gray-600 text-start text-theme-sm dark:text-gray-400"
                  >
                    Trạng thái
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 font-semibold text-gray-600 text-center text-theme-sm dark:text-gray-400"
                  >
                    Chi tiết
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {ordersData.map((order) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/5"
                  >
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

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 py-4">
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            className="flex items-center justify-center w-8 h-8 text-sm font-medium text-white rounded-full"
            style={{ backgroundColor: "#452302" }}
          >
            {currentPage}
          </button>

          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 rounded-lg">
            2
          </button>

          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default Orders;
