import { useState, useEffect } from "react";
import PageMeta from "../components/common/PageMeta";
import { PlusIcon, MoreDotIcon } from "../icons";
import { Dropdown } from "../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../components/ui/dropdown/DropdownItem";
import { useProducts, useDeleteProduct } from "../hook/useProducts";
import { useCategories } from "../hook/useCategories";
import { AddProductModal } from "../components/products/AddProductModal";
import { EditProductModal } from "../components/products/EditProductModal";
import type { Product } from "../types/product";

const ITEMS_PER_PAGE = 12;

const Products = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | number | "all"
  >("all");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();
  const categories = categoriesData || [];

  // Fetch products
  const {
    data,
    isLoading: productsLoading,
    error,
  } = useProducts(
    selectedCategoryId === "all" ? undefined : Number(selectedCategoryId)
  );

  const products = Array.isArray(data) ? data : [];
  const isLoading = categoriesLoading || productsLoading;

  // Delete mutation
  const deleteProductMutation = useDeleteProduct();

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId]);

  function toggleDropdown(productId: string) {
    setOpenDropdownId(openDropdownId === productId ? null : productId);
  }

  function closeDropdown() {
    setOpenDropdownId(null);
  }

  // Handle edit
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
    closeDropdown();
  };

  // Handle delete confirmation
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteConfirmOpen(true);
    closeDropdown();
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProductMutation.mutateAsync(productToDelete.product_id);
        setIsDeleteConfirmOpen(false);
        setProductToDelete(null);
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setProductToDelete(null);
  };

  // Get category name by ID
  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.category_id === categoryId);
    return category?.name || `Category ${categoryId}`;
  };

  // Pagination logic
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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
            onClick={() => setIsAddModalOpen(true)}
            className="p-2 rounded-lg hover:bg-[#5a2f03] transition-colors"
            style={{ backgroundColor: "#452302" }}
          >
            <PlusIcon className="size-6" style={{ fill: "white" }} />
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategoryId("all")}
            className={`px-4 py-2 text-sm font-normal rounded-lg whitespace-nowrap transition-colors ${
              selectedCategoryId === "all"
                ? "text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
            style={
              selectedCategoryId === "all"
                ? { backgroundColor: "#452302" }
                : undefined
            }
          >
            Tất cả
          </button>
          {categories.map((category) => (
            <button
              key={category.category_id}
              onClick={() => setSelectedCategoryId(category.category_id)}
              className={`px-4 py-2 text-sm font-normal rounded-lg whitespace-nowrap transition-colors ${
                selectedCategoryId === category.category_id
                  ? "text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
              style={
                selectedCategoryId === category.category_id
                  ? { backgroundColor: "#452302" }
                  : undefined
              }
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Loading / Error */}
        {isLoading && <div className="text-center py-6">Đang tải...</div>}
        {error && (
          <div className="text-center py-6 text-red-500">
            {error instanceof Error ? error.message : "Lỗi khi tải dữ liệu"}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && products.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Không có sản phẩm nào
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && products.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
            {currentProducts.map((product) => (
              <div
                key={product.product_id}
                className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 transition-shadow hover:shadow-lg"
              >
                {/* Dropdown Menu */}
                <div className="absolute top-3 right-3 z-10">
                  <div className="relative inline-block">
                    <button
                      onClick={() =>
                        toggleDropdown(product.product_id.toString())
                      }
                      className="dropdown-toggle p-1.5 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                    >
                      <MoreDotIcon className="text-gray-600 size-5 dark:text-gray-400" />
                    </button>
                    {openDropdownId === product.product_id.toString() && (
                      <Dropdown
                        isOpen={true}
                        onClose={closeDropdown}
                        className="w-40 p-2"
                      >
                        <DropdownItem
                          onItemClick={() => handleEdit(product)}
                          className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        >
                          Chỉnh sửa
                        </DropdownItem>
                        <DropdownItem
                          onItemClick={() => handleDeleteClick(product)}
                          className="flex w-full font-normal text-left text-red-500 rounded-lg hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                        >
                          Xóa
                        </DropdownItem>
                      </Dropdown>
                    )}
                  </div>
                </div>

                {/* Product Image */}
                <div className="flex items-center justify-center h-48 p-6 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-6xl">☕</div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {getCategoryName(product.category_id)}
                    </span>
                    {product.is_new && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        Mới
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-white/90">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    {product.old_price && product.old_price > 0 && (
                      <span className="text-xs text-gray-500 line-through dark:text-gray-400">
                        {product.old_price.toLocaleString("vi-VN")}đ
                      </span>
                    )}
                    <span className="text-sm font-semibold text-gray-900 dark:text-white/90">
                      {product.price.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
              </div>
            ))}
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

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Product Modal */}
      {selectedProduct && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && productToDelete && (
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
                  Xác nhận xóa
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hành động này không thể hoàn tác
                </p>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Bạn có chắc chắn muốn xóa sản phẩm{" "}
              <span className="font-semibold">"{productToDelete.name}"</span>{" "}
              không?
            </p>

            {deleteProductMutation.isError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  Có lỗi xảy ra khi xóa sản phẩm. Vui lòng thử lại.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                disabled={deleteProductMutation.isPending}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteProductMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteProductMutation.isPending ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Products;
