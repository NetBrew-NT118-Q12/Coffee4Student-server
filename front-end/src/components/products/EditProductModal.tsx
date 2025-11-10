import { useForm, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import { useUpdateProduct } from "../../hook/useProducts";
import { useCategories } from "../../hook/useCategories";
import type { Product, UpdateProductDTO } from "../../types/product";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export const EditProductModal = ({
  isOpen,
  onClose,
  product,
}: EditProductModalProps) => {
  const { data: categories = [] } = useCategories();
  const updateProductMutation = useUpdateProduct();
  const [imagePreview, setImagePreview] = useState<string>(
    product.image_url || ""
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = useForm<UpdateProductDTO>({
    defaultValues: {
      category_id: product.category_id,
      name: product.name,
      description: product.description || "",
      price: product.price,
      old_price: product.old_price || undefined,
      is_active: product.is_active,
      image_url: product.image_url || "",
      is_new: product.is_new,
    },
  });

  // Format number with thousand separators for display
  const formatNumber = (value: number | string): string => {
    if (!value && value !== 0) return "";
    const numValue =
      typeof value === "string" ? parseFloat(value.replace(/\./g, "")) : value;
    if (isNaN(numValue)) return "";
    return numValue.toLocaleString("vi-VN");
  };

  // Parse formatted string back to number
  const parseNumber = (value: string): number => {
    if (!value) return 0;
    const cleaned = value.replace(/\./g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Update form when product changes
  useEffect(() => {
    if (product) {
      reset({
        category_id: product.category_id,
        name: product.name,
        description: product.description || "",
        price: product.price,
        old_price: product.old_price || undefined,
        is_active: product.is_active,
        image_url: product.image_url || "",
        is_new: product.is_new,
      });
      setImagePreview(product.image_url || "");
      setImageFile(null);
    }
  }, [product, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setValue("image_url", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setValue("image_url", "");
  };

  const onSubmit = async (data: UpdateProductDTO) => {
    try {
      await updateProductMutation.mutateAsync({
        id: product.product_id,
        data,
      });
      onClose();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleClose = () => {
    reset();
    setImagePreview(product.image_url || "");
    setImageFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
      style={{ zIndex: 10000 }}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Chỉnh sửa sản phẩm
          </h2>
          <button
            onClick={handleClose}
            type="button"
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("name", {
                required: "Tên sản phẩm là bắt buộc",
                minLength: {
                  value: 3,
                  message: "Tên sản phẩm phải có ít nhất 3 ký tự",
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#452302] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Nhập tên sản phẩm"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              {...register("category_id", {
                required: "Vui lòng chọn danh mục",
                validate: (value) => value !== 0 || "Vui lòng chọn danh mục",
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#452302] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value={0}>Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 text-sm text-red-500">
                {errors.category_id.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mô tả
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#452302] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
              placeholder="Nhập mô tả sản phẩm"
            />
          </div>

          {/* Price with auto-formatting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Giá <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Controller
                name="price"
                control={control}
                rules={{
                  required: "Giá là bắt buộc",
                  validate: (value) => {
                    const numValue =
                      typeof value === "string"
                        ? parseNumber(value)
                        : value || 0;
                    if (numValue < 1000) {
                      return "Giá phải lớn hơn 1.000đ";
                    }
                    return true;
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <input
                    type="text"
                    value={formatNumber(value || 0)}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      // Remove all non-digit characters
                      const digitsOnly = inputValue.replace(/\D/g, "");
                      // Convert to number and update
                      const numValue = digitsOnly
                        ? parseInt(digitsOnly, 10)
                        : 0;
                      onChange(numValue);
                    }}
                    className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#452302] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="0"
                  />
                )}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                đ
              </span>
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-500">
                {errors.price.message}
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hình ảnh
            </label>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative mb-3 w-full h-48 border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-contain bg-gray-50 dark:bg-gray-900"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#452302] hover:bg-gray-50 dark:border-gray-700 dark:hover:border-[#452302] dark:hover:bg-gray-800 transition-colors">
                  <svg
                    className="w-5 h-5 text-gray-500 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {imageFile ? "Thay đổi ảnh" : "Upload từ máy"}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              <div className="flex-1">
                <input
                  type="text"
                  {...register("image_url")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#452302] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Hoặc nhập URL"
                  onChange={(e) => {
                    setImagePreview(e.target.value);
                    setImageFile(null);
                  }}
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Chấp nhận: JPG, PNG, GIF (tối đa 5MB)
            </p>
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register("is_active")}
                className="w-4 h-4 text-[#452302] border-gray-300 rounded focus:ring-[#452302] cursor-pointer"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Hoạt động
              </span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register("is_new")}
                className="w-4 h-4 text-[#452302] border-gray-300 rounded focus:ring-[#452302] cursor-pointer"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Sản phẩm mới
              </span>
            </label>
          </div>

          {/* Error Message */}
          {updateProductMutation.isError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                Có lỗi xảy ra khi cập nhật sản phẩm. Vui lòng thử lại.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={updateProductMutation.isPending}
              className="flex-1 px-4 py-2 text-white rounded-lg hover:bg-[#5a2f03] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#452302" }}
            >
              {updateProductMutation.isPending
                ? "Đang cập nhật..."
                : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
