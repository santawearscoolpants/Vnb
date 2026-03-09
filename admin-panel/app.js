import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const $ = (id) => document.getElementById(id);

const ui = {
  configWarning: $('configWarning'),
  authStatus: $('authStatus'),
  authCard: $('authCard'),
  appSection: $('appSection'),
  loginForm: $('loginForm'),
  signOutBtn: $('signOutBtn'),
  statsGrid: $('statsGrid'),
  createCategoryForm: $('createCategoryForm'),
  categoriesTable: $('categoriesTable'),
  createProductForm: $('createProductForm'),
  categorySelect: $('categorySelect'),
  productsTable: $('productsTable'),
  ordersTable: $('ordersTable'),
  contactTable: $('contactTable'),
  investTable: $('investTable'),
  newsletterTable: $('newsletterTable'),
};

let supabase = null;
let activeUser = null;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showError(message) {
  window.alert(message);
}

async function loadRuntimeConfig() {
  try {
    await import('./config.js');
    return window.VNB_ADMIN_CONFIG || null;
  } catch {
    return null;
  }
}

function wireTabs() {
  document.querySelectorAll('.tab[data-tab]').forEach((tabButton) => {
    tabButton.addEventListener('click', () => {
      const tab = tabButton.getAttribute('data-tab');
      document.querySelectorAll('.tab[data-tab]').forEach((b) => b.classList.remove('active'));
      tabButton.classList.add('active');
      document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
      $(tab).classList.add('active');
    });
  });
}

async function assertAdmin(userId) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

function authUiSignedOut() {
  ui.authStatus.textContent = 'Not signed in';
  ui.authCard.classList.remove('hidden');
  ui.appSection.classList.add('hidden');
}

function authUiSignedIn(email) {
  ui.authStatus.textContent = `Signed in: ${email}`;
  ui.authCard.classList.add('hidden');
  ui.appSection.classList.remove('hidden');
}

async function loadStats() {
  const tables = [
    ['products', 'Products'],
    ['categories', 'Categories'],
    ['orders', 'Orders'],
    ['contact_messages', 'Contact'],
    ['investment_inquiries', 'Invest'],
    ['newsletters', 'Newsletter'],
  ];

  const cards = await Promise.all(
    tables.map(async ([table, label]) => {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) throw error;
      return `<article class="stat"><p>${label}</p><h4>${count ?? 0}</h4></article>`;
    })
  );
  ui.statsGrid.innerHTML = cards.join('');
}

async function loadCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id,name,slug,is_active,created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;

  ui.categorySelect.innerHTML = data
    .map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`)
    .join('');

  ui.categoriesTable.innerHTML = `
    <table>
      <thead><tr><th>Name</th><th>Slug</th><th>Active</th><th>Created</th><th>Actions</th></tr></thead>
      <tbody>
        ${data
          .map(
            (c) => `
          <tr>
            <td>${escapeHtml(c.name)}</td>
            <td>${escapeHtml(c.slug)}</td>
            <td>${c.is_active ? 'Yes' : 'No'}</td>
            <td>${new Date(c.created_at).toLocaleString()}</td>
            <td class="actions">
              <button data-action="toggle-category" data-id="${c.id}" data-active="${c.is_active}">
                ${c.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button data-action="delete-category" data-id="${c.id}" class="danger">Delete</button>
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;
}

async function loadProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id,name,price,stock_quantity,is_active,is_featured,slug,categories(name)')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;

  ui.productsTable.innerHTML = `
    <table>
      <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Flags</th><th>Actions</th></tr></thead>
      <tbody>
        ${data
          .map(
            (p) => `
          <tr>
            <td>${escapeHtml(p.name)}<div class="muted">${escapeHtml(p.slug)}</div></td>
            <td>${escapeHtml(p.categories?.name || '-')}</td>
            <td>GHS ${Number(p.price).toFixed(2)}</td>
            <td>${p.stock_quantity}</td>
            <td>${p.is_active ? 'Active' : 'Inactive'} / ${p.is_featured ? 'Featured' : 'Normal'}</td>
            <td class="actions">
              <button data-action="toggle-product-active" data-id="${p.id}" data-active="${p.is_active}">
                ${p.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button data-action="toggle-product-featured" data-id="${p.id}" data-featured="${p.is_featured}">
                ${p.is_featured ? 'Unfeature' : 'Feature'}
              </button>
              <button data-action="delete-product" data-id="${p.id}" class="danger">Delete</button>
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;
}

async function loadOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('id,order_number,email,total,status,payment_status,created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;

  const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const paymentOptions = ['pending', 'paid', 'failed'];

  ui.ordersTable.innerHTML = `
    <table>
      <thead><tr><th>Order</th><th>Email</th><th>Total</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead>
      <tbody>
        ${data
          .map(
            (o) => `
          <tr>
            <td>${escapeHtml(o.order_number)}<div class="muted">${new Date(o.created_at).toLocaleString()}</div></td>
            <td>${escapeHtml(o.email)}</td>
            <td>GHS ${Number(o.total).toFixed(2)}</td>
            <td>
              <select data-order-status-id="${o.id}">
                ${statusOptions
                  .map((s) => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`)
                  .join('')}
              </select>
            </td>
            <td>
              <select data-order-payment-id="${o.id}">
                ${paymentOptions
                  .map((s) => `<option value="${s}" ${o.payment_status === s ? 'selected' : ''}>${s}</option>`)
                  .join('')}
              </select>
            </td>
            <td><button data-action="save-order" data-id="${o.id}" class="primary">Save</button></td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;
}

async function loadContact() {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('id,name,email,subject,is_read,created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;

  ui.contactTable.innerHTML = `
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Read</th><th>Actions</th></tr></thead>
      <tbody>
        ${data
          .map(
            (c) => `
          <tr>
            <td>${escapeHtml(c.name)}</td>
            <td>${escapeHtml(c.email)}</td>
            <td>${escapeHtml(c.subject)}<div class="muted">${new Date(c.created_at).toLocaleString()}</div></td>
            <td>${c.is_read ? 'Yes' : 'No'}</td>
            <td><button data-action="toggle-contact-read" data-id="${c.id}" data-read="${c.is_read}">${c.is_read ? 'Mark unread' : 'Mark read'}</button></td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;
}

async function loadInvest() {
  const { data, error } = await supabase
    .from('investment_inquiries')
    .select('id,name,email,tier,is_contacted,created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;

  ui.investTable.innerHTML = `
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>Tier</th><th>Contacted</th><th>Actions</th></tr></thead>
      <tbody>
        ${data
          .map(
            (i) => `
          <tr>
            <td>${escapeHtml(i.name)}</td>
            <td>${escapeHtml(i.email)}</td>
            <td>${escapeHtml(i.tier)}<div class="muted">${new Date(i.created_at).toLocaleString()}</div></td>
            <td>${i.is_contacted ? 'Yes' : 'No'}</td>
            <td><button data-action="toggle-invest-contacted" data-id="${i.id}" data-contacted="${i.is_contacted}">${i.is_contacted ? 'Mark not contacted' : 'Mark contacted'}</button></td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;
}

async function loadNewsletter() {
  const { data, error } = await supabase
    .from('newsletters')
    .select('id,email,is_active,subscribed_at')
    .order('subscribed_at', { ascending: false })
    .limit(200);
  if (error) throw error;

  ui.newsletterTable.innerHTML = `
    <table>
      <thead><tr><th>Email</th><th>Status</th><th>Subscribed</th><th>Actions</th></tr></thead>
      <tbody>
        ${data
          .map(
            (n) => `
          <tr>
            <td>${escapeHtml(n.email)}</td>
            <td>${n.is_active ? 'Active' : 'Inactive'}</td>
            <td>${new Date(n.subscribed_at).toLocaleString()}</td>
            <td><button data-action="toggle-newsletter-active" data-id="${n.id}" data-active="${n.is_active}">${n.is_active ? 'Deactivate' : 'Activate'}</button></td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;
}

async function refreshAll() {
  await Promise.all([loadStats(), loadCategories(), loadProducts(), loadOrders(), loadContact(), loadInvest(), loadNewsletter()]);
}

function parseBool(str) {
  return String(str) === 'true';
}

async function handleTableActions(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  const id = Number(button.dataset.id);

  try {
    switch (action) {
      case 'delete-category':
        if (!window.confirm('Delete this category?')) return;
        await supabase.from('categories').delete().eq('id', id);
        break;
      case 'toggle-category':
        await supabase.from('categories').update({ is_active: !parseBool(button.dataset.active) }).eq('id', id);
        break;
      case 'delete-product':
        if (!window.confirm('Delete this product?')) return;
        await supabase.from('products').delete().eq('id', id);
        break;
      case 'toggle-product-active':
        await supabase.from('products').update({ is_active: !parseBool(button.dataset.active) }).eq('id', id);
        break;
      case 'toggle-product-featured':
        await supabase.from('products').update({ is_featured: !parseBool(button.dataset.featured) }).eq('id', id);
        break;
      case 'save-order': {
        const status = document.querySelector(`[data-order-status-id="${id}"]`)?.value;
        const payment_status = document.querySelector(`[data-order-payment-id="${id}"]`)?.value;
        await supabase.from('orders').update({ status, payment_status }).eq('id', id);
        break;
      }
      case 'toggle-contact-read':
        await supabase.from('contact_messages').update({ is_read: !parseBool(button.dataset.read) }).eq('id', id);
        break;
      case 'toggle-invest-contacted':
        await supabase.from('investment_inquiries').update({ is_contacted: !parseBool(button.dataset.contacted) }).eq('id', id);
        break;
      case 'toggle-newsletter-active':
        await supabase.from('newsletters').update({ is_active: !parseBool(button.dataset.active) }).eq('id', id);
        break;
      default:
        break;
    }
    await refreshAll();
  } catch (error) {
    showError(error.message || 'Action failed.');
  }
}

function wireForms() {
  ui.loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(ui.loginForm);
    const email = formData.get('email');
    const password = formData.get('password');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return showError(error.message);
    await bootSession();
  });

  ui.signOutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    activeUser = null;
    authUiSignedOut();
  });

  ui.createCategoryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(ui.createCategoryForm);
    const payload = {
      name: String(data.get('name')).trim(),
      slug: String(data.get('slug')).trim(),
      description: String(data.get('description') || '').trim(),
      image_url: String(data.get('image_url') || '').trim() || null,
      is_active: data.get('is_active') === 'on',
    };
    const { error } = await supabase.from('categories').insert(payload);
    if (error) return showError(error.message);
    ui.createCategoryForm.reset();
    await refreshAll();
  });

  ui.createProductForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(ui.createProductForm);
    const payload = {
      name: String(data.get('name')).trim(),
      slug: String(data.get('slug')).trim(),
      sku: String(data.get('sku') || '').trim() || null,
      category_id: Number(data.get('category_id')),
      price: Number(data.get('price')),
      stock_quantity: Number(data.get('stock_quantity')),
      image_url: String(data.get('image_url') || '').trim() || null,
      is_active: data.get('is_active') === 'on',
      is_featured: data.get('is_featured') === 'on',
      description: String(data.get('description') || '').trim(),
    };
    const { error } = await supabase.from('products').insert(payload);
    if (error) return showError(error.message);
    ui.createProductForm.reset();
    await refreshAll();
  });

  document.body.addEventListener('click', handleTableActions);
}

async function bootSession() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    authUiSignedOut();
    return;
  }

  try {
    const allowed = await assertAdmin(user.id);
    if (!allowed) {
      await supabase.auth.signOut();
      authUiSignedOut();
      showError('You are not in admin_users. Ask owner to grant admin access.');
      return;
    }
  } catch (error) {
    authUiSignedOut();
    showError(error.message || 'Could not verify admin access.');
    return;
  }

  activeUser = user;
  authUiSignedIn(user.email || 'admin');
  await refreshAll();
}

async function init() {
  wireTabs();
  wireForms();

  const config = await loadRuntimeConfig();
  if (!config?.SUPABASE_URL || !config?.SUPABASE_ANON_KEY) {
    ui.configWarning.classList.remove('hidden');
    return;
  }

  supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true },
  });

  await bootSession();
  supabase.auth.onAuthStateChange(async () => {
    await bootSession();
  });
}

init().catch((error) => {
  showError(error.message || 'Initialization failed.');
});
