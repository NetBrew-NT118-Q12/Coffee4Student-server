import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { useTopProducts } from "../../hook/useTopProducts";
import { formatCurrency } from "../../utils/formatters/currency";
import { formatCompactNumber } from "../../utils/formatters/number";

export default function TopSellingProducts() {
  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
  } = useTopProducts(5);

  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  let content;

  if (isLoading) {
    content = (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-[#452302] rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Đang tải...</p>
      </div>
    );
  } else if (isError) {
    content = (
      <div className="text-center py-12 text-red-500 dark:text-red-400">
        {isError}
      </div>
    );
  } else if (products.length === 0) {
    content = (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        Không có sản phẩm bán chạy nào trong kỳ này.
      </div>
    );
  } else {
    content = (
      <div className="space-y-4">
        {products.map((product, index) => (
          <div
            key={product.product_id || index}
            className="flex items-center gap-3"
          >
            {/* Rank */}
            <span
              className={`w-6 h-6 flex items-center justify-center text-sm font-bold rounded-full shrink-0 ${
                index === 0
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300"
              }`}
            >
              {index + 1}
            </span>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                {product.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatCurrency(product.price)}
              </p>
            </div>

            {/* Quantity */}
            <span className="text-sm font-semibold text-gray-800 dark:text-white/90 shrink-0">
              {formatCompactNumber(product.total_sold)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Top Selling Products
        </h3>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Xem chi tiết
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Xuất báo cáo
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {content}
    </div>
  );
}
