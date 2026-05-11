/**
 * AURA MARKET — Core App Logic
 * Router, localStorage helpers, session manager.
 * No demo data — only what the user creates.
 */
(function () {
  // ===================== STORAGE KEYS =====================
  const SELLERS_KEY = 'aura_sellers';
  const PRODUCTS_KEY = 'aura_products';
  const SESSION_KEY = 'aura_logged_in';

  // ===================== DATA HELPERS =====================
  function loadSellers() {
    const data = localStorage.getItem(SELLERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  function saveSellers(sellers) {
    localStorage.setItem(SELLERS_KEY, JSON.stringify(sellers));
  }

  function loadProducts() {
    const data = localStorage.getItem(PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  function saveProducts(products) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }

  // ===================== SESSION =====================
  function getLoggedInSellerId() {
    return sessionStorage.getItem(SESSION_KEY);
  }

  function setLoggedInSeller(sellerId) {
    sessionStorage.setItem(SESSION_KEY, sellerId);
  }

  function logoutSeller() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function isLoggedIn() {
    return !!getLoggedInSellerId();
  }

  // ===================== ROUTING =====================
  function router(section) {
    const appContent = document.getElementById('app-content');
    if (!appContent) return;

    // Clear content
    appContent.innerHTML = '';

    // Check URL params for ?shop=slug
    const urlParams = new URLSearchParams(window.location.search);
    const shopSlug = urlParams.get('shop');
    if (shopSlug) {
      if (window.renderStorePage) {
        window.renderStorePage(shopSlug);
      }
      return;
    }

    // Default section
    if (!section) section = 'marketplace';

    // Auth gate for dashboard
    if (section === 'dashboard' && !isLoggedIn()) {
      section = 'dashboard-login';
    }

    // Update active states in sidebar/desktop nav
    document.querySelectorAll('[data-section]').forEach(link => {
      link.classList.remove('active');
      if (link.dataset.section === section) link.classList.add('active');
    });

    // Render based on section
    switch (section) {
      case 'marketplace':
        if (window.renderMarketplace) window.renderMarketplace();
        else appContent.innerHTML = '<p class="text-center">Loading marketplace...</p>';
        break;
      case 'for-sellers':
        if (window.renderSellerRegistration) window.renderSellerRegistration();
        else appContent.innerHTML = '<p class="text-center">Loading registration...</p>';
        break;
      case 'dashboard-login':
        if (window.renderSellerLogin) window.renderSellerLogin();
        else appContent.innerHTML = '<p class="text-center">Loading login...</p>';
        break;
      case 'dashboard':
        if (window.renderDashboard) window.renderDashboard();
        else appContent.innerHTML = '<p class="text-center">Loading dashboard...</p>';
        break;
      case 'view-store':
        const sellers = loadSellers();
        const seller = sellers.find(s => s.id === getLoggedInSellerId());
        if (seller) {
          window.location.href = `?shop=${seller.slug}`;
        } else {
          router('marketplace');
        }
        break;
      default:
        appContent.innerHTML = '<p class="text-center">Page not found.</p>';
    }

    updateSidebarLinks();
  }

  function updateSidebarLinks() {
    const dashboardLink = document.getElementById('sidebar-dashboard-link');
    const storeLink = document.getElementById('sidebar-store-link');
    const logoutLink = document.getElementById('sidebar-logout-link');
    if (dashboardLink) dashboardLink.style.display = isLoggedIn() ? 'list-item' : 'none';
    if (storeLink) storeLink.style.display = isLoggedIn() ? 'list-item' : 'none';
    if (logoutLink) logoutLink.style.display = isLoggedIn() ? 'list-item' : 'none';
  }

  // ===================== EVENT LISTENERS =====================
  function setupGlobalListeners() {
    // Sidebar navigation links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-section]');
      if (link) {
        e.preventDefault();
        const section = link.dataset.section;
        closeSidebar();
        window.location.hash = section;
        router(section);
      }
    });

    // Logout button
    document.addEventListener('click', (e) => {
      if (e.target.id === 'logout-btn') {
        e.preventDefault();
        logoutSeller();
        closeSidebar();
        router('marketplace');
      }
    });

    // Home logo click
    const homeLink = document.getElementById('home-link');
    if (homeLink) {
      homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = 'marketplace';
        router('marketplace');
      });
    }

    // Mobile sidebar toggle
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');

    if (menuToggle) menuToggle.addEventListener('click', openSidebar);
    if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
    if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

    // Handle back/forward browser buttons
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      router(hash || 'marketplace');
    });
  }

  function openSidebar() {
    const sidebar = document.getElementById('mobile-sidebar');
    if (sidebar) {
      sidebar.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeSidebar() {
    const sidebar = document.getElementById('mobile-sidebar');
    if (sidebar) {
      sidebar.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  // ===================== INITIALIZATION =====================
  document.addEventListener('DOMContentLoaded', () => {
    setupGlobalListeners();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('shop')) {
      router();
    } else {
      const hash = window.location.hash.replace('#', '');
      router(hash || 'marketplace');
    }
  });

  // Expose helpers globally for other modules
  window.AURA = {
    loadSellers,
    saveSellers,
    loadProducts,
    saveProducts,
    getLoggedInSellerId,
    setLoggedInSeller,
    logoutSeller,
    isLoggedIn,
    router,
    closeSidebar,
    showToast: function (message) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  };
})();