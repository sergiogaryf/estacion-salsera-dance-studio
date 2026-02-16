const bcrypt = require('bcryptjs');
const { tables, findAll } = require('./_lib/airtable');
const { signToken } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo no permitido' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contrasena son requeridos' });
  }

  try {
    const alumnos = await findAll(tables.alumnos, `{Email} = '${email.replace(/'/g, "\\'")}'`);

    if (alumnos.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const alumno = alumnos[0];

    if (!alumno.Password) {
      return res.status(401).json({ error: 'Cuenta sin contrasena configurada. Contacta al administrador.' });
    }

    const valid = await bcrypt.compare(password, alumno.Password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    if (alumno.Activo === false) {
      return res.status(403).json({ error: 'Tu cuenta esta deshabilitada. Contacta al administrador.' });
    }

    const tokenPayload = {
      id: alumno.id,
      email: alumno.Email,
      nombre: alumno.Nombre,
      role: alumno.Role || 'alumno',
    };

    const token = signToken(tokenPayload);

    const user = {
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
    };

    return res.status(200).json({ token, user });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
