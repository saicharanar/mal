const readline = require('readline');
const { read_str } = require('./reader.js');
const { pr_str } = require('./printer.js');
const { MalSymbol, MalList, MalValue, MalVector, MalObject } = require('./types.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const sum = (x, y) => new MalValue(x.value + y.value);
const mul = (x, y) => new MalValue(x.value * y.value);
const sub = (x, y) => new MalValue(x.value - y.value);
const div = (x, y) => new MalValue(x.value / y.value);

const env = {
  '+': (...args) => args.reduce(sum),
  '*': (...args) => args.reduce(mul),
  '-': (...args) => args.reduce(sub),
  '/': (...args) => args.reduce(div),
};

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    return env[ast.value]
  }

  if (ast instanceof MalList) {
    const newAst = ast.value.map(x => EVAL(x, env));
    return new MalList(newAst);
  }

  if (ast instanceof MalVector) {
    const newAst = ast.value.map(x => EVAL(x, env));
    return new MalVector(newAst);
  }

  return ast;
};


const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) {
    return eval_ast(ast, env);
  }

  if (ast.isEmpty()) return ast;

  const [fn, ...args] = eval_ast(ast, env).value;
  return fn.apply(null, args);
};

const READ = (str) => read_str(str);
const PRINT = (malValue) => pr_str(malValue);
const rep = (str) => PRINT(EVAL(READ(str), env));

const repl = () => {
  rl.question('user> ', line => {
    try {
      console.log(rep(line));
    } catch (e) {
      console.log(e);
    }
    repl();
  })
};

repl();
