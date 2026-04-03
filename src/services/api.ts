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

export interface StewardMilestone {
  id: number;
  slug: string;
  name: string;
  description: string;
  measurement_window: string;
  required_successful_orders: number;
  reward_type: string;
  reward_value: string;
}

export interface StewardDashboardData {
  steward: {
    user_id: string;
    display_name: string;
    status: string;
    commission_tier: string;
    commission_rate: number;
    course_status: string;
    joined_at: string;
    activated_at: string | null;
  } | null;
  referralCodes: Array<{
    id: number;
    code: string;
    status: string;
    is_primary: boolean;
  }>;
  commissions: Array<{
    id: number;
    referral_code: string;
    basis_amount: number;
    commission_rate: number;
    commission_amount: number;
    status: string;
    created_at: string;
    order_number: string;
    products_summary: string;
  }>;
  payouts: Array<{
    id: number;
    period_start: string;
    period_end: string;
    total_amount: number;
    gross_commission: number;
    adjustments: number;
    status: string;
    scheduled_for: string | null;
    paid_at: string | null;
  }>;
  milestoneAwards: Array<{
    id: number;
    reward_status: string;
    reference_period_start: string | null;
    reference_period_end: string | null;
    earned_at: string;
    issued_at: string | null;
    milestone: {
      name: string;
      reward_type: string;
      reward_value: string;
    } | null;
  }>;
}

export type StewardApplicationType = 'affiliate' | 'brand_ambassador';

export type StewardApplicationRow = {
  id: number;
  user_id: string;
  application_type: StewardApplicationType;
  ambassador_invite_code: string;
  status: string;
  submitted_at: string;
};

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

function formatCommissionProductsSummary(row: any): string {
  const items = row.orders?.order_items;
  if (!Array.isArray(items) || items.length === 0) return '—';
  return items
    .map((it: any) => `${String(it.product_name || 'Product').trim()} ×${Number(it.quantity) || 1}`)
    .join(', ');
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

  async submitAffiliateWaitlist(data: {
    full_name: string;
    email: string;
    phone?: string;
    location?: string;
    background?: string;
    message?: string;
  }) {
    const client = requireSupabase();
    const { error } = await client.from('steward_waitlist').insert({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || '',
      location: data.location || '',
      background: data.background || '',
      message: data.message || '',
    });
    if (error && error.code !== '23505') throw new Error(error.message);
    return {
      message: error?.code === '23505'
        ? 'You are already on the VNB Steward waitlist.'
        : 'You have joined the VNB Steward waitlist.',
    };
  }

  /** Validates an active steward commission code (buyer checkout). */
  async verifyCheckoutStewardCode(rawCode: string): Promise<{ valid: boolean; message: string }> {
    const client = requireSupabase();
    const trimmed = (rawCode || '').trim();
    if (!trimmed) {
      return { valid: false, message: 'Enter a steward code.' };
    }
    const { data, error } = await client.rpc('resolve_active_steward_referral_code', { p_code: trimmed });
    if (error) throw new Error(error.message);
    const row = Array.isArray(data) ? data[0] : null;
    if (!row?.steward_id) {
      return { valid: false, message: 'This code is not valid or the steward is not active.' };
    }
    return { valid: true, message: 'Code applied. This order will credit the steward.' };
  }

  async getMyStewardApplication(): Promise<StewardApplicationRow | null> {
    const client = requireSupabase();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!authData.user) return null;
    const { data, error } = await client
      .from('steward_applications')
      .select('id,user_id,application_type,ambassador_invite_code,status,submitted_at')
      .eq('user_id', authData.user.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return {
      id: data.id,
      user_id: data.user_id,
      application_type: data.application_type as StewardApplicationType,
      ambassador_invite_code: data.ambassador_invite_code || '',
      status: data.status,
      submitted_at: data.submitted_at,
    };
  }

  async submitStewardApplication(payload: {
    application_type: StewardApplicationType;
    ambassador_invite_code?: string;
  }): Promise<{ message: string }> {
    const client = requireSupabase();
    const { error } = await client.rpc('submit_steward_application', {
      p_application_type: payload.application_type,
      p_ambassador_invite_code: payload.ambassador_invite_code?.trim() || '',
    });
    if (error) {
      const msg = error.message || '';
      if (msg.includes('not_authenticated')) throw new Error('Sign in to submit an application.');
      if (msg.includes('already_steward')) throw new Error('You are already a VNB Steward.');
      if (msg.includes('already_applied')) throw new Error('You have already submitted an application.');
      if (msg.includes('ambassador_code_required')) throw new Error('Enter the ambassador invite code you received.');
      if (msg.includes('invalid_ambassador_code')) throw new Error('That ambassador code is invalid or already used.');
      if (msg.includes('ambassador_code_forbidden_for_affiliate')) {
        throw new Error('Remove the invite code when applying as an affiliate.');
      }
      if (msg.includes('invalid_application_type')) throw new Error('Invalid application type.');
      throw new Error(msg);
    }
    return {
      message:
        'Application received. Check your email for confirmation. We will review and follow up soon.',
    };
  }

  async getActiveStewardMilestones(): Promise<StewardMilestone[]> {
    const client = requireSupabase();
    const { data, error } = await client
      .from('steward_milestone_definitions')
      .select('id,slug,name,description,measurement_window,required_successful_orders,reward_type,reward_value')
      .eq('is_active', true)
      .order('required_successful_orders', { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []).map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description || '',
      measurement_window: row.measurement_window,
      required_successful_orders: row.required_successful_orders,
      reward_type: row.reward_type,
      reward_value: row.reward_value || '',
    }));
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
    referral_code?: string;
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

  async getStewardDashboard(): Promise<StewardDashboardData> {
    const client = requireSupabase();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!authData.user) throw new Error('Not authenticated');

    const userId = authData.user.id;

    const [
      stewardResult,
      codesResult,
      commissionsResult,
      payoutsResult,
      awardsResult,
    ] = await Promise.all([
      client
        .from('vnb_stewards')
        .select('user_id,display_name,status,commission_tier,commission_rate,course_status,joined_at,activated_at')
        .eq('user_id', userId)
        .maybeSingle(),
      client
        .from('steward_referral_codes')
        .select('id,code,status,is_primary')
        .eq('steward_id', userId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true }),
      client
        .from('steward_commissions')
        .select(
          'id,referral_code,basis_amount,commission_rate,commission_amount,status,created_at,orders(order_number,order_items(product_name,quantity))',
        )
        .eq('steward_id', userId)
        .order('created_at', { ascending: false })
        .limit(20),
      client
        .from('steward_payouts')
        .select('id,period_start,period_end,total_amount,gross_commission,adjustments,status,scheduled_for,paid_at')
        .eq('steward_id', userId)
        .order('period_end', { ascending: false })
        .limit(12),
      client
        .from('steward_milestone_awards')
        .select('id,reward_status,reference_period_start,reference_period_end,earned_at,issued_at,steward_milestone_definitions(name,reward_type,reward_value)')
        .eq('steward_id', userId)
        .order('earned_at', { ascending: false })
        .limit(12),
    ]);

    if (stewardResult.error) throw new Error(stewardResult.error.message);
    if (codesResult.error) throw new Error(codesResult.error.message);
    if (commissionsResult.error) throw new Error(commissionsResult.error.message);
    if (payoutsResult.error) throw new Error(payoutsResult.error.message);
    if (awardsResult.error) throw new Error(awardsResult.error.message);

    return {
      steward: stewardResult.data
        ? {
            user_id: stewardResult.data.user_id,
            display_name: stewardResult.data.display_name || '',
            status: stewardResult.data.status,
            commission_tier: stewardResult.data.commission_tier,
            commission_rate: Number(stewardResult.data.commission_rate || 0),
            course_status: stewardResult.data.course_status,
            joined_at: stewardResult.data.joined_at,
            activated_at: stewardResult.data.activated_at,
          }
        : null,
      referralCodes: (codesResult.data || []).map((row) => ({
        id: row.id,
        code: row.code,
        status: row.status,
        is_primary: !!row.is_primary,
      })),
      commissions: (commissionsResult.data || []).map((row: any) => ({
        id: row.id,
        referral_code: row.referral_code || '',
        basis_amount: Number(row.basis_amount || 0),
        commission_rate: Number(row.commission_rate || 0),
        commission_amount: Number(row.commission_amount || 0),
        status: row.status,
        created_at: row.created_at,
        order_number: row.orders?.order_number || '',
        products_summary: formatCommissionProductsSummary(row),
      })),
      payouts: (payoutsResult.data || []).map((row) => ({
        id: row.id,
        period_start: row.period_start,
        period_end: row.period_end,
        total_amount: Number(row.total_amount || 0),
        gross_commission: Number(row.gross_commission || 0),
        adjustments: Number(row.adjustments || 0),
        status: row.status,
        scheduled_for: row.scheduled_for,
        paid_at: row.paid_at,
      })),
      milestoneAwards: (awardsResult.data || []).map((row: any) => ({
        id: row.id,
        reward_status: row.reward_status,
        reference_period_start: row.reference_period_start,
        reference_period_end: row.reference_period_end,
        earned_at: row.earned_at,
        issued_at: row.issued_at,
        milestone: row.steward_milestone_definitions
          ? {
              name: row.steward_milestone_definitions.name,
              reward_type: row.steward_milestone_definitions.reward_type,
              reward_value: row.steward_milestone_definitions.reward_value || '',
            }
          : null,
      })),
    };
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
    referral_code?: string;
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
