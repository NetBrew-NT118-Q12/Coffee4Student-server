// src/utils/apiHelpers.ts
import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

/**
 * Xử lý lỗi API và trả về message thân thiện
 */
export function handleApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    return {
      message: error.response?.data?.message || error.message || 'Đã xảy ra lỗi',
      status: error.response?.status,
      code: error.code,
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }
  
  return {
    message: 'Đã xảy ra lỗi không xác định',
  };
}

/**
 * Format số tiền VND
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Format ngày tháng
 */
export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('vi-VN');
  }
  
  return d.toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Debounce function
 */
// export function debounce<T extends (...args: any[]) => any>(
//   func: T,
//   wait: number
// ): (...args: Parameters<T>) => void {
//   let timeout: NodeJS.Timeout;
  
//   return function executedFunction(...args: Parameters<T>) {
//     const later = () => {
//       clearTimeout(timeout);
//       func(...args);
//     };
    
//     clearTimeout(timeout);
//     timeout = setTimeout(later, wait);
//   };
// }