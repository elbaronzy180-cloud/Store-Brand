/**
 * contact.js
 * Opens a modal with seller contact information.
 */
(function () {
  // ===================== MODAL LOGIC =====================
  window.openContactModal = function (sellerId, productName, productImage) {
    const sellers = window.AURA.loadSellers();
    const seller = sellers.find(s => s.id === sellerId);
    if (!seller) return;

    const modal = document.getElementById('contact-modal');
    const body = document.getElementById('contact-modal-body');
    if (!modal || !body) return;

    // Build modal content
    body.innerHTML = `
      ${productImage 
        ? `<img src="${escapeHTML(productImage)}" alt="${escapeHTML(productName)}" 
            style="width:100px; height:100px; border-radius:0.75rem; object-fit:cover; margin-bottom:1rem;">`
        : ''
      }
      <h3 style="font-size:1.3rem;">${escapeHTML(productName)}</h3>
      <p class="store" style="color:#aaa;">${escapeHTML(seller.storeName)}</p>
      <div class="contact-actions">
        <a href="tel:${escapeHTML(seller.phone)}">
          📞 Call ${escapeHTML(seller.phone)}
        </a>
        <a href="mailto:${escapeHTML(seller.email)}">
          📧 ${escapeHTML(seller.email)}
        </a>
        ${seller.whatsapp ? `
        <a href="https://wa.me/${seller.whatsapp.replace(/\D/g,'')}" target="_blank">
          💬 Chat on WhatsApp
        </a>` : ''}
      </div>
    `;

    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  window.closeContactModal = function () {
    const modal = document.getElementById('contact-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  // ===================== EVENT LISTENERS =====================
  document.addEventListener('click', (e) => {
    // Close modal when clicking backdrop or close button
    if (e.target.closest('.modal-backdrop') || e.target.closest('.modal-close-btn')) {
      window.closeContactModal();
    }
  });

  // ===================== HELPER =====================
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();