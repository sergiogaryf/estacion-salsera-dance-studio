const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password) {
  console.error('Uso: node scripts/hash-password.js <contrasena>');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('Hash generado:');
console.log(hash);
