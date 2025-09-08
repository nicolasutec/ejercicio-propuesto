// app.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Descomenta si necesitas CORS (por ejemplo, desde un frontend)
// const cors = require('cors');

const app = express();
// app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ubicación estable del archivo de base de datos
const DB_PATH = path.join(__dirname, 'students.sqlite');

function dbConnection() {
  // Si no existe, sqlite la crea. Si falla, lanzará error al abrir.
  return new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error abriendo DB:', err.message);
    }
  });
}

// Helper para validar payload
function validateStudentPayload(body) {
  const errors = [];
  if (!body || typeof body !== 'object') {
    errors.push('Body inválido');
    return errors;
  }
  const { firstname, lastname, gender } = body;
  if (!firstname) errors.push('firstname es obligatorio');
  if (!lastname) errors.push('lastname es obligatorio');
  if (!gender) errors.push('gender es obligatorio');
  return errors;
}

// GET/POST /students
app.route('/students')
  .get((req, res) => {
    const db = dbConnection();
    db.all('SELECT id, firstname, lastname, gender, age FROM students', [], (err, rows) => {
      db.close();
      if (err) return res.status(500).json({ error: err.message });
      return res.json(rows ?? []);
    });
  })
  .post((req, res) => {
    const errors = validateStudentPayload(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });

    const { firstname, lastname, gender, age } = req.body;
    const db = dbConnection();
    const sql = `
      INSERT INTO students (firstname, lastname, gender, age)
      VALUES (?, ?, ?, ?)
    `;
    db.run(sql, [firstname, lastname, gender, age ?? null], function (err) {
      db.close();
      if (err) return res.status(500).json({ error: err.message });
      return res
        .status(201)
        .json({ message: `Student with id: ${this.lastID} created successfully`, id: this.lastID });
    });
  });

// GET/PUT/DELETE /student/:id
app.route('/student/:id')
  .get((req, res) => {
    const { id } = req.params;
    const db = dbConnection();
    db.get('SELECT id, firstname, lastname, gender, age FROM students WHERE id = ?', [id], (err, row) => {
      db.close();
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).send('Something went wrong');
      return res.json(row);
    });
  })
  .put((req, res) => {
    const { id } = req.params;
    const errors = validateStudentPayload(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(', ') });

    const { firstname, lastname, gender, age } = req.body;
    const db = dbConnection();
    const sql = `
      UPDATE students
      SET firstname = ?, lastname = ?, gender = ?, age = ?
      WHERE id = ?
    `;
    db.run(sql, [firstname, lastname, gender, age ?? null, id], function (err) {
      db.close();
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).send('Something went wrong');
      return res.json({ id: Number(id), firstname, lastname, gender, age: age ?? null });
    });
  })
  .delete((req, res) => {
    const { id } = req.params;
    const db = dbConnection();
    const sql = 'DELETE FROM students WHERE id = ?';
    db.run(sql, [id], function (err) {
      db.close();
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).send('Something went wrong');
      return res.status(200).send(`The Student with id: ${id} has been deleted.`);
    });
  });

// Arranque del servidor
const PORT = process.env.PORT || 8000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
