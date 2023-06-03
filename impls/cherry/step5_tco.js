const readline = require('readline');
const { read_str } = require('./reader.js');
const { pr_str } = require('./printer.js');
const {
  MalSymbol,
  MalList,
  MalValue,
  MalVector,
  MalObject,
  MalNil,
  MalFunction
} = require('./types.js');
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
  const [{ value }, ...forms] = ast.value.slice(1);
  const scopeEnv = new Env(env);

  for (let i = 0; i < value.length; i += 2) {
    scopeEnv.set(value[i], EVAL(value[i + 1], scopeEnv));
  }

  const doForms = new MalList([new MalSymbol('do'), ...forms]);
  return [doForms, scopeEnv];
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

  lists.slice(0, -1).forEach(item => EVAL(item, env));
  return lists[lists.length - 1];
};

const ifBlock = (ast, env) => {
  const [predicate, ifBlock, elsePart] = ast.value.slice(1);

  const evaluatedPredicate = EVAL(predicate, env)
  if (evaluatedPredicate && !(evaluatedPredicate instanceof MalNil)) {
    return ifBlock;
  }

  if (elsePart != undefined) {
    return elsePart;
  }

  return new MalNil();
};

const fnBlock = (ast, env) => {
  const [binds, ...body] = ast.value.slice(1);
  const doForms = new MalList([new MalSymbol('do'), ...body]);
  return new MalFunction(doForms, binds, env);
};

const EVAL = (ast, env) => {
  while (true) {
    if (!(ast instanceof MalList)) {
      return eval_ast(ast, env);
    }

    if (ast.isEmpty()) return ast;

    switch (ast.value[0].value) {
      case 'def!': return bindDef(ast, env);
      case 'let*':
        [ast, env] = bindLet(ast, env);
      case 'do':
        ast = doBlock(ast, env);
        break;
      case 'if':
        ast = ifBlock(ast, env);
        break;
      case 'fn*':
        ast = fnBlock(ast, env);
        break;
      default:
        const [fn, ...args] = eval_ast(ast, env).value;
        if (fn instanceof MalFunction) {
          ast = fn.value;
          const oldEnv = fn.env;
          const binds = fn.binds;

          env = new Env(oldEnv, binds.value, args);
        } else {
          return fn.apply(null, args);
        }
    }

  }

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
