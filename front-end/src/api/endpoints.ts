export const API_ENDPOINTS = {
  // Products
  PRODUCTS: "/products",
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,
  POPULAR_PRODUCTS: "/popular-products",

  // Categories
  CATEGORIES: "/categories",

  // Orders
  ORDERS: "/orders",
  ORDER_BY_ID: (id: string) => `/orders/${id}`,

  // Users
  USERS: "/users",
  USER_BY_ID: (id: string) => `/users/${id}`,

  // Auth
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  SOCIAL_LOGIN: "/auth/social-login",
  SIGNUP: "/auth/logout",

  // Dashboard
  DASHBOARD_STATS: "/dashboard/stats",
} as const;
