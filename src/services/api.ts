const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;

    let url = `${this.baseUrl}${endpoint}`;

    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...fetchOptions,
      headers: {
        ...defaultHeaders,
        ...fetchOptions.headers,
      },
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, data?: any, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data?: any, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  getCategories() {
    return this.get('/store/categories/');
  }

  getCategory(slug: string) {
    return this.get(`/store/categories/${slug}/`);
  }

  getProducts(params?: { category__slug?: string; is_featured?: boolean; search?: string }) {
    return this.get('/store/products/', { params: params as any });
  }

  getProduct(slug: string) {
    return this.get(`/store/products/${slug}/`);
  }

  getFeaturedProducts() {
    return this.get('/store/products/featured/');
  }

  subscribeNewsletter(email: string) {
    return this.post('/store/newsletter/', { email });
  }

  submitContact(data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) {
    return this.post('/store/contact/', data);
  }

  submitInvestment(data: {
    name: string;
    email: string;
    phone: string;
    tier: string;
    message?: string;
  }) {
    return this.post('/store/investment/', data);
  }

  register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    profile?: any;
  }) {
    return this.post('/accounts/users/', data);
  }

  login(email: string, password: string) {
    return this.post('/accounts/users/login/', { email, password });
  }

  logout() {
    return this.post('/accounts/users/logout/');
  }

  checkEmail(email: string) {
    return this.post('/accounts/users/check_email/', { email });
  }

  requestPasswordReset(email: string) {
    return this.post('/accounts/users/request_password_reset/', { email });
  }

  resetPassword(email: string, token: string, newPassword: string) {
    return this.post('/accounts/users/reset_password/', { email, token, new_password: newPassword });
  }

  getCurrentUser() {
    return this.get('/accounts/users/me/');
  }

  getCurrentCart() {
    return this.get('/orders/cart/current/');
  }

  addToCart(productId: number, quantity: number, size?: string, color?: string) {
    return this.post('/orders/cart/add_item/', {
      product_id: productId,
      quantity,
      size,
      color,
    });
  }

  updateCartItem(itemId: number, quantity: number) {
    return this.post('/orders/cart/update_item/', {
      item_id: itemId,
      quantity,
    });
  }

  removeCartItem(itemId: number) {
    return this.post('/orders/cart/remove_item/', { item_id: itemId });
  }

  clearCart() {
    return this.post('/orders/cart/clear/');
  }

  createOrder(data: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    notes?: string;
  }) {
    return this.post('/orders/orders/', data);
  }

  getOrders() {
    return this.get('/orders/orders/');
  }
}

export const api = new ApiService(API_BASE_URL);
export default api;
