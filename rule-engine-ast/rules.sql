CREATE TABLE IF NOT EXISTS rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_string TEXT NOT NULL,
  ast_json TEXT NOT NULL
);

INSERT INTO rules (rule_string, ast_json) VALUES
("(age > 30 AND department = 'Sales') OR (age < 25 AND department = 'Marketing')", '{}');
