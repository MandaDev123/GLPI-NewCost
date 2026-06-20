const express = require('express')
const cors = require('cors')
const Database = require('better-sqlite3')

const app = express()
app.use(cors())
app.use(express.json())

const db = new Database('settings.db')

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS colors (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS translations (
    lang TEXT,
    key TEXT,
    value TEXT,
    PRIMARY KEY (lang, key)
  );
  
  CREATE TABLE IF NOT EXISTS supercost (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idticket TEXT,
    cost DOUBLE
  );

CREATE TABLE IF NOT EXISTS coutReouverture (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idticket TEXT,
  pourcentage DOUBLE
);

  
`)

// Default colors
const colorCount = db.prepare('SELECT COUNT(*) as c FROM colors').get()
if (colorCount.c === 0) {
  const insert = db.prepare('INSERT INTO colors VALUES (?, ?)')
  insert.run('color_nouveau',    '#dbeafe')
  insert.run('color_inprogress', '#fef9c3')
  insert.run('color_termine',    '#dcfce7')
}

// Default translations
const transCount = db.prepare('SELECT COUNT(*) as c FROM translations').get()
if (transCount.c === 0) {
  const insert = db.prepare('INSERT INTO translations VALUES (?, ?, ?)')
  // Malagasy
  insert.run('mg', 'label_nouveau',    'Vaovao')
  insert.run('mg', 'label_inprogress', 'Efa manao')
  insert.run('mg', 'label_termine',    'Vita')
  // French
  insert.run('fr', 'label_nouveau',    'Nouveau')
  insert.run('fr', 'label_inprogress', 'In progress')
  insert.run('fr', 'label_termine',    'Terminé')
}

// GET colors
app.get('/colors', (req, res) => {
  const rows = db.prepare('SELECT * FROM colors').all()
  const result = {}
  rows.forEach(r => result[r.key] = r.value)
  res.json(result)
})

// PUT update a color
app.put('/colors/:key', (req, res) => {
  const { key } = req.params
  const { value } = req.body
  db.prepare('UPDATE colors SET value = ? WHERE key = ?').run(value, key)
  res.json({ success: true })
})

// GET all available language codes
app.get('/translations', (req, res) => {
  const rows = db.prepare('SELECT DISTINCT lang FROM translations').all()
  res.json(rows.map(r => r.lang))
})

// GET translations for a language
app.get('/translations/:lang', (req, res) => {
  const rows = db.prepare('SELECT * FROM translations WHERE lang = ?').all(req.params.lang)
  const result = {}
  rows.forEach(r => result[r.key] = r.value)
  res.json(result)
})

// PUT update a translation
app.put('/translations/:lang/:key', (req, res) => {
  const { lang, key } = req.params
  const { value } = req.body
  db.prepare('UPDATE translations SET value = ? WHERE lang = ? AND key = ?').run(value, lang, key)
  res.json({ success: true })
})

// POST add a new language
app.post('/translations/:lang', (req, res) => {
  const { lang } = req.params
  const { labels } = req.body // { label_nouveau: '...', label_inprogress: '...', label_termine: '...' }
  const insert = db.prepare('INSERT INTO translations VALUES (?, ?, ?)')
  Object.entries(labels).forEach(([key, value]) => insert.run(lang, key, value))
  res.json({ success: true })
})

app.post('/supercost/:ticket', (req, res) => {

    const {ticket} = req.params
    const {cost} = req.body
    const insert = db.prepare('INSERT INTO  supercost (idticket,cost) VALUES (?, ?)')

    insert.run(ticket,cost)
    res.json({ success: true })

})

app.get('/supercost', (req, res) => {
  const rows = db.prepare('SELECT idticket, SUM(cost) as total FROM supercost GROUP BY idticket').all()
  const result = {}
  rows.forEach(r => result[r.idticket] = r.total)
  res.json(result)
})

app.get('/supercost/:ticket', (req, res) => {
  const rows = db.prepare('SELECT * FROM supercost  WHERE  idticket = ?').all(req.params.ticket)
  const result = {}
  rows.forEach(r => result[r.idticket] = r.cost)
  res.json(result)
})

app.get('/supercost/Last/:idticket', (req,res) => {
  const { idticket } = req.params;

  const stmt = db.prepare(`
    SELECT * FROM supercost
    WHERE id = (
      SELECT MAX(id) FROM supercost WHERE idticket = ?
    )
  `);
  const fafao = stmt.get(idticket);

  res.json({ success: true, data: fafao || null });

})

app.get('/supercost/First/:idticket', (req,res) => {
  const { idticket } = req.params;

  const stmt = db.prepare(`
    SELECT * FROM supercost
    WHERE id = (
      SELECT MIN(id) FROM supercost WHERE idticket = ?
    )
  `);
  const fafao = stmt.get(idticket);

  res.json({ success: true, data: fafao || null });

})

app.get('/supercost/Somme/:idticket', (req,res) => {
  const { idticket } = req.params;

  const stmt = db.prepare(`
    SELECT SUM(cost) as somme FROM supercost
    WHERE idticket = ?
  `);
  const fafao = stmt.get(idticket);

  res.json({ success: true, data: fafao || null });

})

app.get('/supercost/count/:idticket', (req,res) => {
  const { idticket } = req.params;

  const stmt = db.prepare(`
    SELECT count(cost) as count FROM supercost
    WHERE idticket = ?
  `);
  const fafao = stmt.get(idticket);

  res.json({ success: true, data: fafao || null });

})



app.delete('/supercost/delete/:idticket', (req,res) => {
  
    const {idticket} = req.params
  const fafao = db.prepare(`DELETE FROM supercost 
WHERE id = (
  SELECT MAX(id) FROM supercost WHERE idticket = ?
)
AND idticket = ?`)

  fafao.run(idticket,idticket)

  res.json({success:true})

})

app.post('/coutReouverture/:ticket', (req, res) => {

    const {ticket} = req.params
    const {pourcentage} = req.body
    const insert = db.prepare('INSERT INTO coutReouverture(idticket,pourcentage) VALUES (?, ?)')

    insert.run(ticket,pourcentage)
    res.json({ success: true })

})

app.get('/coutReouverture/:ticket', (req, res) => {
  const rows = db.prepare('SELECT * FROM coutReouverture WHERE  idticket = ?').all(req.params.ticket)
  const result = {}
  rows.forEach(r => result[r.idticket] = r.pourcentage)
  res.json(result)
})

app.get('/coutReouverture', (req, res) => {
  const rows = db.prepare('SELECT idticket, SUM(pourcentage) as total FROM coutReouverture GROUP BY idticket').all()
  const result = {}
  rows.forEach(r => result[r.idticket] = r.total)
  res.json(result)
})


app.listen(3001, () => console.log('Server running on http://localhost:3001'))