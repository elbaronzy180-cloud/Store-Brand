/**
 * store.js
 * Renders a public store page using ?shop=slug from URL.
 */
(function () {
  // Called by the router when ?shop= is present
  window.renderStorePage = function (slug) {
    const appContent = document.getElementById('app-content');
    if (!appContent) return;

    const sellers = window.AURA.loadSellers();
    const seller = sellers.find(s => s.slug === slug);

    if (!seller) {
      appContent.innerHTML = `
        <div class="text-center" style="padding:4rem;">
          <h2>Store not found</h2>
          <p style="color:#aaa;">The shop you're looking for doesn't exist.</p>
          <a href="index.html" style="color:#fff; text-decoration:underline;">Back to Marketplace</a>
        </div>
      `;
      return;
    }

    const products = window.AURA.loadProducts().filter(p => p.sellerId === seller.id);

    // Build store page UI
    appContent.innerHTML = `
      <div style="text-align:center; margin-bottom:2rem;">
        <div style="margin-bottom:1rem;">
          ${seller.logo 
            ? `<img src="${escapeHTML(seller.logo)}" alt="${escapeHTML(seller.storeName)}" style="width:80px; height:80px; border-radius:50%; object-fit:cover; border:2px solid #fff;">`
            : `<div style="width:80px; height:80px; border-radius:50%; background:#fff; color:#000; display:inline-flex; align-items:center; justify-content:center; font-size:2rem; font-weight:700;">${seller.storeName.charAt(0).toUpperCase()}</div>`
          }
        </div>
        <h1 style="font-size:2.2rem; font-weight:700;">${escapeHTML(seller.storeName)}</h1>
        <div style="margin-top:1rem; display:flex; justify-content:center; gap:1.5rem; flex-wrap:wrap;">
          <a href="tel:${escapeHTML(seller.phone)}" style="color:#fff; text-decoration:none;">📞 Call</a>
          <a href="mailto:${escapeHTML(seller.email)}" style="color:#fff; text-decoration:none;">📧 Email</a>
          ${seller.whatsapp ? `<a href="https://wa.me/${seller.whatsapp.replace(/\D/g,'')}" target="_blank" style="color:#fff; text-decoration:none;">💬 WhatsApp</a>` : ''}
        </div>
      </div>

      <div id="store-product-grid" class="marketplace-grid">
        ${products.length === 0 
          ? `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:#888;">This store hasn't listed anything yet.</div>`
          : products.map(p => `
            <div class="product-card">
              <img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23111%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23888%22 font-size=%2216%22 font-family=%22sans-serif%22>No Image</text></svg>'">
              <div class="product-card-body">
                <h3>${escapeHTML(p.name)}</h3>
                <p class="price">${formatCurrency(p.price)}</p>
                <p style="color:#aaa; font-size:0.9rem; margin-bottom:0.5rem;">${escapeHTML(p.description)}</p>
                <button class="contact-seller-btn" data-seller-id="${seller.id}" data-product-name="${escapeHTML(p.name)}" data-product-image="${escapeHTML(p.image)}">
                  Contact Seller
                </button>
              </div>
            </div>
          `).join('')
        }
      </div>

      <div style="text-align:center; margin-top:2rem;">
        <a href="index.html" style="color:#fff; text-decoration:underline;">← Back to Marketplace</a>
      </div>
    `;

    // Attach contact button listeners
    document.querySelectorAll('#store-product-grid .contact-seller-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sellerId = btn.dataset.sellerId;
        const productName = btn.dataset.productName;
        const productImage = btn.dataset.productImage;
        if (window.openContactModal) {
          window.openContactModal(sellerId, productName, productImage);
        }
      });
    });
  };

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
