const readline = require('readline');
const { read_str } = require('./reader.js');
const { pr_str } = require('./printer.js');
const { MalSymbol, MalList, MalValue, MalVector, MalObject, MalNil } = require('./types.js');
const { env } = require('./core.js');
const { Env } = require('./env.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

  if (lists.length === 0) {
    return new MalNil();
  }

  for (const list of lists) {
    EVAL(list, env);
  }

  return (EVAL(...lists.slice(-1), env));
};

const ifBlock = (ast, env) => {
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

const fnBlock = (ast, env) => {
  const scopeEnv = new Env(env);

  return (...args) => {
    const bindings = ast.value[1].value;

    for (let i = 0; i < bindings.length; i++) {
      if (bindings[i].value === '&') {
        const name = bindings[i + 1];
        const restOfArgs = args.slice(i);

        scopeEnv.set(name, new MalList(restOfArgs));
        i = bindings.length;
      } else {
        scopeEnv.set(bindings[i], EVAL(args[i], scopeEnv));
      }
    }

    const exp = ast.value[2];
    if (exp) {
      return EVAL(exp, scopeEnv);
    }

    return new MalNil();
  }
};

const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) {
    return eval_ast(ast, env);
  }

  if (ast.isEmpty()) return ast;

  switch (ast.value[0].value) {
    case 'def!': return bindDef(ast, env);
    case 'let*': return bindLet(ast, env);
    case 'do': return doBlock(ast, env);
    case 'if': return ifBlock(ast, env);
    case 'fn*': return fnBlock(ast, env);
  }

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
