const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use(express.static(path.join(__dirname, 'public')));

const PUZZLES_FILE = path.join(__dirname, 'data', 'puzzles.json');
const PLAYERS_FILE = path.join(__dirname, 'data', 'players.json');

function readJSON(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// --- PUZZLES ---
app.get('/api/puzzles', (req, res) => res.json(readJSON(PUZZLES_FILE)));

app.post('/api/puzzles', (req, res) => {
  const data = readJSON(PUZZLES_FILE);
  const puzzle = { id: Date.now(), ...req.body };
  data.push(puzzle);
  writeJSON(PUZZLES_FILE, data);
  res.json(puzzle);
});

app.put('/api/puzzles/:id', (req, res) => {
  let data = readJSON(PUZZLES_FILE);
  const idx = data.findIndex(p => String(p.id) === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data[idx] = { ...data[idx], ...req.body };
  writeJSON(PUZZLES_FILE, data);
  res.json(data[idx]);
});

app.delete('/api/puzzles/:id', (req, res) => {
  let data = readJSON(PUZZLES_FILE);
  data = data.filter(p => String(p.id) !== req.params.id);
  writeJSON(PUZZLES_FILE, data);
  res.json({ ok: true });
});

// --- PLAYERS (for autocomplete) ---
app.get('/api/players', (req, res) => res.json(readJSON(PLAYERS_FILE)));

app.post('/api/players', (req, res) => {
  const data = readJSON(PLAYERS_FILE);
  const { name } = req.body;
  if (!name || data.includes(name)) return res.json(data);
  data.push(name);
  data.sort();
  writeJSON(PLAYERS_FILE, data);
  res.json(data);
});

app.delete('/api/players/:name', (req, res) => {
  let data = readJSON(PLAYERS_FILE);
  data = data.filter(p => p !== decodeURIComponent(req.params.name));
  writeJSON(PLAYERS_FILE, data);
  res.json(data);
});

app.listen(3000, () => console.log('✅  Football Guesser running at http://localhost:3000'));
