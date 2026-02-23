/* ============================================
   ESTACION SALSERA - Panel Profesor JS
   ============================================ */

let profUser = null;

// ---- FOTO PROFESOR ----
function setupProfFoto() {
  const input = document.getElementById('profFotoInput');
  if (!input) return;
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await comprimirFotoProf(file);
      const result = await ApiService.uploadFoto(profUser.id, base64);
      profUser.fotoUrl = result.fotoUrl;
      const fotoImg = document.getElementById('profFotoImg');
      const avatarEl = document.getElementById('profAvatar');
      if (fotoImg) { fotoImg.src = base64; fotoImg.style.display = ''; }
      if (avatarEl) avatarEl.style.display = 'none';
      showToastProf('Foto actualizada', 'success');
    } catch (err) {
      showToastProf('Error al subir la foto: ' + (err.message || 'Intenta de nuevo'), 'error');
    }
    input.value = '';
  });
}

function comprimirFotoProf(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 250;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        const webp = canvas.toDataURL('image/webp', 0.82);
        resolve(webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function showToastProf(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
