const { tables, updateRecord } = require('./_lib/airtable');
const { requireAuth } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo no permitido' });
  }

  const user = requireAuth(req, res);
  if (!user) return;

  const { userId, fotoBase64 } = req.body;
  if (!userId || !fotoBase64) {
    return res.status(400).json({ error: 'Datos requeridos' });
  }

  // Solo puede actualizar su propia foto; admin puede actualizar cualquiera
  if (user.role !== 'admin' && user.id !== userId) {
    return res.status(403).json({ error: 'Solo puedes actualizar tu propia foto' });
  }

  // Validar formato
  if (!fotoBase64.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Formato de imagen invalido' });
  }

  // Limite ~200KB base64 (cubre 300x300 JPEG con margen)
  if (fotoBase64.length > 280000) {
    return res.status(400).json({ error: 'Imagen demasiado grande. Intenta de nuevo.' });
  }

  try {
    await updateRecord(tables.alumnos, userId, { FotoUrl: fotoBase64 });
    return res.status(200).json({ fotoUrl: fotoBase64 });
  } catch (e) {
    console.error('Error guardando foto:', e);
    return res.status(500).json({ error: 'Error al guardar la foto' });
  }
};

module.exports.config = {
  api: { bodyParser: { sizeLimit: '500kb' } },
};
