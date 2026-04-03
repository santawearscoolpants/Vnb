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
  paymentsTable: $('paymentsTable'),
  contactTable: $('contactTable'),
  investTable: $('investTable'),
  newsletterTable: $('newsletterTable'),
  detailModal: $('detailModal'),
  detailModalTitle: $('detailModalTitle'),
  detailModalBody: $('detailModalBody'),
  editCategoryForm: $('editCategoryForm'),
  editProductForm: $('editProductForm'),
};

function showDetailModal(title, bodyHtml) {
  if (ui.detailModalTitle) ui.detailModalTitle.textContent = title;
  if (ui.detailModalBody) ui.detailModalBody.innerHTML = bodyHtml;
  if (ui.detailModal) ui.detailModal.classList.remove('hidden');
}

function hideDetailModal() {
  if (ui.detailModal) ui.detailModal.classList.add('hidden');
}

async function renderProductInlines(productId) {
  if (!productId) return;
  const pid = Number(productId);
  const { data: product, error } = await supabase
    .from('products')
    .select('*, product_images(*), product_colors(*), product_sizes(*), product_details(*)')
    .eq('id', pid)
    .single();
  if (error || !product) return;

  const images = (product.product_images || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const colors = product.product_colors || [];
  const sizes = product.product_sizes || [];
  const details = (product.product_details || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const imgList = $('productImagesList');
  if (imgList) {
    imgList.innerHTML = images.length === 0 ? '<p class="muted">No images. Add one below.</p>' : `
      <table><thead><tr><th>Preview</th><th>Alt</th><th>Primary</th><th>Order</th><th></th></tr></thead><tbody>
      ${images.map((i) => `<tr>
        <td><img src="${escapeHtml(i.image_url)}" alt="" style="max-height:36px;max-width:60px;object-fit:contain;" onerror="this.style.display='none'" /></td>
        <td>${escapeHtml(i.alt_text || '')}</td>
        <td>${i.is_primary ? 'Yes' : 'No'}</td>
        <td>${i.order ?? 0}</td>
        <td><button type="button" data-action="delete-product-image" data-id="${i.id}">Delete</button></td>
      </tr>`).join('')}
      </tbody></table>`;
  }

  const colList = $('productColorsList');
  if (colList) {
    colList.innerHTML = colors.length === 0 ? '<p class="muted">No colors. Add one below.</p>' : `
      <table><thead><tr><th>Name</th><th>Hex</th><th>Available</th><th></th></tr></thead><tbody>
      ${colors.map((c) => `<tr>
        <td>${escapeHtml(c.name)}</td>
        <td><span style="display:inline-block;width:14px;height:14px;background:${escapeHtml(c.hex_code)};border:1px solid var(--border);"></span> ${escapeHtml(c.hex_code)}</td>
        <td>${c.is_available !== false ? 'Yes' : 'No'}</td>
        <td><button type="button" data-action="delete-product-color" data-id="${c.id}">Delete</button></td>
      </tr>`).join('')}
      </tbody></table>`;
  }

  const szList = $('productSizesList');
  if (szList) {
    szList.innerHTML = sizes.length === 0 ? '<p class="muted">No sizes. Add one below.</p>' : `
      <table><thead><tr><th>Size</th><th>Available</th><th></th></tr></thead><tbody>
      ${sizes.map((s) => `<tr>
        <td>${escapeHtml(s.size)}</td>
        <td>${s.is_available !== false ? 'Yes' : 'No'}</td>
        <td><button type="button" data-action="delete-product-size" data-id="${s.id}">Delete</button></td>
      </tr>`).join('')}
      </tbody></table>`;
  }

  const detList = $('productDetailsList');
  if (detList) {
    detList.innerHTML = details.length === 0 ? '<p class="muted">No details. Add one below.</p>' : `
      <table><thead><tr><th>Detail</th><th>Order</th><th></th></tr></thead><tbody>
      ${details.map((d) => `<tr>
        <td>${escapeHtml(d.detail)}</td>
        <td>${d.order ?? 0}</td>
        <td><button type="button" data-action="delete-product-detail" data-id="${d.id}">Delete</button></td>
      </tr>`).join('')}
      </tbody></table>`;
  }
}

let supabase = null;
let activeUser = null;
let runtimeConfig = null;

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

function requireApiBaseUrl() {
  const apiBaseUrl = String(runtimeConfig?.API_BASE_URL || '').trim().replace(/\/+$/, '');
  if (!apiBaseUrl) {
    throw new Error('Set API_BASE_URL in admin-panel/config.js before uploading media.');
  }
  return apiBaseUrl;
}

async function getAccessToken() {
  if (!supabase) {
    throw new Error('Admin panel is still initializing. Reload and try again.');
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;
  if (!session?.access_token) {
    throw new Error('Sign in again before uploading media.');
  }

  return session.access_token;
}

async function uploadMedia(file, folder = 'products') {
  if (!(file instanceof File)) {
    throw new Error('Choose a file to upload.');
  }

  const apiBaseUrl = requireApiBaseUrl();
  const accessToken = await getAccessToken();
  const formData = new FormData();
  formData.set('file', file);
  formData.set('folder', folder);

  const response = await fetch(`${apiBaseUrl}/media/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || 'Media upload failed.');
  }

  if (!data?.url) {
    throw new Error('Upload succeeded but no media URL was returned.');
  }

  return data;
}

function bindUploadInput(fileInputId, textInputId, folder) {
  const fileInput = $(fileInputId);
  const textInput = $(textInputId);
  if (!fileInput || !textInput) return;

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    const previousPlaceholder = textInput.placeholder;
    const previousValue = textInput.value;
    textInput.placeholder = 'Uploading...';
    fileInput.disabled = true;

    try {
      const media = await uploadMedia(file, folder);
      textInput.value = media.url;
    } catch (error) {
      textInput.value = previousValue;
      showError(error?.message || 'Unable to upload file.');
    } finally {
      textInput.placeholder = previousPlaceholder;
      fileInput.value = '';
      fileInput.disabled = false;
    }
  });
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
    ['payment_attempts', 'Payments'],
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

  const categoryList = data || [];
  const categoryOptions = categoryList.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  ui.categorySelect.innerHTML = categoryOptions;
  const editCatSelect = $('editProductCategoryId');
  if (editCatSelect) editCatSelect.innerHTML = categoryOptions;

  ui.categoriesTable.innerHTML = `
    <table>
      <thead><tr><th>Name</th><th>Slug</th><th>Active</th><th>Created</th><th>Actions</th></tr></thead>
      <tbody>
        ${categoryList
          .map(
            (c) => `
          <tr>
            <td>${escapeHtml(c.name)}</td>
            <td>${escapeHtml(c.slug)}</td>
            <td>${c.is_active ? 'Yes' : 'No'}</td>
            <td>${new Date(c.created_at).toLocaleString()}</td>
            <td class="actions">
              <button data-action="edit-category" data-id="${c.id}">Edit</button>
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
    .select('id,name,price,stock_quantity,is_active,is_featured,slug,category_id,categories(name)')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;

  const productList = data || [];
  ui.productsTable.innerHTML = `
    <table>
      <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Flags</th><th>Actions</th></tr></thead>
      <tbody>
        ${productList
          .map(
            (p) => `
          <tr>
            <td>${escapeHtml(p.name)}<div class="muted">${escapeHtml(p.slug)}</div></td>
            <td>${escapeHtml(p.categories?.name || '-')}</td>
            <td>GHS ${Number(p.price).toFixed(2)}</td>
            <td>${p.stock_quantity}</td>
            <td>${p.is_active ? 'Active' : 'Inactive'} / ${p.is_featured ? 'Featured' : 'Normal'}</td>
            <td class="actions">
              <button data-action="edit-product" data-id="${p.id}">Edit</button>
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
  const orderList = data || [];

  ui.ordersTable.innerHTML = `
    <table>
      <thead><tr><th>Order</th><th>Email</th><th>Total</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead>
      <tbody>
        ${orderList
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
            <td class="actions">
              <button data-action="view-order" data-id="${o.id}">View</button>
              <button data-action="save-order" data-id="${o.id}" class="primary">Save</button>
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;
}

async function loadPayments() {
  if (!ui.paymentsTable) return;
  const { data, error } = await supabase
    .from('payment_attempts')
    .select('id,reference,email,total,currency,status,paystack_status,created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) {
    ui.paymentsTable.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
    return;
  }

  ui.paymentsTable.innerHTML = `
    <table>
      <thead><tr><th>Reference</th><th>Email</th><th>Total</th><th>Currency</th><th>Status</th><th>Paystack</th><th>Created</th></tr></thead>
      <tbody>
        ${(data || [])
          .map(
            (p) => `
          <tr>
            <td>${escapeHtml(p.reference)}</td>
            <td>${escapeHtml(p.email)}</td>
            <td>${Number(p.total).toFixed(2)}</td>
            <td>${escapeHtml(p.currency || '')}</td>
            <td>${escapeHtml(p.status || '')}</td>
            <td>${escapeHtml(p.paystack_status || '-')}</td>
            <td>${new Date(p.created_at).toLocaleString()}</td>
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
    .select('id,name,email,phone,subject,is_read,created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;

  ui.contactTable.innerHTML = `
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Subject</th><th>Read</th><th>Actions</th></tr></thead>
      <tbody>
        ${(data || [])
          .map(
            (c) => `
          <tr>
            <td>${escapeHtml(c.name)}</td>
            <td>${escapeHtml(c.email)}</td>
            <td>${escapeHtml(c.phone || '-')}</td>
            <td>${escapeHtml(c.subject)}<div class="muted">${new Date(c.created_at).toLocaleString()}</div></td>
            <td>${c.is_read ? 'Yes' : 'No'}</td>
            <td class="actions">
              <button data-action="view-contact" data-id="${c.id}">View</button>
              <button data-action="toggle-contact-read" data-id="${c.id}" data-read="${c.is_read}">${c.is_read ? 'Mark unread' : 'Mark read'}</button>
            </td>
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
    .select('id,name,email,phone,tier,is_contacted,created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;

  ui.investTable.innerHTML = `
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Tier</th><th>Contacted</th><th>Actions</th></tr></thead>
      <tbody>
        ${(data || [])
          .map(
            (i) => `
          <tr>
            <td>${escapeHtml(i.name)}</td>
            <td>${escapeHtml(i.email)}</td>
            <td>${escapeHtml(i.phone || '-')}</td>
            <td>${escapeHtml(i.tier)}<div class="muted">${new Date(i.created_at).toLocaleString()}</div></td>
            <td>${i.is_contacted ? 'Yes' : 'No'}</td>
            <td class="actions">
              <button data-action="view-invest" data-id="${i.id}">View</button>
              <button data-action="toggle-invest-contacted" data-id="${i.id}" data-contacted="${i.is_contacted}">${i.is_contacted ? 'Mark not contacted' : 'Mark contacted'}</button>
            </td>
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
        ${(data || [])
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
  await Promise.all([
    loadStats(),
    loadCategories(),
    loadProducts(),
    loadOrders(),
    loadPayments(),
    loadContact(),
    loadInvest(),
    loadNewsletter(),
  ]);
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
      case 'view-contact': {
        const { data: row } = await supabase.from('contact_messages').select('*').eq('id', id).single();
        if (row)
          showDetailModal(
            'Contact message',
            `<p><strong>Name:</strong> ${escapeHtml(row.name)}</p><p><strong>Email:</strong> ${escapeHtml(row.email)}</p><p><strong>Phone:</strong> ${escapeHtml(row.phone || '-')}</p><p><strong>Subject:</strong> ${escapeHtml(row.subject)}</p><p><strong>Message:</strong></p><p>${escapeHtml(row.message)}</p>`
          );
        break;
      }
      case 'view-invest': {
        const { data: row } = await supabase.from('investment_inquiries').select('*').eq('id', id).single();
        if (row)
          showDetailModal(
            'Investment inquiry',
            `<p><strong>Name:</strong> ${escapeHtml(row.name)}</p><p><strong>Email:</strong> ${escapeHtml(row.email)}</p><p><strong>Phone:</strong> ${escapeHtml(row.phone || '-')}</p><p><strong>Tier:</strong> ${escapeHtml(row.tier)}</p><p><strong>Message:</strong></p><p>${escapeHtml(row.message || '-')}</p>`
          );
        break;
      }
      case 'view-order': {
        const { data: order } = await supabase.from('orders').select('*').eq('id', id).single();
        if (!order) break;
        const { data: items } = await supabase.from('order_items').select('*').eq('order_id', id);
        const addr = [order.address, order.city, order.state, order.zip_code, order.country].filter(Boolean).join(', ');
        const rows = (items || []).map((i) => `${escapeHtml(i.product_name)} × ${i.quantity} (${i.size || '-'} / ${i.color || '-'}) — ${Number(i.subtotal).toFixed(2)}`).join('\n');
        showDetailModal(
          `Order ${escapeHtml(order.order_number)}`,
          `<p><strong>Customer:</strong> ${escapeHtml(order.first_name)} ${escapeHtml(order.last_name)} &lt;${escapeHtml(order.email)}&gt;</p><p><strong>Phone:</strong> ${escapeHtml(order.phone)}</p><p><strong>Address:</strong> ${escapeHtml(addr)}</p><p><strong>Items:</strong></p><pre>${rows || '-'}</pre><p><strong>Total:</strong> ${escapeHtml(order.payment_currency || 'GHS')} ${Number(order.total).toFixed(2)}</p>`
        );
        break;
      }
      case 'edit-category': {
        const { data: cat } = await supabase.from('categories').select('*').eq('id', id).single();
        if (!cat || !ui.editCategoryForm) break;
        $('editCategoryId').value = cat.id;
        $('editCategoryName').value = cat.name || '';
        $('editCategorySlug').value = cat.slug || '';
        $('editCategoryImageUrl').value = cat.image_url || '';
        $('editCategoryDescription').value = cat.description || '';
        $('editCategoryIsActive').checked = !!cat.is_active;
        $('editCategoryCard').classList.remove('hidden');
        break;
      }
      case 'edit-product': {
        const { data: prod } = await supabase.from('products').select('*, product_images(*), product_colors(*), product_sizes(*), product_details(*)').eq('id', id).single();
        if (!prod || !ui.editProductForm) break;
        $('editProductId').value = prod.id;
        $('editProductName').value = prod.name || '';
        $('editProductSlug').value = prod.slug || '';
        $('editProductSku').value = prod.sku || '';
        $('editProductCategoryId').value = prod.category_id;
        $('editProductPrice').value = prod.price ?? '';
        $('editProductStock').value = prod.stock_quantity ?? 0;
        $('editProductImageUrl').value = prod.image_url || '';
        $('editProductIsActive').checked = !!prod.is_active;
        $('editProductIsFeatured').checked = !!prod.is_featured;
        $('editProductDescription').value = prod.description || '';
        $('editProductCard').classList.remove('hidden');
        await renderProductInlines(prod.id);
        break;
      }
      case 'delete-product-image':
        await supabase.from('product_images').delete().eq('id', id);
        await renderProductInlines(Number($('editProductId')?.value));
        break;
      case 'delete-product-color':
        await supabase.from('product_colors').delete().eq('id', id);
        await renderProductInlines(Number($('editProductId')?.value));
        break;
      case 'delete-product-size':
        await supabase.from('product_sizes').delete().eq('id', id);
        await renderProductInlines(Number($('editProductId')?.value));
        break;
      case 'delete-product-detail':
        await supabase.from('product_details').delete().eq('id', id);
        await renderProductInlines(Number($('editProductId')?.value));
        break;
      default:
        break;
    }
    const skipRefresh = ['view-contact', 'view-invest', 'view-order', 'edit-category', 'edit-product', 'delete-product-image', 'delete-product-color', 'delete-product-size', 'delete-product-detail'].includes(action);
    if (!skipRefresh) await refreshAll();
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

  bindUploadInput('createCategoryImageFile', 'createCategoryImageUrl', 'categories');
  bindUploadInput('editCategoryImageFile', 'editCategoryImageUrl', 'categories');
  bindUploadInput('createProductImageFile', 'createProductImageUrl', 'products');
  bindUploadInput('editProductImageFile', 'editProductImageUrl', 'products');
  bindUploadInput('newImageFile', 'newImageUrl', 'products/gallery');

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

  if (!ui.createProductForm) {
    console.error('Create product form not found');
  }
  ui.createProductForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const data = new FormData(ui.createProductForm);
      const name = String(data.get('name')).trim();
      const slug = String(data.get('slug')).trim();
      const categoryId = Number(data.get('category_id'));
      const price = Number(data.get('price'));
      const stockQuantity = Number(data.get('stock_quantity'));

      if (!name) return showError('Please enter a product name.');
      if (!slug) return showError('Please enter a slug.');
      if (!categoryId || categoryId <= 0) return showError('Please select a category. If the list is empty, create a category first.');
      if (Number.isNaN(price) || price < 0) return showError('Please enter a valid price.');
      if (Number.isNaN(stockQuantity) || stockQuantity < 0) return showError('Please enter a valid stock quantity.');
      if (!String(data.get('description')).trim()) return showError('Please enter a description.');

      const payload = {
        name,
        slug,
        sku: String(data.get('sku') || '').trim() || null,
        category_id: categoryId,
        price,
        stock_quantity: stockQuantity,
        image_url: String(data.get('image_url') || '').trim() || null,
        is_active: data.get('is_active') === 'on',
        is_featured: data.get('is_featured') === 'on',
        description: String(data.get('description') || '').trim(),
      };
      const { error } = await supabase.from('products').insert(payload);
      if (error) return showError(error.message);
      ui.createProductForm.reset();
      await refreshAll();
    } catch (err) {
      showError(err?.message || 'Failed to create product.');
      console.error('Create product error:', err);
    }
  });

  document.body.addEventListener('click', handleTableActions);

  if (ui.editCategoryForm) {
    ui.editCategoryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = Number($('editCategoryId').value);
      const payload = {
        name: String($('editCategoryName').value).trim(),
        slug: String($('editCategorySlug').value).trim(),
        description: String($('editCategoryDescription').value).trim(),
        image_url: String($('editCategoryImageUrl').value).trim() || null,
        is_active: $('editCategoryIsActive').checked,
      };
      const { error } = await supabase.from('categories').update(payload).eq('id', id);
      if (error) return showError(error.message);
      $('editCategoryCard').classList.add('hidden');
      await refreshAll();
    });
  }
  document.querySelector('.cancelEditCategory')?.addEventListener('click', () => {
    $('editCategoryCard').classList.add('hidden');
  });

  if (ui.editProductForm) {
    ui.editProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = Number($('editProductId').value);
      const payload = {
        name: String($('editProductName').value).trim(),
        slug: String($('editProductSlug').value).trim(),
        sku: String($('editProductSku').value).trim() || null,
        category_id: Number($('editProductCategoryId').value),
        price: Number($('editProductPrice').value),
        stock_quantity: Number($('editProductStock').value),
        image_url: String($('editProductImageUrl').value).trim() || null,
        is_active: $('editProductIsActive').checked,
        is_featured: $('editProductIsFeatured').checked,
        description: String($('editProductDescription').value).trim(),
      };
      const { error } = await supabase.from('products').update(payload).eq('id', id);
      if (error) return showError(error.message);
      $('editProductCard').classList.add('hidden');
      await refreshAll();
    });
  }
  document.querySelector('.cancelEditProduct')?.addEventListener('click', () => {
    $('editProductCard').classList.add('hidden');
  });

  $('addProductImage')?.addEventListener('click', async () => {
    const productId = Number($('editProductId')?.value);
    if (!productId) return showError('Save the product first, then add images.');
    const image_url = String($('newImageUrl')?.value || '').trim();
    if (!image_url) return showError('Enter an image URL.');
    const { error } = await supabase.from('product_images').insert({
      product_id: productId,
      image_url,
      alt_text: String($('newImageAlt')?.value || '').trim(),
      is_primary: $('newImagePrimary')?.checked ?? false,
      order: Number($('newImageOrder')?.value) || 0,
    });
    if (error) return showError(error.message);
    $('newImageUrl').value = ''; $('newImageAlt').value = ''; $('newImagePrimary').checked = false; $('newImageOrder').value = '0';
    await renderProductInlines(productId);
  });

  $('addProductColor')?.addEventListener('click', async () => {
    const productId = Number($('editProductId')?.value);
    if (!productId) return showError('Save the product first, then add colors.');
    const name = String($('newColorName')?.value || '').trim();
    if (!name) return showError('Enter a color name.');
    const hex_code = String($('newColorHex')?.value || '').trim() || '#000000';
    const { error } = await supabase.from('product_colors').insert({
      product_id: productId,
      name,
      hex_code,
      is_available: $('newColorAvailable')?.checked !== false,
    });
    if (error) return showError(error.message);
    $('newColorName').value = ''; $('newColorHex').value = ''; $('newColorAvailable').checked = true;
    await renderProductInlines(productId);
  });

  $('addProductSize')?.addEventListener('click', async () => {
    const productId = Number($('editProductId')?.value);
    if (!productId) return showError('Save the product first, then add sizes.');
    const size = String($('newSizeName')?.value || '').trim();
    if (!size) return showError('Enter a size.');
    const { error } = await supabase.from('product_sizes').insert({
      product_id: productId,
      size,
      is_available: $('newSizeAvailable')?.checked !== false,
    });
    if (error) return showError(error.message);
    $('newSizeName').value = ''; $('newSizeAvailable').checked = true;
    await renderProductInlines(productId);
  });

  $('addProductDetail')?.addEventListener('click', async () => {
    const productId = Number($('editProductId')?.value);
    if (!productId) return showError('Save the product first, then add details.');
    const detail = String($('newDetailText')?.value || '').trim();
    if (!detail) return showError('Enter detail text.');
    const { error } = await supabase.from('product_details').insert({
      product_id: productId,
      detail,
      order: Number($('newDetailOrder')?.value) || 0,
    });
    if (error) return showError(error.message);
    $('newDetailText').value = ''; $('newDetailOrder').value = '0';
    await renderProductInlines(productId);
  });

  document.querySelectorAll('[data-dismiss="modal"]').forEach((el) => el.addEventListener('click', hideDetailModal));
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

  const config = await loadRuntimeConfig();
  if (!config?.SUPABASE_URL || !config?.SUPABASE_ANON_KEY) {
    ui.configWarning.classList.remove('hidden');
    return;
  }

  runtimeConfig = config;

  supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true },
  });

  wireForms();
  await bootSession();
  supabase.auth.onAuthStateChange(async () => {
    await bootSession();
  });
}

init().catch((error) => {
  showError(error.message || 'Initialization failed.');
});
