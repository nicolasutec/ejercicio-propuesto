// app.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 8000;
const HOST = '0.0.0.0';
const DB_PATH = path.resolve(__dirname, 'students.sqlite');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function openDb() {
  return new sqlite3.Database(DB_PATH);
}

app.route('/students')
  .get((_req, res) => {
    const db = openDb();
    db.all('SELECT * FROM students', [], (err, rows) => {
      db.close();
      if (err) return res.status(500).json({ error: err.message });

      const students = rows.map(r => ({
        id: r.id,
        firstname: r.firstname,
        lastname: r.lastname,
        gender: r.gender,
        age: r.age
      }));
      return res.json(students);
    });
  })
  .post((req, res) => {
    const { firstname, lastname, gender, age } = req.body || {};
    if (!firstname || !lastname || !gender) {
      return res.status(400).send('firstname, lastname y gender son obligatorios');
    }

    const db = openDb();
    const sql = `INSERT INTO students (firstname, lastname, gender, age) VALUES (?, ?, ?, ?)`;
    db.run(sql, [firstname, lastname, gender, age ?? null], function (err) {
      db.close();
      if (err) return res.status(500).send(err.message);
      return res.send(`Student with id: ${this.lastID} created successfully`);
    });
  });

app.route('/student/:id')
  .get((req, res) => {
    const { id } = req.params;
    const db = openDb();

    db.get('SELECT * FROM students WHERE id = ?', [id], (err, row) => {
      db.close();
      if (err) return res.status(500).send(err.message);
      if (!row) return res.status(404).send('Something went wrong');

      return res.status(200).json([row.id, row.firstname, row.lastname, row.gender, row.age]);
    });
  })
  .put((req, res) => {
    const { id } = req.params;
    const { firstname, lastname, gender, age } = req.body || {};
    if (!firstname || !lastname || !gender) {
      return res.status(400).send('firstname, lastname y gender son obligatorios');
    }

    const db = openDb();
    const sql = `UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?`;
    db.run(sql, [firstname, lastname, gender, age ?? null, id], function (err) {
      db.close();
      if (err) return res.status(500).send(err.message);

      const updated_student = { id: Number(id), firstname, lastname, gender, age: age ?? null };
      return res.json(updated_student);
    });
  })
  .delete((req, res) => {
    const { id } = req.params;
    const db = openDb();
    db.run('DELETE FROM students WHERE id = ?', [id], function (err) {
      db.close();
      if (err) return res.status(500).send(err.message);
      return res.status(200).send(`The Student with id: ${id} has been deleted.`);
    });
  });

app.listen(PORT, HOST, () => {
  console.log(`API escuchando en http://${HOST}:${PORT}`);
});
