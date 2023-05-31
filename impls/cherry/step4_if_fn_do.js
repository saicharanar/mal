const readline = require('readline');
const { read_str } = require('./reader.js');
const { pr_str } = require('./printer.js');
const { MalSymbol, MalList, MalValue, MalVector, MalObject, MalNil } = require('./types.js');
const { Env } = require('./env.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const sum = (x, y) => new MalValue(x.value + y.value);
const mul = (x, y) => new MalValue(x.value * y.value);
const sub = (x, y) => new MalValue(x.value - y.value);
const div = (x, y) => new MalValue(x.value / y.value);


const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    return env.get(ast);
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

const bindLet = (ast, env) => {
  const scopeEnv = new Env(env);
  const bindings = ast.value[1].value;

  for (let i = 0; i < bindings.length; i += 2) {
    scopeEnv.set(bindings[i], EVAL(bindings[i + 1], scopeEnv));
  }

  const exp = ast.value[2];
  if (exp) {
    return EVAL(exp, scopeEnv);
  }

  return new MalNil();
};

const bindDef = (ast, env) => {
  env.set(ast.value[1], EVAL(ast.value[2], env));
  return env.get(ast.value[1]);
};

const doBlock = (ast, env) => {
  const lists = ast.value.slice(1);
  for (const list of lists) {
    EVAL(list, env);
  }

  return (EVAL(...lists.slice(-1), env));
};

const createList = (ast, env) => {
  const list = ast.value.slice(1);
  return new MalList(list.map(listItem => EVAL(listItem, env)))
};

const isList = (ast, env) => {
  const list = ast.value[1];
  return (list instanceof MalList);
};

const ifn = (ast, env) => {
  const [predicate, ifBlock, elsePart] = ast.value.slice(1);

  const evaluatedPredicate = EVAL(predicate, env)
  if (evaluatedPredicate && !(evaluatedPredicate instanceof MalNil)) {
    return EVAL(ifBlock, env);
  }

  if (elsePart != undefined) {
    return EVAL(elsePart, env);
  }

  return new MalNil();
};

const isEmpty = (ast, env) => {
  const list = ast.value[1];
  return EVAL(list, env).isEmpty();
};

const count = (ast, env) => {
  const list = ast.value.slice(1)[0];
  if (list instanceof MalNil) {
    return new MalValue(0);
  }

  return new MalValue(EVAL(list, env).count());
};

const greaterThan = (ast, env) => {
  const [lhs, rhs] = ast.value.slice(1);
  return EVAL(lhs, env) > EVAL(rhs, env);
};

const lessThan = (ast, env) => {
  const [lhs, rhs] = ast.value.slice(1);
  return EVAL(lhs, env) < EVAL(rhs, env);
};

const equals = (ast, env) => {
  return true;
};

const prn = (ast, env) => {
  const arg = ast.value[1];
  return EVAL(arg, env);
};

const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) {
    return eval_ast(ast, env);
  }

  if (ast.isEmpty()) return ast;

  switch (ast.value[0].value) {
    case 'def!':
      return bindDef(ast, env);

    case 'let*':
      return bindLet(ast, env);

    case 'do':
      return doBlock(ast, env);

    case 'list':
      return createList(ast, env);

    case 'list?':
      return isList(ast, env);

    case 'if':
      return ifn(ast, env);

    case 'empty?':
      return isEmpty(ast, env);

    case 'count':
      return count(ast, env);

    case '>':
      return greaterThan(ast, env);

    case '<':
      return lessThan(ast, env);

    case '=':
      return equals(ast, env);

    case 'prn':
      return prn(ast, env);
  }

  const [fn, ...args] = eval_ast(ast, env).value;
  return fn.apply(null, args);
};


const READ = (str) => read_str(str);
const PRINT = (malValue) => pr_str(malValue);

const env = new Env();
env.set(new MalSymbol('+'), (...args) => args.reduce(sum))
env.set(new MalSymbol('-'), (...args) => args.reduce(sub))
env.set(new MalSymbol('*'), (...args) => args.reduce(mul))
env.set(new MalSymbol('/'), (...args) => args.reduce(div))

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
