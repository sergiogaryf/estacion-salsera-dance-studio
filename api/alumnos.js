const bcrypt = require('bcryptjs');
const { tables, findAll, findById, createRecord, updateRecord, deleteRecord } = require('./_lib/airtable');
const { requireAuth, requireAdmin } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const user = requireAuth(req, res);
    if (!user) return;

    const { id } = req.query;

    try {
      if (id) {
        const alumno = await findById(tables.alumnos, id);
        return res.status(200).json({
          id: alumno.id,
          nombre: alumno.Nombre,
          email: alumno.Email,
          role: alumno.Role || 'alumno',
          sede: alumno.Sede,
          nivel: alumno.Nivel,
          telefono: alumno.Telefono,
          clasesContratadas: alumno.ClasesContratadas || 0,
          clasesAsistidas: alumno.ClasesAsistidas || 0,
          activo: alumno.Activo !== false,
          cursosInscritos: alumno.CursosInscritos ? JSON.parse(alumno.CursosInscritos) : [],
        });
      }

      // List all alumnos (admin only)
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      const filter = req.query.role ? `{Role} = '${req.query.role}'` : null;
      const records = await findAll(tables.alumnos, filter);
      const alumnos = records.map(a => ({
        id: a.id,
        nombre: a.Nombre,
        email: a.Email,
        role: a.Role || 'alumno',
        sede: a.Sede,
        nivel: a.Nivel,
        telefono: a.Telefono,
        clasesContratadas: a.ClasesContratadas || 0,
        clasesAsistidas: a.ClasesAsistidas || 0,
        activo: a.Activo !== false,
        cursosInscritos: a.CursosInscritos ? JSON.parse(a.CursosInscritos) : [],
      }));
      return res.status(200).json(alumnos);
    } catch (error) {
      console.error('Error en GET /api/alumnos:', error);
      return res.status(500).json({ error: 'Error al obtener alumnos' });
    }
  }

  if (req.method === 'POST') {
    const user = requireAdmin(req, res);
    if (!user) return;

    try {
      const d = req.body;
      const fields = {
        Nombre: d.nombre,
        Email: d.email,
        Role: d.role || 'alumno',
        Sede: d.sede,
        Nivel: d.nivel,
        Telefono: d.telefono,
        ClasesContratadas: d.clasesContratadas || 0,
        ClasesAsistidas: d.clasesAsistidas || 0,
        Activo: d.activo !== false,
        CursosInscritos: JSON.stringify(d.cursosInscritos || []),
      };

      if (d.password) {
        fields.Password = await bcrypt.hash(d.password, 10);
      }

      const record = await createRecord(tables.alumnos, fields);
      return res.status(201).json({ id: record.id, nombre: d.nombre, email: d.email });
    } catch (error) {
      console.error('Error en POST /api/alumnos:', error);
      return res.status(500).json({ error: 'Error al crear alumno' });
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
      if (data.email !== undefined) fields.Email = data.email;
      if (data.role !== undefined) fields.Role = data.role;
      if (data.sede !== undefined) fields.Sede = data.sede;
      if (data.nivel !== undefined) fields.Nivel = data.nivel;
      if (data.telefono !== undefined) fields.Telefono = data.telefono;
      if (data.clasesContratadas !== undefined) fields.ClasesContratadas = data.clasesContratadas;
      if (data.clasesAsistidas !== undefined) fields.ClasesAsistidas = data.clasesAsistidas;
      if (data.activo !== undefined) fields.Activo = data.activo;
      if (data.cursosInscritos !== undefined) fields.CursosInscritos = JSON.stringify(data.cursosInscritos);
      if (data.password) fields.Password = await bcrypt.hash(data.password, 10);

      await updateRecord(tables.alumnos, id, fields);
      return res.status(200).json({ id, ...data });
    } catch (error) {
      console.error('Error en PUT /api/alumnos:', error);
      return res.status(500).json({ error: 'Error al actualizar alumno' });
    }
  }

  if (req.method === 'DELETE') {
    const user = requireAdmin(req, res);
    if (!user) return;

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID requerido' });

    try {
      await deleteRecord(tables.alumnos, id);
      return res.status(200).json({ id, eliminado: true });
    } catch (error) {
      console.error('Error en DELETE /api/alumnos:', error);
      return res.status(500).json({ error: 'Error al eliminar alumno' });
    }
  }

  return res.status(405).json({ error: 'Metodo no permitido' });
};
