const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const { createRule, combineRules, evaluateRule } = require('./ast');

const app = express();
app.use(bodyParser.json());

app.post('/api/rules', (req, res) => {
  const { rule_string } = req.body;
  const ast = createRule(rule_string);

  db.run(
    'INSERT INTO rules (rule_string, ast_json) VALUES (?, ?)',
    [rule_string, JSON.stringify(ast)],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});


app.get('/api/rules', (req, res) => {
  db.all('SELECT * FROM rules', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/evaluate', (req, res) => {
  const { ast, data } = req.body;
  const result = evaluateRule(JSON.parse(ast), data);
  res.json({ result });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
