// ==========================================
// UI Utilities — Toast & Spinner
// ==========================================

// ---- Spinner ----
export function showSpinner() {
  document.getElementById("globalSpinner")?.classList.remove("d-none");
}

export function hideSpinner() {
  document.getElementById("globalSpinner")?.classList.add("d-none");
}

// ---- Toast ----
export function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const id = "toast-" + Date.now();
  const icons = {
    success: "bi-check-circle-fill",
    danger: "bi-x-circle-fill",
    warning: "bi-exclamation-triangle-fill",
    info: "bi-info-circle-fill",
  };

  const html = `
    <div id="${id}" class="toast align-items-center text-bg-${type} border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="bi ${icons[type] || icons.info} fs-5"></i>
          <span>${message}</span>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="إغلاق"></button>
      </div>
    </div>`;

  container.insertAdjacentHTML("beforeend", html);
  const el = document.getElementById(id);
  const toast = new bootstrap.Toast(el, { delay: 3500 });
  toast.show();
  el.addEventListener("hidden.bs.toast", () => el.remove());
}

// ---- Confirm Delete Modal ----
export function confirmDelete(onConfirm) {
  const modal = document.getElementById("deleteModal");
  if (!modal) return;
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();

  const confirmBtn = document.getElementById("confirmDeleteBtn");
  const handler = () => {
    onConfirm();
    bsModal.hide();
    confirmBtn.removeEventListener("click", handler);
  };
  confirmBtn.addEventListener("click", handler);
}

// ---- Format Price ----
export function formatPrice(price) {
  return Number(price).toLocaleString("ar-EG") + " جنيه";
}

// ---- Empty State ----
export function emptyState(container, message = "لا توجد عناصر") {
  container.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="empty-state">
        <i class="bi bi-inbox fs-1 text-muted"></i>
        <p class="mt-3 text-muted fs-5">${message}</p>
      </div>
    </div>`;
}
