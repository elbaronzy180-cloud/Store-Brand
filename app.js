/**
 * AURA — Vanilla JS E-Commerce MVP
 * Cart logic, product rendering, localStorage persistence, UI interactions.
 * Safe for multi-page use (only attaches listeners when elements exist).   
 **/
// ===================== PRODUCT CATALOG =====================
const products = [
  {
    id: 1,
    name: 'Silhouette Backpack',
    price: 129.00,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: 'Eclipse Watch',
    price: 249.00,
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    name: 'Aether Headphones',
    price: 179.00,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    name: 'Vertex Sneakers',
    price: 159.00,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 5,
    name: 'Nova Water Bottle',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 6,
    name: 'Prism Sunglasses',
    price: 199.00,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
];

// ===================== CART STATE =====================
let cart = [];

// ===================== LOCAL STORAGE =====================
const CART_KEY = 'aura_cart';

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function loadCart() {
  const stored = localStorage.getItem(CART_KEY);
  if (stored) {
    try {
      cart = JSON.parse(stored);
    } catch (e) {
      cart = [];
    }
  } else {
    cart = [];
  }
}

// ===================== UI HELPERS =====================

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = totalItems;
  // Trigger pulse animation
  badge.classList.add('badge-pulse');
  setTimeout(() => {
    badge.classList.remove('badge-pulse');
  }, 400);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// ===================== RENDER PRODUCTS =====================
function renderProducts() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  grid.innerHTML = '';

  products.forEach((product) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" loading="lazy" />
      <div class="product-card-body">
        <h3>${product.name}</h3>
        <p class="price">${formatCurrency(product.price)}</p>
        <button class="add-to-cart-btn" data-id="${product.id}">
          Add to Cart
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ===================== RENDER CART =====================
function renderCart() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartEmpty = document.getElementById('cart-empty');
  if (!cartItemsContainer || !cartEmpty) return;

  cartItemsContainer.innerHTML = '';

  if (cart.length === 0) {
    cartEmpty.classList.remove('hidden');
    cartItemsContainer.classList.add('hidden');
  } else {
    cartEmpty.classList.add('hidden');
    cartItemsContainer.classList.remove('hidden');

    cart.forEach((item) => {
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}" />
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p class="price">${formatCurrency(item.price)}</p>
        </div>
        <div class="cart-item-quantity">
          <button class="qty-decrease" data-id="${item.id}">−</button>
          <span>${item.quantity}</span>
          <button class="qty-increase" data-id="${item.id}">+</button>
        </div>
      `;
      cartItemsContainer.appendChild(cartItem);
    });
  }

  calculateTotals();
  saveCart();
  updateCartBadge();
}

function calculateTotals() {
  const subtotalEl = document.getElementById('subtotal-amount');
  const shippingEl = document.getElementById('shipping-amount');
  const totalEl = document.getElementById('total-amount');
  if (!subtotalEl || !shippingEl || !totalEl) return;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingThreshold = 100;
  const shippingCost = subtotal >= shippingThreshold ? 0 : 5.99;
  const total = subtotal + shippingCost;

  subtotalEl.textContent = formatCurrency(subtotal);
  shippingEl.textContent = shippingCost === 0 ? 'Free' : formatCurrency(shippingCost);
  totalEl.textContent = formatCurrency(total);
}

// ===================== CART ACTIONS =====================

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  }
  renderCart();
}

function changeQuantity(productId, delta) {
  const item = cart.find((item) => item.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter((item) => item.id !== productId);
  }
  renderCart();
}

// ===================== CART DRAWER TOGGLE =====================
function openCart() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (!drawer || !overlay) return;
  drawer.classList.add('open');
  overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (!drawer || !overlay) return;
  drawer.classList.remove('open');
  overlay.classList.remove('visible');
  document.body.style.overflow = '';
}

// ===================== SUCCESS MODAL =====================
function openModal() {
  const modal = document.getElementById('success-modal');
  if (!modal) return;
  modal.classList.add('visible');
  document.body.style.overflow = 'hidden';
  // Clear cart after successful checkout
  cart = [];
  renderCart();
  closeCart();
}

function closeModal() {
  const modal = document.getElementById('success-modal');
  if (!modal) return;
  modal.classList.remove('visible');
  document.body.style.overflow = '';
}

// ===================== MOBILE SIDEBAR =====================
function openSidebar() {
  const sidebar = document.getElementById('mobile-sidebar');
  if (!sidebar) return;
  sidebar.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  const sidebar = document.getElementById('mobile-sidebar');
  if (!sidebar) return;
  sidebar.classList.remove('open');
  document.body.style.overflow = '';
}

// ===================== EVENT LISTENERS (safe for any page) =====================
function setupEventListeners() {
  // Add to cart delegation (only if product grid exists)
  const productGrid = document.getElementById('product-grid');
  if (productGrid) {
    productGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.add-to-cart-btn');
      if (!btn) return;
      const productId = parseInt(btn.dataset.id, 10);
      addToCart(productId);
    });
  }

  // Cart quantity buttons delegation (only if cart-items exists)
  const cartItemsContainer = document.getElementById('cart-items');
  if (cartItemsContainer) {
    cartItemsContainer.addEventListener('click', (e) => {
      const decreaseBtn = e.target.closest('.qty-decrease');
      const increaseBtn = e.target.closest('.qty-increase');
      if (!decreaseBtn && !increaseBtn) return;
      const productId = parseInt(
        (decreaseBtn || increaseBtn).dataset.id,
        10
      );
      const delta = decreaseBtn ? -1 : 1;
      changeQuantity(productId, delta);
    });
  }

  // Cart toggle buttons (safe)
  const cartToggle = document.getElementById('cart-toggle');
  const cartClose = document.getElementById('cart-close');
  const cartOverlay = document.getElementById('cart-overlay');
  if (cartToggle) cartToggle.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Checkout button
  const checkoutBtn = document.getElementById('checkout-button');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
      }
      openModal();
    });
  }

  // Success modal close
  const modalClose = document.getElementById('modal-close');
  const modalBackdrop = document.getElementById('modal-backdrop');
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  // Mobile sidebar
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const sidebarClose = document.getElementById('sidebar-close');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');
  if (menuToggle) menuToggle.addEventListener('click', openSidebar);
  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

  // Smooth scroll for "Shop the Collection" CTA (only on index)
  const cta = document.getElementById('hero-cta');
  if (cta) {
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      const productsSection = document.getElementById('products');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

// ===================== INITIALIZATION =====================
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  renderProducts();        // Safe, checks for product-grid
  renderCart();            // updates badge + totals
  setupEventListeners();   // attaches only available elements
});