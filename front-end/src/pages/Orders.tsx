import { useState } from "react";
import PageMeta from "../components/common/PageMeta";
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
import {
  useOrders,
  useDeleteOrder,
  useUpdateOrderStatus,
} from "../hook/useOrders";
import type { Order } from "../types/order";

const ITEMS_PER_PAGE = 10;

const Orders = () => {
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Fetch orders
  const { data, isLoading, error } = useOrders({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    status: statusFilter,
  });

  const orders = data?.orders || [];
  const totalPages = data?.total ? Math.ceil(data.total / ITEMS_PER_PAGE) : 1;

  // Mutations
  const deleteOrderMutation = useDeleteOrder();
  const updateStatusMutation = useUpdateOrderStatus();

  function toggleRowDropdown(orderId: string) {
    setOpenRowId(openRowId === orderId ? null : orderId);
  }

  function closeRowDropdown() {
    setOpenRowId(null);
  }

  // Handle update status
  const handleUpdateStatus = async (
    orderId: number,
    newStatus: Order["status"]
  ) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        data: { status: newStatus },
      });
      closeRowDropdown();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleDeleteClick = (order: Order) => {
    setOrderToDelete(order);
    setIsDeleteConfirmOpen(true);
    closeRowDropdown();
  };

  const confirmDelete = async () => {
    if (orderToDelete) {
      try {
        await deleteOrderMutation.mutateAsync(orderToDelete.order_id);
        setIsDeleteConfirmOpen(false);
        setOrderToDelete(null);
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    }
  };

  const cancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setOrderToDelete(null);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "success";
      case "Processing":
        return "info";
      case "Pending":
        return "warning";
      case "Cancelled":
        return "error";
      default:
        return "info";
    }
  };

  // Get status text in Vietnamese
  const getStatusText = (status: string) => {
    switch (status) {
      case "Completed":
        return "Hoàn thành";
      case "Processing":
        return "Đang xử lý";
      case "Pending":
        return "Chờ xử lý";
      case "Cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <>
      <PageMeta
        title="Đơn hàng | Coffee4Student"
        description="Quản lý đơn hàng"
      />
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Đơn hàng
          </h1>

          {/* Status Filter */}
          <select
            value={statusFilter || "all"}
            onChange={(e) =>
              setStatusFilter(
                e.target.value === "all" ? undefined : e.target.value
              )
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#452302] focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Pending">Chờ xử lý</option>
            <option value="Processing">Đang xử lý</option>
            <option value="Completed">Hoàn thành</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
        </div>

        {/* Loading / Error */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-[#452302] rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Đang tải...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-500">
            {error instanceof Error ? error.message : "Lỗi khi tải dữ liệu"}
          </div>
        )}

        {/* Orders Table */}
        {!isLoading && !error && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/3 sm:px-6">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="py-3 font-semibold text-gray-600 text-start text-theme-sm dark:text-gray-400"
                    >
                      Mã đơn
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
                      Sản phẩm
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 font-semibold text-gray-600 text-start text-theme-sm dark:text-gray-400"
                    >
                      Tổng tiền
                    </TableCell>
                    <TableCell
                      isHeader
                      className="py-3 font-semibold text-gray-600 text-start text-theme-sm dark:text-gray-400"
                    >
                      Ngày đặt
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
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {orders.length === 0 ? (
                    <TableRow>
                      {/* FIX: Dùng colspan thay vì colSpan */}
                      <TableCell
                        colspan={7}
                        className="py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        Không có đơn hàng nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow
                        key={order.order_id}
                        className="hover:bg-gray-50 dark:hover:bg-white/5"
                      >
                        <TableCell className="py-4 text-gray-900 text-theme-sm dark:text-white/90">
                          #{order.order_id}
                        </TableCell>
                        <TableCell className="py-4 font-normal text-gray-900 text-theme-sm dark:text-white/90">
                          {order.user?.username || `User #${order.user_id}`}
                        </TableCell>
                        <TableCell className="py-4 text-gray-900 text-theme-sm dark:text-white/90">
                          {order.order_items?.length || 0} sản phẩm
                        </TableCell>
                        <TableCell className="py-4 text-gray-900 text-theme-sm dark:text-white/90">
                          {order.total_price.toLocaleString("vi-VN")}đ
                        </TableCell>
                        <TableCell className="py-4 text-gray-900 text-theme-sm dark:text-white/90">
                          {new Date(order.created_at).toLocaleDateString(
                            "vi-VN"
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge size="sm" color={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <div className="relative inline-block">
                            <button
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              onClick={() =>
                                toggleRowDropdown(order.order_id.toString())
                              }
                            >
                              <MoreDotIcon className="size-5" />
                            </button>
                            <Dropdown
                              isOpen={openRowId === order.order_id.toString()}
                              onClose={closeRowDropdown}
                              className="w-40 p-2"
                            >
                              {order.status === "Pending" && (
                                <DropdownItem
                                  onItemClick={() =>
                                    handleUpdateStatus(
                                      order.order_id,
                                      "Processing"
                                    )
                                  }
                                  className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                                >
                                  Xử lý đơn
                                </DropdownItem>
                              )}
                              {order.status === "Processing" && (
                                <DropdownItem
                                  onItemClick={() =>
                                    handleUpdateStatus(
                                      order.order_id,
                                      "Completed"
                                    )
                                  }
                                  className="flex w-full font-normal text-left text-green-500 rounded-lg hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-500/10 dark:hover:text-green-300"
                                >
                                  Hoàn thành
                                </DropdownItem>
                              )}
                              {(order.status === "Pending" ||
                                order.status === "Processing") && (
                                <>
                                  <DropdownItem
                                    onItemClick={() =>
                                      handleUpdateStatus(
                                        order.order_id,
                                        "Cancelled"
                                      )
                                    }
                                    className="flex w-full font-normal text-left text-orange-500 rounded-lg hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-300"
                                  >
                                    Hủy đơn
                                  </DropdownItem>
                                  {/* THÊM NÚT XÓA */}
                                  <DropdownItem
                                    onItemClick={() => handleDeleteClick(order)}
                                    className="flex w-full font-normal text-left text-red-500 rounded-lg hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                                  >
                                    Xóa đơn
                                  </DropdownItem>
                                </>
                              )}
                            </Dropdown>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
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

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex items-center justify-center w-8 h-8 text-sm font-medium rounded-full transition-colors ${
                      currentPage === page
                        ? "text-white"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                    }`}
                    style={
                      currentPage === page
                        ? { backgroundColor: "#452302" }
                        : undefined
                    }
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
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
        )}
      </div>

      {/* THÊM DELETE CONFIRMATION MODAL */}
      {isDeleteConfirmOpen && orderToDelete && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          style={{ zIndex: 10000 }}
          onClick={cancelDelete}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md m-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Xác nhận xóa đơn
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hành động này không thể hoàn tác
                </p>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Bạn có chắc chắn muốn xóa đơn hàng{" "}
              <span className="font-semibold">#{orderToDelete.order_id}</span>{" "}
              không?
            </p>

            {deleteOrderMutation.isError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  Có lỗi xảy ra khi xóa đơn hàng. Vui lòng thử lại.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                disabled={deleteOrderMutation.isPending}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteOrderMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteOrderMutation.isPending ? "Đang xóa..." : "Xóa đơn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Orders;
