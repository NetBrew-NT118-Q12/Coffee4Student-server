import { useState } from "react";
import PageMeta from "../components/common/PageMeta";
import { PlusIcon, MoreDotIcon } from "../icons";
import { Dropdown } from "../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../components/ui/dropdown/DropdownItem";
import { productsData, categories } from "../assets/data/products";

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  function toggleDropdown(productId: string) {
    setOpenDropdownId(openDropdownId === productId ? null : productId);
  }

  function closeDropdown() {
    setOpenDropdownId(null);
  }

  const filteredProducts =
    selectedCategory === "Tất cả"
      ? productsData
      : productsData.filter((p) => p.category === selectedCategory);

  return (
    <>
      <PageMeta
        title="Sản phẩm | Coffee4Student"
        description="Quản lý sản phẩm"
      />
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Menu
          </h1>
          <button
            className="p-2 rounded-lg hover:bg-[#5a2f03] transition-colors"
            style={{ backgroundColor: "#452302" }}
          >
            <PlusIcon className="size-6" style={{ fill: "white" }} />
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-normal rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? "text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
              style={
                selectedCategory === category
                  ? { backgroundColor: "#452302" }
                  : undefined
              }
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 transition-shadow hover:shadow-lg"
            >
              {/* Dropdown Menu */}
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={() => toggleDropdown(product.id)}
                  className="p-1.5 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                >
                  <MoreDotIcon className="text-gray-600 size-5 dark:text-gray-400" />
                </button>
                <Dropdown
                  isOpen={openDropdownId === product.id}
                  onClose={closeDropdown}
                  className="w-40 p-2"
                >
                  <DropdownItem
                    onItemClick={closeDropdown}
                    className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                  >
                    Chỉnh sửa
                  </DropdownItem>
                  <DropdownItem
                    onItemClick={closeDropdown}
                    className="flex w-full font-normal text-left text-red-500 rounded-lg hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                  >
                    Xóa
                  </DropdownItem>
                </Dropdown>
              </div>

              {/* Product Image */}
              <div className="flex items-center justify-center h-48 p-6 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50">
                <div className="text-6xl">☕</div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-base font-medium text-gray-900 dark:text-white/90">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {product.price}
                </p>
              </div>
            </div>
          ))}
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

export default Products;
