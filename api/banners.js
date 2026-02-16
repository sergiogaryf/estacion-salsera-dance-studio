const { tables, findAll, createRecord, updateRecord, deleteRecord } = require('./_lib/airtable');
const { requireAuth, requireAdmin } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const activos = req.query.all === 'true' ? null : `{Activo} = TRUE()`;
      const records = await findAll(tables.banners, activos);
      const banners = records.map(r => ({
        id: r.id,
        titulo: r.Titulo,
        imagenURL: r.ImagenURL,
        enlace: r.Enlace,
        orden: r.Orden || 0,
        activo: r.Activo !== false,
        fechaInicio: r.FechaInicio,
        fechaFin: r.FechaFin,
      }));
      if (!req.query.all) {
        banners.sort((a, b) => a.orden - b.orden);
      }
      return res.status(200).json(banners);
    } catch (error) {
      console.error('Error en GET /api/banners:', error);
      return res.status(500).json({ error: 'Error al obtener banners' });
    }
  }

  if (req.method === 'POST') {
    const user = requireAdmin(req, res);
    if (!user) return;

    try {
      const d = req.body;
      const record = await createRecord(tables.banners, {
        Titulo: d.titulo,
        ImagenURL: d.imagenURL,
        Enlace: d.enlace,
        Orden: d.orden || 0,
        Activo: d.activo !== false,
        FechaInicio: d.fechaInicio || null,
        FechaFin: d.fechaFin || null,
      });
      return res.status(201).json({ id: record.id, ...d });
    } catch (error) {
      console.error('Error en POST /api/banners:', error);
      return res.status(500).json({ error: 'Error al crear banner' });
    }
  }

  if (req.method === 'PUT') {
    const user = requireAdmin(req, res);
    if (!user) return;

    const { id, ...data } = req.body;
    if (!id) return res.status(400).json({ error: 'ID requerido' });

    try {
      const fields = {};
      if (data.titulo !== undefined) fields.Titulo = data.titulo;
      if (data.imagenURL !== undefined) fields.ImagenURL = data.imagenURL;
      if (data.enlace !== undefined) fields.Enlace = data.enlace;
      if (data.orden !== undefined) fields.Orden = data.orden;
      if (data.activo !== undefined) fields.Activo = data.activo;
      if (data.fechaInicio !== undefined) fields.FechaInicio = data.fechaInicio || null;
      if (data.fechaFin !== undefined) fields.FechaFin = data.fechaFin || null;

      await updateRecord(tables.banners, id, fields);
      return res.status(200).json({ id, ...data });
    } catch (error) {
      console.error('Error en PUT /api/banners:', error);
      return res.status(500).json({ error: 'Error al actualizar banner' });
    }
  }

  if (req.method === 'DELETE') {
    const user = requireAdmin(req, res);
    if (!user) return;

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID requerido' });

    try {
      await deleteRecord(tables.banners, id);
      return res.status(200).json({ id, eliminado: true });
    } catch (error) {
      console.error('Error en DELETE /api/banners:', error);
      return res.status(500).json({ error: 'Error al eliminar banner' });
    }
  }

  return res.status(405).json({ error: 'Metodo no permitido' });
};
