import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ProductImageUpload } from './ProductImageUpload';

interface ProductFormData {
  name: string;
  price: number;
  category: string;
  description?: string;
  stock: number;
  image?: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>();

  const handleFormSubmit = async (data: ProductFormData) => {
    if (!imageUrl) {
      setImageError('Vui lòng chọn ảnh sản phẩm');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({ ...data, image: imageUrl });
      reset();
      setImageUrl('');
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setImageUrl('');
    setImageError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Thêm sản phẩm mới
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Ảnh sản phẩm <span className="text-red-500">*</span>
            </label>
            <ProductImageUpload
              currentImage={imageUrl}
              onImageChange={(url) => {
                setImageUrl(url);
                setImageError('');
              }}
              onError={setImageError}
            />
            {imageError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{imageError}</p>
            )}
          </div>

          {/* Product Name */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name', { required: 'Tên sản phẩm là bắt buộc' })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Ví dụ: Cà phê đen"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Giá (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                {...register('price', {
                  required: 'Giá là bắt buộc',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Giá phải lớn hơn 0' },
                })}
                type="number"
                step="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="25000"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Số lượng <span className="text-red-500">*</span>
              </label>
              <input
                {...register('stock', {
                  required: 'Số lượng là bắt buộc',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Số lượng phải >= 0' },
                })}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="100"
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              {...register('category', { required: 'Danh mục là bắt buộc' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn danh mục</option>
              <option value="Cà phê">Cà phê</option>
              <option value="Trà">Trà</option>
              <option value="Sinh tố">Sinh tố</option>
              <option value="Bánh ngọt">Bánh ngọt</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Mô tả
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả ngắn về sản phẩm..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50"
              style={{ backgroundColor: '#452302' }}
            >
              {isSubmitting ? 'Đang lưu...' : 'Thêm sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};