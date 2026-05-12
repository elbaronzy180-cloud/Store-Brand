/**
 * sellers.js
 * Seller registration, login, and dashboard (3 tabs: Add Product, My Products, Store Settings).
 */
(function () {
  // ===================== REGISTRATION =====================
  window.renderSellerRegistration = function () {
    const appContent = document.getElementById('app-content');
    if (!appContent) return;

    appContent.innerHTML = `
      <div class="section-title">Become a Seller</div>
      <div class="form-container">
        <p class="text-center mb-2" style="color:#aaa;">Open your free storefront on AURA Market.</p>
        <form id="seller-registration-form" novalidate>
          <div class="form-group">
            <label for="reg-store-name">Store Name</label>
            <input type="text" id="reg-store-name" placeholder="e.g. Urban Threads" required />
            <span class="inline-error" id="reg-name-error">Store name is required.</span>
          </div>
          <div class="form-group">
            <label for="reg-slug">Store URL Slug</label>
            <input type="text" id="reg-slug" placeholder="urban-threads" required />
            <span class="inline-error" id="reg-slug-error">Slug must be unique, lowercase, hyphens only.</span>
            <small style="color:#888;">Your store will be at <code>?shop=your-slug</code></small>
          </div>
          <div class="form-group">
            <label for="reg-logo">Logo URL (optional)</label>
            <input type="text" id="reg-logo" placeholder="https://example.com/logo.png" />
          </div>
          <div class="form-group">
            <label for="reg-phone">Phone Number</label>
            <input type="text" id="reg-phone" placeholder="+1234567890" required />
            <span class="inline-error" id="reg-phone-error">Phone number is required.</span>
          </div>
          <div class="form-group">
            <label for="reg-email">Email Address</label>
            <input type="email" id="reg-email" placeholder="seller@example.com" required />
            <span class="inline-error" id="reg-email-error">A valid email is required.</span>
          </div>
          <div class="form-group">
            <label for="reg-whatsapp">WhatsApp Number (optional)</label>
            <input type="text" id="reg-whatsapp" placeholder="+1234567890" />
          </div>
          <div class="form-group">
            <label for="reg-passkey">Passkey (4–8 characters)</label>
            <input type="password" id="reg-passkey" minlength="4" maxlength="8" placeholder="Enter a passkey" required />
            <span class="inline-error" id="reg-passkey-error">Passkey must be 4–8 characters.</span>
          </div>
          <button type="submit" class="btn-primary" style="width:100%;">Create My Store</button>
        </form>
        <p class="text-center mt-2" style="color:#aaa;">
          Already have a store? <a href="#" data-section="dashboard-login">Log in here</a>.
        </p>
      </div>
    `;

    const storeNameInput = document.getElementById('reg-store-name');
    const slugInput = document.getElementById('reg-slug');
    storeNameInput.addEventListener('input', () => {
      if (!slugInput.dataset.manuallyChanged) {
        slugInput.value = storeNameInput.value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
      }
    });
    slugInput.addEventListener('input', () => {
      slugInput.dataset.manuallyChanged = 'true';
    });

    const form = document.getElementById('seller-registration-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      document.querySelectorAll('.inline-error').forEach(el => el.style.display = 'none');
      let valid = true;

      const storeName = storeNameInput.value.trim();
      const slug = slugInput.value.trim();
      const logo = document.getElementById('reg-logo').value.trim();
      const phone = document.getElementById('reg-phone').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const whatsapp = document.getElementById('reg-whatsapp').value.trim();
      const passkey = document.getElementById('reg-passkey').value;

      if (!storeName) {
        document.getElementById('reg-name-error').style.display = 'block';
        valid = false;
      }
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slug || !slugRegex.test(slug)) {
        document.getElementById('reg-slug-error').textContent = 'Slug must be lowercase letters, numbers, and hyphens only.';
        document.getElementById('reg-slug-error').style.display = 'block';
        valid = false;
      } else {
        const sellers = window.AURA.loadSellers();
        if (sellers.some(s => s.slug === slug)) {
          document.getElementById('reg-slug-error').textContent = 'This slug is already taken. Please choose another.';
          document.getElementById('reg-slug-error').style.display = 'block';
          valid = false;
        }
      }
      if (!phone) {
        document.getElementById('reg-phone-error').style.display = 'block';
        valid = false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        document.getElementById('reg-email-error').style.display = 'block';
        valid = false;
      }
      if (passkey.length < 4 || passkey.length > 8) {
        document.getElementById('reg-passkey-error').style.display = 'block';
        valid = false;
      }

      if (!valid) return;

      const newSeller = {
        id: 'seller_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        storeName,
        slug,
        logo,
        phone,
        email,
        whatsapp: whatsapp || phone,
        passkey
      };

      const sellers = window.AURA.loadSellers();
      sellers.push(newSeller);
      window.AURA.saveSellers(sellers);

      window.AURA.setLoggedInSeller(newSeller.id);
      window.AURA.showToast('Store created! Welcome to your dashboard.');
      window.AURA.router('dashboard');
    });

    const loginLink = appContent.querySelector('[data-section="dashboard-login"]');
    if (loginLink) {
      loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.AURA.router('dashboard-login');
      });
    }
  };

  // ===================== LOGIN =====================
  window.renderSellerLogin = function () {
    const appContent = document.getElementById('app-content');
    if (!appContent) return;

    appContent.innerHTML = `
      <div class="section-title">Seller Login</div>
      <div class="form-container">
        <form id="seller-login-form" novalidate>
          <div class="form-group">
            <label for="login-slug">Store Slug</label>
            <input type="text" id="login-slug" placeholder="your-store-slug" required />
            <span class="inline-error" id="login-error" style="color:#ff4d4d;">Wrong store slug or passkey.</span>
          </div>
          <div class="form-group">
            <label for="login-passkey">Passkey</label>
            <input type="password" id="login-passkey" placeholder="Your passkey" required />
          </div>
          <button type="submit" class="btn-primary" style="width:100%;">Log In</button>
        </form>
        <p class="text-center mt-2" style="color:#aaa;">
          No store yet? <a href="#" data-section="for-sellers">Create one here</a>.
        </p>
      </div>
    `;

    document.getElementById('seller-login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const slug = document.getElementById('login-slug').value.trim();
      const passkey = document.getElementById('login-passkey').value;
      const errorEl = document.getElementById('login-error');
      errorEl.style.display = 'none';

      const sellers = window.AURA.loadSellers();
      const seller = sellers.find(s => s.slug === slug && s.passkey === passkey);
      if (seller) {
        window.AURA.setLoggedInSeller(seller.id);
        window.AURA.showToast('Logged in successfully!');
        window.AURA.router('dashboard');
      } else {
        errorEl.style.display = 'block';
      }
    });

    const registerLink = appContent.querySelector('[data-section="for-sellers"]');
    if (registerLink) {
      registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.AURA.router('for-sellers');
      });
    }
  };

  // ===================== DASHBOARD =====================
  window.renderDashboard = function () {
    const sellerId = window.AURA.getLoggedInSellerId();
    if (!sellerId) {
      window.AURA.router('dashboard-login');
      return;
    }
    const sellers = window.AURA.loadSellers();
    const seller = sellers.find(s => s.id === sellerId);
    if (!seller) {
      window.AURA.logoutSeller();
      window.AURA.router('marketplace');
      return;
    }
    const appContent = document.getElementById('app-content');
    if (!appContent) return;

    const allProducts = window.AURA.loadProducts();
    const myProducts = allProducts.filter(p => p.sellerId === sellerId);

    let activeTab = 'add';

    function renderDashboardUI() {
      appContent.innerHTML = `
        <div class="dashboard-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
          <div>
            <h2 style="font-size:1.8rem; font-weight:700;">Welcome, ${escapeHTML(seller.storeName)}</h2>
            <a href="?shop=${seller.slug}" target="_blank" style="color:#fff; text-decoration:underline; font-size:0.9rem;">View My Store →</a>
          </div>
        </div>
        <div class="dashboard-tabs">
          <button class="dashboard-tab ${activeTab === 'add' ? 'active' : ''}" data-tab="add">Add Product</button>
          <button class="dashboard-tab ${activeTab === 'products' ? 'active' : ''}" data-tab="products">My Products</button>
          <button class="dashboard-tab ${activeTab === 'settings' ? 'active' : ''}" data-tab="settings">Store Settings</button>
        </div>
        <div id="dashboard-content-panel"></div>
      `;

      document.querySelectorAll('.dashboard-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
          activeTab = e.target.dataset.tab;
          renderDashboardUI();
        });
      });

      const panel = document.getElementById('dashboard-content-panel');
      switch (activeTab) {
        case 'add':
          panel.innerHTML = renderAddProductForm();
          setupAddProduct();
          break;
        case 'products':
          panel.innerHTML = renderMyProductsList(myProducts);
          setupMyProducts();
          break;
        case 'settings':
          panel.innerHTML = renderStoreSettings(seller);
          setupStoreSettings(seller);
          break;
      }
    }

    function escapeHTML(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    // --- Add Product form ---
    function renderAddProductForm() {
      return `
        <h3 style="margin-bottom:1rem; font-size:1.3rem;">Add New Product</h3>
        <form id="add-product-form" novalidate>
          <div class="form-group">
            <label>Product Name</label>
            <input type="text" id="prod-name" required />
            <span class="inline-error" id="add-name-error">Required</span>
          </div>
          <div class="form-group">
            <label>Price</label>
            <input type="number" id="prod-price" min="0" step="0.01" required />
            <span class="inline-error" id="add-price-error">Enter a valid price</span>
          </div>
          <div class="form-group">
            <label>Product Image</label>
            <div class="image-upload-area" id="image-upload-area">
              <img id="upload-preview" class="preview" alt="Preview" />
              <p id="upload-placeholder">Click to upload or take a photo</p>
              <small>or paste an image URL below</small>
            </div>
            <input type="file" id="prod-image-file" accept="image/*" capture="environment" style="display:none;" />
            <input type="text" id="prod-image-url" placeholder="https://example.com/image.jpg" />
            <span class="inline-error" id="add-image-error">Either upload an image or provide a URL</span>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea id="prod-desc" rows="3" required></textarea>
            <span class="inline-error" id="add-desc-error">Required</span>
          </div>
          <button type="submit" class="btn-primary">Add Product</button>
        </form>
      `;
    }

    function setupAddProduct() {
      const uploadArea = document.getElementById('image-upload-area');
      const fileInput = document.getElementById('prod-image-file');
      const preview = document.getElementById('upload-preview');
      const placeholder = document.getElementById('upload-placeholder');
      const urlInput = document.getElementById('prod-image-url');

      let uploadedDataUrl = null;

      if (uploadArea) uploadArea.addEventListener('click', () => fileInput.click());

      if (fileInput) {
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
              const maxWidth = 800;
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              uploadedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
              preview.src = uploadedDataUrl;
              preview.classList.add('visible');
              placeholder.style.display = 'none';
              urlInput.value = '';
            };
            img.src = ev.target.result;
          };
          reader.readAsDataURL(file);
        });
      }

      if (urlInput) {
        urlInput.addEventListener('input', () => {
          if (urlInput.value.trim()) {
            uploadedDataUrl = null;
            preview.classList.remove('visible');
            placeholder.style.display = 'block';
            fileInput.value = '';
          }
        });
      }

      const form = document.getElementById('add-product-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = document.getElementById('prod-name').value.trim();
          const price = parseFloat(document.getElementById('prod-price').value);
          const url = urlInput.value.trim();
          const desc = document.getElementById('prod-desc').value.trim();

          let valid = true;
          document.querySelectorAll('#add-product-form .inline-error').forEach(el => el.style.display = 'none');
          if (!name) { document.getElementById('add-name-error').style.display = 'block'; valid = false; }
          if (isNaN(price) || price < 0) { document.getElementById('add-price-error').style.display = 'block'; valid = false; }
          if (!uploadedDataUrl && !url) {
            document.getElementById('add-image-error').style.display = 'block';
            valid = false;
          }
          if (!desc) { document.getElementById('add-desc-error').style.display = 'block'; valid = false; }

          if (!valid) return;

          const image = uploadedDataUrl || url;

          const newProduct = {
            id: 'prod_' + Date.now(),
            sellerId: sellerId,
            name,
            price,
            image,
            description: desc
          };

          const allProds = window.AURA.loadProducts();
          allProds.push(newProduct);
          window.AURA.saveProducts(allProds);
          window.AURA.showToast('Product added! ✓');
          e.target.reset();
          preview.classList.remove('visible');
          placeholder.style.display = 'block';
          uploadedDataUrl = null;
        });
      }
    }

    // --- My Products list ---
    function renderMyProductsList(products) {
      if (products.length === 0) {
        return `<div style="text-align:center; padding:2rem; color:#888;">You haven't listed any products yet. Go to Add Product to get started!</div>`;
      }
      return `
        <h3 style="margin-bottom:1rem;">Your Products (${products.length})</h3>
        <div id="product-list-container">
          ${products.map(p => `
            <div class="product-list-item" data-product-id="${p.id}">
              <img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" onerror="this.style.display='none'">
              <div class="details">
                <strong>${escapeHTML(p.name)}</strong><br>
                <span style="color:#fff;">${formatCurrency(p.price)}</span> – 
                <small style="color:#aaa;">${escapeHTML(p.description.substring(0,60))}…</small>
              </div>
              <div class="actions">
                <button class="edit-product-btn" data-product-id="${p.id}" style="background:transparent; border:1px solid #fff; color:#fff; padding:0.4rem 0.8rem; border-radius:0.5rem; cursor:pointer;">Edit</button>
                <button class="delete-product-btn" data-product-id="${p.id}" style="background:transparent; border:1px solid #ff4d4d; color:#ff4d4d; padding:0.4rem 0.8rem; border-radius:0.5rem; cursor:pointer;">Delete</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    function setupMyProducts() {
      document.querySelectorAll('.delete-product-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          if (confirm('Are you sure you want to delete this product?')) {
            const productId = btn.dataset.productId;
            let allProds = window.AURA.loadProducts();
            allProds = allProds.filter(p => p.id !== productId);
            window.AURA.saveProducts(allProds);
            window.AURA.showToast('Product deleted.');
            window.renderDashboard();
          }
        });
      });

      document.querySelectorAll('.edit-product-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const productId = btn.dataset.productId;
          const allProds = window.AURA.loadProducts();
          const product = allProds.find(p => p.id === productId);
          if (!product) return;
          const listItem = btn.closest('.product-list-item');
          listItem.innerHTML = `
            <form class="edit-product-form" data-product-id="${productId}" style="display:flex; gap:1rem; width:100%; align-items:center;">
              <img src="${escapeHTML(product.image)}" alt="" style="width:60px; height:60px; border-radius:0.5rem; object-fit:cover;">
              <div style="flex:1; display:flex; flex-direction:column; gap:0.3rem;">
                <input type="text" name="edit-name" value="${escapeHTML(product.name)}" required>
                <input type="number" name="edit-price" value="${product.price}" step="0.01" min="0" required>
                <input type="text" name="edit-image" value="${escapeHTML(product.image)}" required>
                <textarea name="edit-desc" rows="2" required>${escapeHTML(product.description)}</textarea>
              </div>
              <div style="display:flex; gap:0.5rem;">
                <button type="submit" class="btn-primary" style="padding:0.5rem 1rem;">Save</button>
                <button type="button" class="cancel-edit-btn" style="background:transparent; border:1px solid #fff; color:#fff; padding:0.5rem 1rem; border-radius:0.5rem;">Cancel</button>
              </div>
            </form>
          `;

          listItem.querySelector('.cancel-edit-btn').addEventListener('click', () => {
            window.renderDashboard();
          });

          listItem.querySelector('.edit-product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const newName = e.target['edit-name'].value.trim();
            const newPrice = parseFloat(e.target['edit-price'].value);
            const newImage = e.target['edit-image'].value.trim();
            const newDesc = e.target['edit-desc'].value.trim();
            if (!newName || isNaN(newPrice) || !newImage || !newDesc) {
              window.AURA.showToast('Please fill all fields correctly.');
              return;
            }
            let allProds = window.AURA.loadProducts();
            const prodIndex = allProds.findIndex(p => p.id === productId);
            if (prodIndex !== -1) {
              allProds[prodIndex] = { ...allProds[prodIndex], name: newName, price: newPrice, image: newImage, description: newDesc };
              window.AURA.saveProducts(allProds);
              window.AURA.showToast('Product updated!');
              window.renderDashboard();
            }
          });
        });
      });
    }

    // --- Store Settings ---
    function renderStoreSettings(seller) {
      return `
        <h3 style="margin-bottom:1rem;">Store Settings</h3>
        <form id="settings-form">
          <div class="form-group">
            <label>Store Name</label>
            <input type="text" value="${escapeHTML(seller.storeName)}" readonly style="background:#222; opacity:0.7;">
            <small style="color:#888;">Cannot be changed after creation.</small>
          </div>
          <div class="form-group">
            <label>Store Slug</label>
            <input type="text" value="${escapeHTML(seller.slug)}" readonly style="background:#222; opacity:0.7;">
          </div>
          <div class="form-group">
            <label>Logo URL</label>
            <input type="text" id="settings-logo" value="${escapeHTML(seller.logo || '')}">
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="text" id="settings-phone" value="${escapeHTML(seller.phone || '')}">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="settings-email" value="${escapeHTML(seller.email || '')}">
          </div>
          <div class="form-group">
            <label>WhatsApp</label>
            <input type="text" id="settings-whatsapp" value="${escapeHTML(seller.whatsapp || '')}">
          </div>
          <div class="form-group">
            <label>Passkey</label>
            <input type="text" id="settings-passkey" value="${seller.passkey}">
          </div>
          <button type="submit" class="btn-primary">Save Settings</button>
        </form>
        <div style="margin-top:2rem; border-top:1px solid #333; padding-top:1rem;">
          <button id="delete-store-btn" class="btn-danger">Delete My Store</button>
        </div>
      `;
    }

    function setupStoreSettings(seller) {
      document.getElementById('settings-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const logo = document.getElementById('settings-logo').value.trim();
        const phone = document.getElementById('settings-phone').value.trim();
        const email = document.getElementById('settings-email').value.trim();
        const whatsapp = document.getElementById('settings-whatsapp').value.trim();
        const passkey = document.getElementById('settings-passkey').value;

        if (passkey.length < 4 || passkey.length > 8) {
          window.AURA.showToast('Passkey must be 4-8 characters.');
          return;
        }

        let sellers = window.AURA.loadSellers();
        const index = sellers.findIndex(s => s.id === seller.id);
        if (index !== -1) {
          sellers[index].logo = logo;
          sellers[index].phone = phone;
          sellers[index].email = email;
          sellers[index].whatsapp = whatsapp || phone;
          sellers[index].passkey = passkey;
          window.AURA.saveSellers(sellers);
          window.AURA.showToast('Settings saved! ✓');
        }
      });

      document.getElementById('delete-store-btn').addEventListener('click', () => {
        const input = prompt("Type DELETE to confirm deletion of your store and all products.");
        if (input === 'DELETE') {
          let sellers = window.AURA.loadSellers();
          sellers = sellers.filter(s => s.id !== seller.id);
          window.AURA.saveSellers(sellers);

          let products = window.AURA.loadProducts();
          products = products.filter(p => p.sellerId !== seller.id);
          window.AURA.saveProducts(products);

          window.AURA.logoutSeller();
          window.AURA.showToast('Store deleted.');
          window.AURA.router('marketplace');
        }
      });
    }

    function formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    }

    renderDashboardUI();
  };
})();