const { tables, findAll } = require('./_lib/airtable');
const { requireAuth } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Metodo no permitido' });
  }

  const user = requireAuth(req, res);
  if (!user) return;

  const { claseId } = req.query;
  if (!claseId) {
    return res.status(400).json({ error: 'claseId es requerido' });
  }

  try {
    const alumnos = await findAll(tables.alumnos, `FIND('${claseId.replace(/'/g, "\\'")}', {CursosInscritos})`);
    const result = alumnos.map(a => ({
      id: a.id,
      nombre: a.Nombre,
      nivel: a.Nivel,
      sede: a.Sede,
    }));
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error en /api/companeros:', error);
    return res.status(500).json({ error: 'Error al obtener companeros' });
  }
};
