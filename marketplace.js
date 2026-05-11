/**
 * marketplace.js
 * Renders the product grid for all sellers with a real-time search bar.
 * Uses window.AURA to read products / sellers and the contact modal.
 */
(function () {
  // Make renderMarketplace globally available for the router
  window.renderMarketplace = function () {
    const appContent = document.getElementById('app-content');
    if (!appContent) return;

    const products = window.AURA.loadProducts();
    const sellers = window.AURA.loadSellers();

    // Build the UI
    appContent.innerHTML = `
      <div class="section-title">Marketplace</div>
      <div class="search-bar">
        <input type="text" id="marketplace-search" placeholder="Search products or stores..." />
      </div>
      <div id="marketplace-grid" class="marketplace-grid">
        <!-- product cards injected here -->
      </div>
    `;

    function renderGrid(filterText = '') {
      const grid = document.getElementById('marketplace-grid');
      if (!grid) return;

      const term = filterText.toLowerCase().trim();

      // Filter products by name or store name
      const filtered = products.filter(product => {
        if (!term) return true;
        const seller = sellers.find(s => s.id === product.sellerId);
        const storeName = seller ? seller.storeName.toLowerCase() : '';
        return (
          product.name.toLowerCase().includes(term) ||
          storeName.includes(term)
        );
      });

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div style="grid-column:1/-1; text-align:center; padding:3rem; color:#888;">
            <p>No products found.</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = filtered.map(product => {
        const seller = sellers.find(s => s.id === product.sellerId);
        const storeName = seller ? seller.storeName : 'Unknown Store';
        const storeSlug = seller ? seller.slug : '';

        return `
          <div class="product-card marketplace-card">
            <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy" 
                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23111%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23888%22 font-size=%2216%22 font-family=%22sans-serif%22>No Image</text></svg>'">
            <div class="product-card-body">
              <h3>${escapeHTML(product.name)}</h3>
              <p class="store-name">${escapeHTML(storeName)}</p>
              <p class="price">${formatCurrency(product.price)}</p>
              <button class="contact-seller-btn" data-seller-id="${product.sellerId}" data-product-name="${escapeHTML(product.name)}" data-product-image="${escapeHTML(product.image)}">
                Contact Seller
              </button>
            </div>
          </div>
        `;
      }).join('');

      // Attach contact button listeners
      grid.querySelectorAll('.contact-seller-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const sellerId = btn.dataset.sellerId;
          const productName = btn.dataset.productName;
          const productImage = btn.dataset.productImage;
          openContactModal(sellerId, productName, productImage);
        });
      });
    }

    // Initial render
    renderGrid();

    // Search listener
    const searchInput = document.getElementById('marketplace-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderGrid(e.target.value);
      });
    }
  };

  // Helper: open contact modal (defined in contact.js, but call it safely)
  function openContactModal(sellerId, productName, productImage) {
    if (window.openContactModal) {
      window.openContactModal(sellerId, productName, productImage);
    } else {
      alert('Contact modal not available.');
    }
  }

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