const { tables, findAll, findById, createRecord, updateRecord, deleteRecord } = require('./_lib/airtable');
const { requireAuth, requireAdmin } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const user = requireAuth(req, res);
    if (!user) return;

    try {
      const activas = req.query.all === 'true' ? null : `{Activo} = TRUE()`;
      const records = await findAll(tables.clases, activas);
      const clases = records.map(r => ({
        id: r.id,
        nombre: r.Nombre,
        disciplina: r.Disciplina,
        nivel: r.Nivel,
        sede: r.Sede,
        dia: r.Dia,
        hora: r.Hora,
        duracion: r.Duracion || 60,
        instructor: r.Instructor,
        cupoMaximo: r.CupoMaximo || 20,
        activo: r.Activo !== false,
      }));
      return res.status(200).json(clases);
    } catch (error) {
      console.error('Error en GET /api/clases:', error);
      return res.status(500).json({ error: 'Error al obtener clases' });
    }
  }

  if (req.method === 'POST') {
    const user = requireAdmin(req, res);
    if (!user) return;

    try {
      const d = req.body;
      const record = await createRecord(tables.clases, {
        Nombre: d.nombre,
        Disciplina: d.disciplina,
        Nivel: d.nivel,
        Sede: d.sede,
        Dia: d.dia,
        Hora: d.hora,
        Duracion: d.duracion || 60,
        Instructor: d.instructor,
        CupoMaximo: d.cupoMaximo || 20,
        Activo: d.activo !== false,
      });
      return res.status(201).json({ id: record.id, ...d });
    } catch (error) {
      console.error('Error en POST /api/clases:', error);
      return res.status(500).json({ error: 'Error al crear clase' });
    }
  }

  if (req.method === 'PUT') {
    const user = requireAdmin(req, res);
    if (!user) return;

    const { id, ...data } = req.body;
    if (!id) return res.status(400).json({ error: 'ID requerido' });

    try {
      const fields = {};
      if (data.nombre !== undefined) fields.Nombre = data.nombre;
      if (data.disciplina !== undefined) fields.Disciplina = data.disciplina;
      if (data.nivel !== undefined) fields.Nivel = data.nivel;
      if (data.sede !== undefined) fields.Sede = data.sede;
      if (data.dia !== undefined) fields.Dia = data.dia;
      if (data.hora !== undefined) fields.Hora = data.hora;
      if (data.duracion !== undefined) fields.Duracion = data.duracion;
      if (data.instructor !== undefined) fields.Instructor = data.instructor;
      if (data.cupoMaximo !== undefined) fields.CupoMaximo = data.cupoMaximo;
      if (data.activo !== undefined) fields.Activo = data.activo;

      await updateRecord(tables.clases, id, fields);
      return res.status(200).json({ id, ...data });
    } catch (error) {
      console.error('Error en PUT /api/clases:', error);
      return res.status(500).json({ error: 'Error al actualizar clase' });
    }
  }

  if (req.method === 'DELETE') {
    const user = requireAdmin(req, res);
    if (!user) return;

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID requerido' });

    try {
      await deleteRecord(tables.clases, id);
      return res.status(200).json({ id, eliminado: true });
    } catch (error) {
      console.error('Error en DELETE /api/clases:', error);
      return res.status(500).json({ error: 'Error al eliminar clase' });
    }
  }

  return res.status(405).json({ error: 'Metodo no permitido' });
};
