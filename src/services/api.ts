import { getSupabaseClient, isSupabaseConfigured, mapSupabaseUser } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface PaymentInitializationResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaymentVerificationResponse {
  status: string;
  order: {
    id: number;
    order_number: string;
    email: string;
    total: string;
    payment_currency?: string;
  };
}

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

  async getCategories() {
    if (isSupabaseConfigured) {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('categories')
        .select('id,name,slug,description,image_url')
        .eq('is_active', true)
        .order('name');
      if (error) throw new Error(error.message);
      const list = (data || []).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || '',
        image: c.image_url || '',
        product_count: 0,
      }));
      return { results: list };
    }
    return this.get('/store/categories/');
  }

  async getCategory(slug: string) {
    if (isSupabaseConfigured) {
      const client = getSupabaseClient();
      const { data, error } = await client.from('categories').select('*').eq('slug', slug).eq('is_active', true).single();
      if (error || !data) throw new Error(error?.message || 'Category not found');
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        image: data.image_url || '',
        product_count: 0,
      };
    }
    return this.get(`/store/categories/${slug}/`);
  }

  async getProducts(params?: { category__slug?: string; is_featured?: boolean; search?: string }) {
    if (isSupabaseConfigured) {
      const client = getSupabaseClient();
      let q = client.from('products').select('id,name,slug,price,image_url,stock_quantity').eq('is_active', true);
      if (params?.category__slug) {
        const { data: cat } = await client.from('categories').select('id').eq('slug', params.category__slug).single();
        if (cat) q = q.eq('category_id', cat.id);
      }
      if (params?.is_featured) q = q.eq('is_featured', true);
      if (params?.search?.trim()) {
        const term = `%${params.search.trim()}%`;
        q = q.or(`name.ilike.${term},description.ilike.${term}`);
      }
      const { data, error } = await q.order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      const list = (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: String(p.price),
        image: p.image_url || '',
        in_stock: (p.stock_quantity ?? 0) > 0,
      }));
      return { results: list };
    }
    return this.get('/store/products/', { params: params as any });
  }

  async getProduct(slug: string) {
    if (isSupabaseConfigured) {
      const client = getSupabaseClient();
      const { data: product, error } = await client
        .from('products')
        .select('*, product_images(*), product_colors(*), product_sizes(*), product_details(*)')
        .eq('slug', slug)
        .single();
      if (error || !product) throw new Error(error?.message || 'Product not found');
      const images = (product.product_images || []).sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
      const primaryImage = images.find((i: any) => i.is_primary) || images[0];
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        price: String(product.price),
        image: primaryImage?.image_url || product.image_url || '',
        in_stock: (product.stock_quantity ?? 0) > 0,
        stock_quantity: product.stock_quantity ?? 0,
        images: images.map((i: any) => ({
          id: i.id,
          image: i.image_url,
          alt_text: i.alt_text || '',
          is_primary: !!i.is_primary,
          order: i.order ?? 0,
        })),
        colors: (product.product_colors || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          hex_code: c.hex_code || '',
          is_available: c.is_available !== false,
        })),
        sizes: (product.product_sizes || []).map((s: any) => ({
          id: s.id,
          size: s.size,
          is_available: s.is_available !== false,
        })),
        details: (product.product_details || []).sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)).map((d: any) => ({
          id: d.id,
          detail: d.detail,
          order: d.order ?? 0,
        })),
      };
    }
    return this.get(`/store/products/${slug}/`);
  }

  async getFeaturedProducts() {
    if (isSupabaseConfigured) {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('products')
        .select('id,name,slug,price,image_url,stock_quantity')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw new Error(error.message);
      const list = (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: String(p.price),
        image: p.image_url || '',
        in_stock: (p.stock_quantity ?? 0) > 0,
      }));
      return { results: list };
    }
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
    const client = getSupabaseClient();
    return client.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
        },
      },
    }).then(async ({ data: authData, error }) => {
      if (error) throw error;

      // If session exists immediately (email-confirmation disabled), store profile too.
      if (authData.user && authData.session && data.profile) {
        await client.from('user_profiles').upsert({
          user_id: authData.user.id,
          title: data.profile.title || '',
          phone: data.profile.phone || '',
          location: data.profile.country || 'United States',
          newsletter_subscribed: !!data.profile.marketing_consent,
        });
      }
      return authData;
    });
  }

  login(email: string, password: string) {
    const client = getSupabaseClient();
    return client.auth.signInWithPassword({ email, password }).then(({ data, error }) => {
      if (error) throw error;
      return data;
    });
  }

  logout() {
    const client = getSupabaseClient();
    return client.auth.signOut().then(({ error }) => {
      if (error) throw error;
      return { message: 'Logout successful' };
    });
  }

  checkEmail(email: string) {
    // Supabase client should not enumerate users.
    // Login flow now asks for password directly.
    return Promise.resolve({ exists: true, email });
  }

  requestPasswordReset(email: string) {
    const client = getSupabaseClient();
    return client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}?page=reset-password`,
    }).then(({ error }) => {
      if (error) throw error;
      return { message: 'If that email is registered, a reset link has been sent.' };
    });
  }

  resetPassword(email: string, token: string, newPassword: string) {
    const client = getSupabaseClient();
    return client.auth.updateUser({ password: newPassword }).then(({ error }) => {
      if (error) throw error;
      return { message: 'Password reset successfully. You can now sign in.' };
    });
  }

  getCurrentUser() {
    const client = getSupabaseClient();
    return client.auth.getUser().then(({ data, error }) => {
      if (error) throw error;
      if (!data.user) throw new Error('Not authenticated');
      return mapSupabaseUser(data.user);
    });
  }

  updateProfile(data: { first_name?: string; last_name?: string; profile?: Record<string, any> }) {
    const client = getSupabaseClient();
    return client.auth.getUser().then(async ({ data: userData, error }) => {
      if (error) throw error;
      if (!userData.user) throw new Error('Not authenticated');

      const user = userData.user;
      const metadata = {
        ...user.user_metadata,
        first_name: data.first_name ?? user.user_metadata?.first_name ?? '',
        last_name: data.last_name ?? user.user_metadata?.last_name ?? '',
      };

      const { error: updateAuthError } = await client.auth.updateUser({ data: metadata });
      if (updateAuthError) throw updateAuthError;

      if (data.profile) {
        const { error: profileError } = await client.from('user_profiles').upsert({
          user_id: user.id,
          title: data.profile.title || '',
          phone: data.profile.phone || '',
          area_code: data.profile.area_code || '+1',
          birth_date: data.profile.birth_date || null,
          company: data.profile.company || '',
          address: data.profile.address || '',
          address_continued: data.profile.address_continued || '',
          city: data.profile.city || '',
          state: data.profile.state || '',
          zip_code: data.profile.zip_code || '',
          zip_plus: data.profile.zip_plus || '',
          location: data.profile.location || 'United States',
          newsletter_subscribed: !!data.profile.newsletter_subscribed,
        });
        if (profileError) throw profileError;
      }

      return mapSupabaseUser({
        ...user,
        user_metadata: metadata,
      });
    });
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
    const client = getSupabaseClient();
    return client.auth.getUser().then(async ({ data, error }) => {
      if (error) throw error;
      if (!data.user) return [];

      const { data: orders, error: ordersError } = await client
        .from('orders')
        .select('*')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false });
      if (ordersError) throw ordersError;
      return orders || [];
    });
  }

  initializePayment(data: {
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
    return this.post<PaymentInitializationResponse>('/orders/payments/initialize/', data);
  }

  verifyPayment(reference: string) {
    return this.get<PaymentVerificationResponse>('/orders/payments/verify/', { params: { reference } });
  }
}

export const api = new ApiService(API_BASE_URL);
export default api;
