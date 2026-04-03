import { getSupabaseClient, isSupabaseConfigured, mapSupabaseUser } from '../lib/supabase';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

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

export interface CheckoutCartItemInput {
  product_id: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
  authenticated?: boolean;
}

function requireSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return getSupabaseClient();
}

function requireApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_URL is not configured. Point it to your Cloudflare Worker domain.');
  }
  return API_BASE_URL;
}

function toOrderListItem(row: any) {
  return {
    id: row.id,
    order_number: row.order_number,
    status: row.status,
    total: String(row.total),
    subtotal: String(row.subtotal),
    shipping: String(row.shipping),
    tax: String(row.tax),
    created_at: row.created_at,
    address: row.address,
    city: row.city,
    state: row.state,
    country: row.country,
    payment_currency: row.payment_currency || 'GHS',
    items: (row.order_items || []).map((item: any) => ({
      id: item.id,
      product_name: item.product_name,
      quantity: item.quantity,
      size: item.size || '',
      color: item.color || '',
      price: String(item.price),
      subtotal: String(item.subtotal),
    })),
  };
}

class ApiService {
  private async getAuthHeaders() {
    if (!isSupabaseConfigured) return {};
    const client = getSupabaseClient();
    const { data } = await client.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, authenticated = false, ...fetchOptions } = options;
    const baseUrl = requireApiBaseUrl();

    let url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    if (params) {
      url += `?${new URLSearchParams(params).toString()}`;
    }

    const authHeaders = authenticated ? await this.getAuthHeaders() : {};
    const isFormData = fetchOptions.body instanceof FormData;
    const headers: HeadersInit = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...authHeaders,
      ...fetchOptions.headers,
    };

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'Request failed');
    }

    return response.json();
  }

  async getCategories() {
    const client = requireSupabase();
    const { data, error } = await client
      .from('categories')
      .select('id,name,slug,description,image_url')
      .eq('is_active', true)
      .order('name');
    if (error) throw new Error(error.message);
    return {
      results: (data || []).map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image: category.image_url || '',
        product_count: 0,
      })),
    };
  }

  async getCategory(slug: string) {
    const client = requireSupabase();
    const { data, error } = await client
      .from('categories')
      .select('id,name,slug,description,image_url')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
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

  async getProducts(params?: { category__slug?: string; is_featured?: boolean; search?: string }) {
    const client = requireSupabase();
    let query = client
      .from('products')
      .select('id,name,slug,price,image_url,stock_quantity')
      .eq('is_active', true);

    if (params?.category__slug) {
      const { data: category, error: categoryError } = await client
        .from('categories')
        .select('id')
        .eq('slug', params.category__slug)
        .maybeSingle();
      if (categoryError) throw new Error(categoryError.message);
      if (category) query = query.eq('category_id', category.id);
      else return { results: [] };
    }

    if (params?.is_featured) query = query.eq('is_featured', true);
    if (params?.search?.trim()) {
      const term = `%${params.search.trim()}%`;
      query = query.or(`name.ilike.${term},description.ilike.${term}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return {
      results: (data || []).map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: String(product.price),
        image: product.image_url || '',
        in_stock: (product.stock_quantity ?? 0) > 0,
      })),
    };
  }

  async getProduct(slug: string) {
    const client = requireSupabase();
    const { data: product, error } = await client
      .from('products')
      .select('*, product_images(*), product_colors(*), product_sizes(*), product_details(*)')
      .eq('slug', slug)
      .single();
    if (error || !product) throw new Error(error?.message || 'Product not found');

    const images = (product.product_images || []).sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
    const primaryImage = images.find((image: any) => image.is_primary) || images[0];

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: String(product.price),
      image: primaryImage?.image_url || product.image_url || '',
      in_stock: (product.stock_quantity ?? 0) > 0,
      stock_quantity: product.stock_quantity ?? 0,
      images: images.map((image: any) => ({
        id: image.id,
        image: image.image_url,
        alt_text: image.alt_text || '',
        is_primary: !!image.is_primary,
        order: image.order ?? 0,
      })),
      colors: (product.product_colors || []).map((color: any) => ({
        id: color.id,
        name: color.name,
        hex_code: color.hex_code || '',
        is_available: color.is_available !== false,
      })),
      sizes: (product.product_sizes || []).map((size: any) => ({
        id: size.id,
        size: size.size,
        is_available: size.is_available !== false,
      })),
      details: (product.product_details || [])
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
        .map((detail: any) => ({
          id: detail.id,
          detail: detail.detail,
          order: detail.order ?? 0,
        })),
    };
  }

  async getProductById(id: number) {
    const client = requireSupabase();
    const { data, error } = await client
      .from('products')
      .select('id,name,slug,price,image_url,stock_quantity,is_active')
      .eq('id', id)
      .single();
    if (error || !data || !data.is_active) throw new Error(error?.message || 'Product not found');
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      price: String(data.price),
      image: data.image_url || '',
      in_stock: (data.stock_quantity ?? 0) > 0,
      stock_quantity: data.stock_quantity ?? 0,
    };
  }

  async getFeaturedProducts() {
    const client = requireSupabase();
    const { data, error } = await client
      .from('products')
      .select('id,name,slug,price,image_url,stock_quantity')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return {
      results: (data || []).map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: String(product.price),
        image: product.image_url || '',
        in_stock: (product.stock_quantity ?? 0) > 0,
      })),
    };
  }

  async subscribeNewsletter(email: string) {
    const client = requireSupabase();
    const { error } = await client.from('newsletters').insert({ email });
    if (error && error.code !== '23505') throw new Error(error.message);
    return {
      message: error?.code === '23505' ? 'You are already subscribed!' : 'Successfully subscribed to newsletter!',
    };
  }

  async submitContact(data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) {
    const client = requireSupabase();
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      subject: data.subject,
      message: data.message,
    };
    const { error } = await client.from('contact_messages').insert(payload);
    if (error) throw new Error(error.message);
    return { message: 'Thank you for your message. We will get back to you soon!' };
  }

  async submitInvestment(data: {
    name: string;
    email: string;
    phone: string;
    tier: string;
    message?: string;
  }) {
    const client = requireSupabase();
    const { error } = await client.from('investment_inquiries').insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      tier: data.tier,
      message: data.message || '',
    });
    if (error) throw new Error(error.message);
    return { message: 'Thank you for your interest! Our investment team will contact you within 48 hours.' };
  }

  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    profile?: Record<string, any>;
  }) {
    const client = requireSupabase();
    const { data: authData, error } = await client.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
        },
      },
    });
    if (error) throw error;

    if (authData.user && authData.session) {
      await client.from('user_profiles').upsert({
        user_id: authData.user.id,
        title: data.profile?.title || '',
        phone: data.profile?.phone || '',
        birth_date: data.profile?.date_of_birth || null,
        location: data.profile?.country || 'United States',
        newsletter_subscribed: !!data.profile?.marketing_consent,
      }, { onConflict: 'user_id' });
    }

    return authData;
  }

  async login(email: string, password: string) {
    const client = requireSupabase();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async logout() {
    const client = requireSupabase();
    const { error } = await client.auth.signOut();
    if (error) throw error;
    return { message: 'Logout successful' };
  }

  checkEmail(email: string) {
    return Promise.resolve({ exists: true, email });
  }

  async requestPasswordReset(email: string) {
    const client = requireSupabase();
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}?page=reset-password`,
    });
    if (error) throw error;
    return { message: 'If that email is registered, a reset link has been sent.' };
  }

  async resetPassword(_email: string, _token: string, newPassword: string) {
    const client = requireSupabase();
    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return { message: 'Password reset successfully. You can now sign in.' };
  }

  async getCurrentUser() {
    const client = requireSupabase();
    const { data, error } = await client.auth.getUser();
    if (error) throw error;
    if (!data.user) throw new Error('Not authenticated');

    const { data: profile, error: profileError } = await client
      .from('user_profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .maybeSingle();
    if (profileError) throw new Error(profileError.message);

    return {
      ...mapSupabaseUser(data.user),
      profile: profile || {},
    };
  }

  async updateProfile(data: { first_name?: string; last_name?: string; profile?: Record<string, any> }) {
    const client = requireSupabase();
    const { data: userData, error } = await client.auth.getUser();
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
      }, { onConflict: 'user_id' });
      if (profileError) throw profileError;
    }

    return {
      ...mapSupabaseUser({ ...user, user_metadata: metadata }),
      profile: data.profile || {},
    };
  }

  async getCurrentCart() {
    return { items: [], total: 0, item_count: 0 };
  }

  async addToCart() {
    throw new Error('Remote carts are not used in the Hostinger + Supabase architecture.');
  }

  async updateCartItem() {
    throw new Error('Remote carts are not used in the Hostinger + Supabase architecture.');
  }

  async removeCartItem() {
    throw new Error('Remote carts are not used in the Hostinger + Supabase architecture.');
  }

  async clearCart() {
    return { items: [], total: 0, item_count: 0 };
  }

  async createOrder(data: {
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
    items: CheckoutCartItemInput[];
  }) {
    return this.initializePayment(data);
  }

  async getOrders() {
    const client = requireSupabase();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!authData.user) return [];

    const { data, error } = await client
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        subtotal,
        shipping,
        tax,
        total,
        created_at,
        address,
        city,
        state,
        country,
        payment_currency,
        order_items (
          id,
          product_name,
          quantity,
          size,
          color,
          price,
          subtotal
        )
      `)
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(toOrderListItem);
  }

  async initializePayment(data: {
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
    items: CheckoutCartItemInput[];
  }) {
    return this.request<PaymentInitializationResponse>('/checkout/init', {
      method: 'POST',
      authenticated: true,
      body: JSON.stringify(data),
    });
  }

  async verifyPayment(reference: string) {
    return this.request<PaymentVerificationResponse>('/payments/verify', {
      method: 'GET',
      authenticated: true,
      params: { reference },
    });
  }
}

export const api = new ApiService();
export default api;
