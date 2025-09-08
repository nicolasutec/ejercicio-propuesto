// create_db.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('students.sqlite');
const sql_query = `CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  gender TEXT NOT NULL,
  age TEXT
)`;

db.run(sql_query, (err) => {
  if (err) {
    // Igual que el script original, fallará si la tabla ya existe
    console.error('Error creating table:', err.message);
  } else {
    console.log('Table "students" created');
  }
  db.close();
});
