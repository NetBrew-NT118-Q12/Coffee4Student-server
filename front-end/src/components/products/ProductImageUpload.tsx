import { useState, useRef } from 'react';
import { productImageService } from '../../config/productImageService';

interface ProductImageUploadProps {
  currentImage?: string;
  onImageChange: (url: string) => void;
  onError?: (error: string) => void;
}

export const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
  currentImage,
  onImageChange,
  onError,
}) => {
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to Firebase
    try {
      setUploading(true);
      setProgress(0);

      const downloadUrl = await productImageService.uploadProductImage(
        file,
        (progressValue) => setProgress(progressValue)
      );

      setPreview(downloadUrl);
      onImageChange(downloadUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      setPreview(currentImage || '');
      const errorMsg = error instanceof Error ? error.message : 'Upload thất bại';
      if (onError) onError(errorMsg);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = async () => {
    if (currentImage) {
      try {
        await productImageService.deleteProductImage(currentImage);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
    setPreview('');
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Preview / Upload Area */}
      <div className="relative w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
        {preview ? (
          <>
            <img
              src={preview}
              alt="Product preview"
              className="object-cover w-full h-full"
            />
            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                <div className="text-white text-sm mb-2">
                  Đang upload... {Math.round(progress)}%
                </div>
                <div className="w-3/4 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <label
            htmlFor="product-image"
            className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg
              className="w-10 h-10 mb-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click để chọn ảnh</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG (MAX. 5MB)</p>
          </label>
        )}
        <input
          id="product-image"
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileSelect}
          disabled={uploading}
        />
      </div>

      {/* Action Buttons */}
      {preview && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Đổi ảnh
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Xóa
          </button>
        </div>
      )}
    </div>
  );
};