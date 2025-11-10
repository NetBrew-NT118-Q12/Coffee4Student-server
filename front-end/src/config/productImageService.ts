import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
} from 'firebase/storage';
import { storage } from '../config/firebase';

class ProductImageService {
  private readonly PRODUCTS_FOLDER = 'products';
  private readonly MAX_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Upload ảnh sản phẩm
   */
  async uploadProductImage(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    // Validate
    this.validateImage(file);

    // Generate unique filename
    const filename = this.generateFilename(file.name);
    const path = `${this.PRODUCTS_FOLDER}/${filename}`;
    const storageRef = ref(storage, path);

    if (onProgress) {
      // Upload with progress tracking
      return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => reject(error),
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          }
        );
      });
    } else {
      // Simple upload
      const snapshot = await uploadBytes(storageRef, file);
      return getDownloadURL(snapshot.ref);
    }
  }

  /**
   * Xóa ảnh sản phẩm
   */
  async deleteProductImage(imageUrl: string): Promise<void> {
    try {
      const path = this.extractPathFromUrl(imageUrl);
      if (!path) throw new Error('Invalid image URL');

      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  /**
   * Validate file ảnh
   */
  private validateImage(file: File): void {
    if (!file.type.startsWith('image/')) {
      throw new Error('File phải là ảnh (PNG, JPG, JPEG)');
    }

    if (file.size > this.MAX_SIZE) {
      throw new Error('Kích thước ảnh không được vượt quá 5MB');
    }
  }

  /**
   * Generate unique filename
   */
  private generateFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `product_${timestamp}_${randomStr}.${extension}`;
  }

  /**
   * Extract storage path from Firebase URL
   */
  private extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/);
      return pathMatch?.[1] ? decodeURIComponent(pathMatch[1]) : null;
    } catch {
      return null;
    }
  }
}

export const productImageService = new ProductImageService();