const { tables, findById } = require('./_lib/airtable');
const { requireAuth } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Metodo no permitido' });
  }

  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const alumno = await findById(tables.alumnos, user.id);

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
  } catch (error) {
    console.error('Error en /api/me:', error);
    return res.status(500).json({ error: 'Error al obtener datos del usuario' });
  }
};
