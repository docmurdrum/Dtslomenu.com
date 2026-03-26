// ══════════════════════════════════════════════
// MERCH.JS — DTSLO Merch Store
// Powered by Printful · Bar emblems as products
// ══════════════════════════════════════════════

// ── PRINTFUL API HELPER ──
async function printfulGet(endpoint) {
  var res = await fetch(PRINTFUL_API + endpoint, {
    headers: {
      'Authorization': 'Bearer ' + PRINTFUL_KEY,
      'Content-Type': 'application/json',
    }
  });
  if (!res.ok) throw new Error('Printful API error: ' + res.status);
  var json = await res.json();
  return json.result || json;
}

async function printfulPost(endpoint, body) {
  var res = await fetch(PRINTFUL_API + endpoint, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + PRINTFUL_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    var err = await res.json().catch(function() { return {}; });
    throw new Error(err.error && err.error.message || 'Printful error: ' + res.status);
  }
  var json = await res.json();
  return json.result || json;
}

// ── PRODUCT CACHE ──
var _merchProducts = null;
var _merchLoading  = false;

async function getMerchProducts(forceRefresh) {
  if (_merchProducts && !forceRefresh) return _merchProducts;
  if (_merchLoading) {
    // Wait for existing load
    await new Promise(function(r) { setTimeout(r, 800); });
    return _merchProducts || [];
  }
  _merchLoading = true;
  try {
    var data = await printfulGet('/store/products');
    _merchProducts = Array.isArray(data) ? data : (data.result || []);
  } catch(e) {
    console.warn('[Merch]', e.message);
    _merchProducts = [];
  }
  _merchLoading = false;
  return _merchProducts;
}

// ── QR CODE GENERATOR ──
// Uses Google Charts API — no key needed
function getMerchQRUrl(barSlug, size) {
  size = size || 200;
  var url = 'https://dtslomenu.com/ref/' + (barSlug || 'menu');
  return 'https://chart.googleapis.com/chart?chs=' + size + 'x' + size +
         '&cht=qr&chl=' + encodeURIComponent(url) + '&choe=UTF-8';
}

// ── OPEN MAIN MERCH STORE ──
async function openMerchStore(context) {
  // context: null = main store, barSlug = bar-specific shelf
  var existing = document.getElementById('merch-modal');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'merch-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:8500;background:rgba(6,6,15,0.97);display:flex;flex-direction:column;overflow:hidden';

  if (!document.getElementById('merch-css')) {
    var s = document.createElement('style');
    s.id = 'merch-css';
    s.textContent = [
      '.merch-product-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;cursor:pointer;transition:all 0.15s}',
      '.merch-product-card:active{transform:scale(0.97);background:rgba(255,255,255,0.07)}',
      '.merch-product-img{width:100%;aspect-ratio:1;object-fit:cover;background:rgba(255,255,255,0.05)}',
      '.merch-product-info{padding:10px 12px}',
      '.merch-size-btn{padding:8px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.6);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;transition:all 0.15s}',
      '.merch-size-btn.selected{background:rgba(255,45,120,0.15);border-color:#ff2d78;color:#ff2d78}',
      '.merch-tab{padding:8px 16px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.4);font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;transition:all 0.15s}',
      '.merch-tab.active{background:rgba(255,45,120,0.12);border-color:rgba(255,45,120,0.4);color:#ff2d78}',
    ].join('');
    document.head.appendChild(s);
  }

  modal.innerHTML =
    // Header
    '<div style="padding:52px 20px 0;flex-shrink:0">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">' +
        '<button onclick="closeMerchStore()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">' +
            (context ? '🏪 ' + context.name + ' Merch' : '🛍 DTSLO Merch') +
          '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">Printed & shipped by Printful · Ships worldwide</div>' +
        '</div>' +
        '<button onclick="closeMerchStore()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      // Tabs
      '<div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:12px">' +
        '<button class="merch-tab active" onclick="merchTab(this,\'all\')" data-tab="all">All Products</button>' +
        '<button class="merch-tab" onclick="merchTab(this,\'apparel\')" data-tab="apparel">👕 Apparel</button>' +
        '<button class="merch-tab" onclick="merchTab(this,\'accessories\')" data-tab="accessories">🧢 Accessories</button>' +
        '<button class="merch-tab" onclick="merchTab(this,\'stickers\')" data-tab="stickers">🏷 Stickers</button>' +
      '</div>' +
    '</div>' +

    // Products grid
    '<div id="merch-content" style="flex:1;overflow-y:auto;padding:0 20px 48px">' +
      '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.3)">' +
        '<div style="font-size:32px;margin-bottom:12px">🛍</div>' +
        '<div style="font-size:14px">Loading products...</div>' +
      '</div>' +
    '</div>';

  document.body.appendChild(modal);

  // Load products
  merchLoadProducts('all', context);
}
window.openMerchStore = openMerchStore;

// ── BAR-SPECIFIC SHELF (embedded in bar page) ──
async function openBarMerchShelf(barSlug, barName, barColor) {
  openMerchStore({ slug: barSlug, name: barName, color: barColor || '#ff2d78' });
}
window.openBarMerchShelf = openBarMerchShelf;

function closeMerchStore() {
  var m = document.getElementById('merch-modal');
  if (m) {
    m.style.opacity = '0';
    m.style.transition = 'opacity 0.25s';
    setTimeout(function() { m.remove(); }, 250);
  }
}
window.closeMerchStore = closeMerchStore;

function merchTab(el, tab) {
  document.querySelectorAll('.merch-tab').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  merchLoadProducts(tab, null);
}
window.merchTab = merchTab;

async function merchLoadProducts(tab, context) {
  var content = document.getElementById('merch-content');
  if (!content) return;

  content.innerHTML = '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);font-size:13px">Loading...</div>';

  try {
    var products = await getMerchProducts();

    if (!products.length) {
      content.innerHTML =
        '<div style="text-align:center;padding:40px">' +
          '<div style="font-size:40px;margin-bottom:12px">🛍</div>' +
          '<div style="font-size:15px;font-weight:800;margin-bottom:8px">Store Coming Soon</div>' +
          '<div style="font-size:13px;color:rgba(255,255,255,0.4);margin-bottom:20px">Products are being set up in Printful.<br>Check back soon!</div>' +
          '<div style="font-size:12px;color:rgba(255,255,255,0.25)">Powered by Printful · Ships worldwide</div>' +
        '</div>';
      return;
    }

    // Filter by tab
    var filtered = products;
    if (tab === 'apparel') filtered = products.filter(function(p) {
      return /shirt|tee|hoodie|sweatshirt|jacket|tank/i.test(p.name || '');
    });
    if (tab === 'accessories') filtered = products.filter(function(p) {
      return /hat|cap|bag|mug|cup|bottle|phone|poster/i.test(p.name || '');
    });
    if (tab === 'stickers') filtered = products.filter(function(p) {
      return /sticker/i.test(p.name || '');
    });

    if (!filtered.length) {
      content.innerHTML = '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);font-size:13px">No products in this category yet</div>';
      return;
    }

    content.innerHTML =
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding-top:4px">' +
        filtered.map(function(product) {
          var img = product.thumbnail_url || product.image || '';
          var price = product.retail_price ? '$' + parseFloat(product.retail_price).toFixed(2) : '';
          return '<div class="merch-product-card" onclick="openMerchProduct(' + product.id + ')">' +
            (img ? '<img class="merch-product-img" src="' + img + '" loading="lazy" alt="' + (product.name||'') + '">' :
              '<div class="merch-product-img" style="display:flex;align-items:center;justify-content:center;font-size:40px">🛍</div>') +
            '<div class="merch-product-info">' +
              '<div style="font-size:12px;font-weight:800;margin-bottom:4px;line-height:1.3">' + (product.name||'Product') + '</div>' +
              (price ? '<div style="font-size:13px;font-weight:900;color:#ff2d78">' + price + '</div>' : '') +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>' +
      // QR section at bottom
      '<div style="margin-top:24px;padding:16px;background:rgba(255,45,120,0.06);border:1px solid rgba(255,45,120,0.15);border-radius:16px">' +
        '<div style="font-size:13px;font-weight:800;margin-bottom:4px">📲 Every item includes a QR code</div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,0.45);line-height:1.5">Scan to download the app · Track scans in your dashboard</div>' +
      '</div>';

  } catch(e) {
    content.innerHTML =
      '<div style="text-align:center;padding:40px">' +
        '<div style="font-size:32px;margin-bottom:12px">⚠️</div>' +
        '<div style="font-size:14px;color:rgba(255,255,255,0.5)">Couldn\'t load products right now</div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,0.25);margin-top:8px">' + e.message + '</div>' +
      '</div>';
  }
}
window.merchLoadProducts = merchLoadProducts;

// ── PRODUCT DETAIL ──
async function openMerchProduct(productId) {
  var existing = document.getElementById('merch-detail-modal');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'merch-detail-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:8600;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);display:flex;align-items:flex-end;justify-content:center';

  modal.innerHTML =
    '<div id="merch-detail-inner" style="width:100%;max-width:480px;background:rgba(8,8,20,0.99);border-radius:24px 24px 0 0;border-top:2px solid rgba(255,45,120,0.25);padding:16px 20px 48px;max-height:90vh;overflow-y:auto;transform:translateY(30px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +
        '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12)"></div>' +
        '<button onclick="document.getElementById(\'merch-detail-modal\').remove()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:30px;height:30px;border-radius:50%;font-size:14px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);font-size:13px">Loading product...</div>' +
    '</div>';

  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.remove();
  });

  setTimeout(function() {
    var inner = document.getElementById('merch-detail-inner');
    if (inner) inner.style.transform = 'translateY(0)';
  }, 30);

  // Load product details
  try {
    var product = await printfulGet('/store/products/' + productId);
    var inner = document.getElementById('merch-detail-inner');
    if (!inner) return;

    var variants = product.sync_variants || [];
    var sizes = [];
    var seen = {};
    variants.forEach(function(v) {
      var size = v.size || (v.product && v.product.size) || '';
      if (size && !seen[size]) { seen[size] = true; sizes.push({ size: size, id: v.id, price: v.retail_price }); }
    });

    var img = (product.sync_product && product.sync_product.thumbnail_url) ||
              (product.thumbnail_url) || '';
    var name = (product.sync_product && product.sync_product.name) || product.name || 'Product';
    var price = variants.length ? '$' + parseFloat(variants[0].retail_price || 0).toFixed(2) : '';

    inner.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +
        '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12)"></div>' +
        '<button onclick="document.getElementById(\'merch-detail-modal\').remove()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:30px;height:30px;border-radius:50%;font-size:14px;cursor:pointer">✕</button>' +
      '</div>' +

      // Product image
      (img ? '<img src="' + img + '" style="width:100%;border-radius:14px;margin-bottom:14px;object-fit:cover;max-height:280px" alt="' + name + '">' : '') +

      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:4px">' + name + '</div>' +
      '<div style="font-size:20px;font-weight:900;color:#ff2d78;margin-bottom:16px">' + price + '</div>' +

      // Size selector
      (sizes.length ? '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">SELECT SIZE</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px" id="merch-sizes">' +
          sizes.map(function(s, i) {
            return '<button class="merch-size-btn' + (i===0?' selected':'') + '" onclick="merchSelectSize(this,\'' + s.id + '\',\'' + s.price + '\')" data-variant="' + s.id + '" data-price="' + s.price + '">' + s.size + '</button>';
          }).join('') +
        '</div>' : '') +

      // QR code section
      '<div style="padding:12px;background:rgba(255,45,120,0.05);border:1px solid rgba(255,45,120,0.15);border-radius:12px;margin-bottom:16px">' +
        '<div style="font-size:11px;font-weight:700;color:#ff2d78;margin-bottom:8px">📲 Includes QR Code on tag</div>' +
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<img src="' + getMerchQRUrl('menu', 80) + '" style="width:60px;height:60px;border-radius:8px;background:white;padding:4px">' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.45);line-height:1.5">Scanned to download DTSLO app · Every scan tracked in your analytics</div>' +
        '</div>' +
      '</div>' +

      // Buy button
      '<button onclick="merchBuyNow()" id="merch-buy-btn" style="width:100%;padding:15px;border-radius:16px;border:none;background:linear-gradient(135deg,#ff2d78,#b44fff);color:white;font-size:15px;font-weight:800;font-family:Helvetica Neue,sans-serif;cursor:pointer;margin-bottom:8px">Buy Now →</button>' +
      '<div style="text-align:center;font-size:10px;color:rgba(255,255,255,0.25)">Fulfilled by Printful · Ships worldwide · 2-7 business days</div>';

    // Store selected variant
    if (variants.length) {
      window._selectedVariantId = variants[0].id;
      window._selectedProductId = product.sync_product && product.sync_product.id;
    }

  } catch(e) {
    var inner = document.getElementById('merch-detail-inner');
    if (inner) inner.innerHTML += '<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.4);font-size:13px">Could not load product: ' + e.message + '</div>';
  }
}
window.openMerchProduct = openMerchProduct;

function merchSelectSize(el, variantId, price) {
  document.querySelectorAll('.merch-size-btn').forEach(function(b) { b.classList.remove('selected'); });
  el.classList.add('selected');
  window._selectedVariantId = variantId;
  var btn = document.getElementById('merch-buy-btn');
  if (btn && price) btn.textContent = 'Buy Now — $' + parseFloat(price).toFixed(2) + ' →';
}
window.merchSelectSize = merchSelectSize;

function merchBuyNow() {
  // For now: open Printful store URL or show checkout flow
  // Full checkout requires backend order creation — show contact/order form for MVP
  var modal = document.getElementById('merch-detail-modal');
  if (!modal) return;

  // Show order prompt - direct to email/store for now
  if (typeof showToast === 'function') showToast('🛍 Opening checkout...');

  // If we have a store URL configured, open it
  if (window.MERCH_STORE_URL) {
    window.open(window.MERCH_STORE_URL, '_blank');
  } else {
    // Show order flow modal
    showMerchCheckout();
  }
}
window.merchBuyNow = merchBuyNow;

function showMerchCheckout() {
  var existing = document.getElementById('merch-checkout-modal');
  if (existing) existing.remove();

  var m = document.createElement('div');
  m.id = 'merch-checkout-modal';
  m.style.cssText = 'position:fixed;inset:0;z-index:8700;background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:24px';
  m.innerHTML =
    '<div style="background:rgba(8,8,20,0.99);border-radius:24px;border:1px solid rgba(255,45,120,0.25);padding:28px 24px;max-width:340px;width:100%;text-align:center">' +
      '<div style="font-size:36px;margin-bottom:12px">🛍</div>' +
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:8px">Complete Your Order</div>' +
      '<div style="font-size:13px;color:rgba(255,255,255,0.5);line-height:1.5;margin-bottom:20px">We\'ll send you a secure checkout link to complete your purchase through our store.</div>' +
      '<input id="merch-order-email" type="email" placeholder="Your email" style="width:100%;padding:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:white;font-size:14px;font-family:inherit;outline:none;margin-bottom:12px">' +
      '<button onclick="submitMerchOrder()" style="width:100%;padding:14px;border-radius:14px;border:none;background:linear-gradient(135deg,#ff2d78,#b44fff);color:white;font-size:15px;font-weight:800;font-family:inherit;cursor:pointer;margin-bottom:8px">Send Checkout Link</button>' +
      '<button onclick="document.getElementById(\'merch-checkout-modal\').remove()" style="width:100%;padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.3);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer">Cancel</button>' +
    '</div>';
  document.body.appendChild(m);
  m.addEventListener('click', function(e) { if(e.target===m) m.remove(); });
}

async function submitMerchOrder() {
  var email = document.getElementById('merch-order-email');
  if (!email || !email.value.includes('@')) {
    if (typeof showToast === 'function') showToast('❌ Please enter a valid email');
    return;
  }

  // Save order request to Supabase for manual fulfillment during MVP
  try {
    if (supabaseClient) {
      await supabaseClient.from('merch_orders').insert({
        email: email.value,
        variant_id: window._selectedVariantId || null,
        product_id: window._selectedProductId || null,
        user_id: currentUser ? currentUser.id : null,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
    }
  } catch(e) {}

  document.getElementById('merch-checkout-modal').remove();
  if (typeof showToast === 'function') showToast('✅ Order request sent! Check your email.');
}
window.submitMerchOrder = submitMerchOrder;

// ── REFERRAL TRACKING ──
function trackMerchQRScan(barSlug) {
  if (supabaseClient) {
    supabaseClient.from('referral_scans').insert({
      bar_slug: barSlug || 'menu',
      source: 'merch_qr',
      scanned_at: new Date().toISOString(),
      user_agent: navigator.userAgent,
    }).then(function(){}).catch(function(){});
  }
}
window.trackMerchQRScan = trackMerchQRScan;
