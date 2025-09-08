const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'students.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error abriendo/creando DB:', err.message);
    process.exit(1);
  }
});

const sql = `
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY,
    firstname TEXT NOT NULL,
    lastname  TEXT NOT NULL,
    gender    TEXT NOT NULL,
    age       TEXT
  );
`;

db.run(sql, (err) => {
  if (err) {
    console.error('Error creando/verificando tabla:', err.message);
    process.exitCode = 1;
  } else {
    console.log('Tabla "students" lista en', DB_PATH);
  }
  db.close();
});
