class Node {
    constructor(type, left = null, right = null, value = null) {
      this.type = type; 
      this.left = left;  
      this.right = right; 
      this.value = value;  
    }
  }
  
  function createRule(ruleString) {
    const operators = ['AND', 'OR'];
    const tokens = ruleString.split(' ').filter(Boolean);
  
    const buildAST = (tokens) => {
      if (tokens.length === 3) {
        const [key, operator, value] = tokens;
        return new Node('operand', null, null, { key, operator, value });
      }
  
      const operatorIndex = tokens.findIndex((token) => operators.includes(token));
      const leftTokens = tokens.slice(0, operatorIndex);
      const rightTokens = tokens.slice(operatorIndex + 1);
  
      return new Node(
        'operator',
        buildAST(leftTokens),
        buildAST(rightTokens),
        tokens[operatorIndex]
      );
    };
  
    return buildAST(tokens);
  }
  
  function combineRules(ruleASTs, operator = 'AND') {
    let combined = ruleASTs[0];
  
    for (let i = 1; i < ruleASTs.length; i++) {
      combined = new Node('operator', combined, ruleASTs[i], operator);
    }
  
    return combined;
  }
  
  function evaluateRule(node, data) {
    if (node.type === 'operand') {
      const { key, operator, value } = node.value;
      switch (operator) {
        case '>':
          return data[key] > parseFloat(value);
        case '<':
          return data[key] < parseFloat(value);
        case '=':
          return data[key] === value.replace(/['"]+/g, '');
        default:
          return false;
      }
    }
  
    const leftResult = evaluateRule(node.left, data);
    const rightResult = evaluateRule(node.right, data);
  
    return node.value === 'AND' ? leftResult && rightResult : leftResult || rightResult;
  }
  
  module.exports = { createRule, combineRules, evaluateRule };
  