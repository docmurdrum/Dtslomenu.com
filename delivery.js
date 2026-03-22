// ══════════════════════════════════════════════
// DELIVERY.JS — Products, Cart, Orders
// ══════════════════════════════════════════════

const products = [
  { name: 'Red Bull', emoji: '⚡', price: 3.99 },
  { name: 'Water',    emoji: '💧', price: 1.99 },
  { name: 'Charger',  emoji: '🔋', price: 14.99 },
  { name: 'Snack',    emoji: '🍫', price: 2.49 }
];

let cart = {};

function renderProducts() {
  const g = document.getElementById('product-grid');
  g.innerHTML = '';
  products.forEach(p => {
    const el = document.createElement('div');
    el.className = 'product-card';
    el.innerHTML = `
      <div class="product-emoji">${p.emoji}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-price">$${p.price.toFixed(2)}</div>
      <button class="add-btn" onclick="addToCart('${p.name}')">Add to Cart</button>`;
    g.appendChild(el);
  });
}

function updateCartUI() {
  const total = Object.values(cart).reduce((a, b) => a + b, 0);
  document.getElementById('cart-count').textContent = total;
  document.getElementById('cart-fab').style.display = total > 0 ? 'flex' : 'none';
}

function addToCart(name) {
  cart[name] = (cart[name] || 0) + 1;
  updateCartUI();
  showToast(`✅ ${name} added`);
}

function openCheckout() {
  const s = document.getElementById('order-summary');
  s.innerHTML = '';
  let total = 0;
  for (const name in cart) {
    const p = products.find(x => x.name === name);
    const lt = p ? p.price * cart[name] : 0;
    total += lt;
    s.innerHTML += `<div class="order-item"><span>${name} × ${cart[name]}</span><span>$${lt.toFixed(2)}</span></div>`;
  }
  document.getElementById('order-total').textContent = '$' + total.toFixed(2);
  document.getElementById('checkout-name').value = getUsername();
  document.getElementById('checkout-modal').classList.add('open');
}

function closeCheckout() { document.getElementById('checkout-modal').classList.remove('open'); }

async function placeOrder() {
  const name  = document.getElementById('checkout-name').value.trim();
  const phone = document.getElementById('checkout-phone').value.trim();
  if (!name || !phone) { showToast('⚠️ Please fill in your details'); return; }
  const items = Object.entries(cart).map(([k, v]) => `${k} x${v}`).join(', ');
  try {
    await supabaseClient.from('orders').insert([{ name, phone, items, user_id: currentUser?.id }]);
    showToast('🎉 Order placed!');
    cart = {}; updateCartUI(); closeCheckout();
  } catch (e) { showToast('❌ Order failed'); }
}
