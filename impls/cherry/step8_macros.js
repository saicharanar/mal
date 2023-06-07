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
  MalFunction,
  CommentException
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

const handleDefMacro = (ast, env) => {
  const macro = EVAL(ast.value[2], env);
  macro.isMacro = true;
  env.set(ast.value[1], macro);
  return env.get(ast.value[1]);
};

const isMacroCall = (ast, env) => {
  try {
    return (
      (ast instanceof MalList) &&
      !ast.isEmpty() &&
      ast.value[0] instanceof MalSymbol &&
      env.get(ast.value[0]).isMacro
    );

  } catch (e) {
    return false;
  }
};

const macroExpand = (ast, env) => {
  while (isMacroCall(ast, env)) {
    const macro = env.get(ast.value[0]);
    ast = macro.apply(null, ast.value.slice(1));
  }

  return ast;
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

const quasiQuote = (ast, env) => {
  if (ast instanceof MalList && ast.beginsWith('unquote'))
    return ast.value[1];

  if (ast instanceof MalList) {
    let result = new MalList([]);
    for (let index = ast.value.length - 1; index >= 0; index--) {
      const element = ast.value[index];

      if (
        (element instanceof MalList) &&
        (element.beginsWith('splice-unquote'))
      ) {
        result = new MalList(
          [
            new MalSymbol("concat"),
            element.value[1],
            result
          ]);
      } else {
        result = new MalList(
          [
            new MalSymbol("cons"),
            quasiQuote(element, env),
            result
          ]);
      }
    }
    return result;
  }

  if (ast instanceof MalSymbol) {
    return new MalList([new MalSymbol("quote"), ast]);
  }

  return ast;
};

const fnBlock = (ast, env) => {
  const [binds, ...body] = ast.value.slice(1);
  const doForms = new MalList([new MalSymbol('do'), ...body]);
  const fn = (...args) => {
    const newEnv = new Env(env, binds.value, args);
    return EVAL(doForms, newEnv);
  }
  return new MalFunction(doForms, binds, env, fn);
};

const EVAL = (ast, env) => {
  while (true) {
    if (!(ast instanceof MalList)) {
      return eval_ast(ast, env);
    }

    if (ast.isEmpty()) return ast;

    ast = macroExpand(ast, env);

    if (!(ast instanceof MalList)) {
      return eval_ast(ast, env);
    }


    switch (ast.value[0].value) {
      case 'def!': return bindDef(ast, env);
      case 'defmacro!': return handleDefMacro(ast, env);
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
      case 'quote':
        return ast.value[1];
      case 'quasiquoteexpand':
        return quasiQuote(ast.value[1], env);
      case 'macroexpand':
        return macroExpand(ast.value[1], env);
      case 'quasiquote':
        ast = quasiQuote(ast.value[1], env);
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
env.set(new MalSymbol('eval'), ast => EVAL(ast, env));

rep('(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil)")))))');

rep("(defmacro! cond (fn* (& xs) (if (> (count xs) 0) (list 'if (first xs) (if (> (count xs) 1) (nth xs 1) (throw \"odd number of forms to cond\")) (cons 'cond (rest (rest xs)))))))");

const repl = () => {
  rl.question('user> ', line => {
    try {
      console.log(rep(line));
    } catch (e) {
      if (!(e instanceof CommentException))
        console.log(e);
    }
    repl();
  })
};

repl();
