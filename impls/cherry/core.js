const { Env } = require('./env.js');
const { isDeepStrictEqual } = require('util');
const { MalSymbol, MalList, MalValue, MalVector, MalObject, MalNil, MalString, MalAtom, createMalString } = require('./types.js');
const { pr_str } = require('./printer.js');
const { read_str } = require('./reader.js');
const fs = require('fs');

const createList = (...args) => {
  return new MalList(args);
};

const isList = (arg) => {
  return (arg instanceof MalList);
};

const isEmpty = (arg) => {
  return arg.isEmpty();
};

const count = (arg) => {
  if (arg instanceof MalNil) {
    return new MalValue(0);
  }

  return new MalValue(arg.count());
};

const prn = (...args) => {
  console.log(args.map(item => pr_str(item, true)).join(' '));
  return new MalNil();
};

const println = (...args) => {
  console.log(args.map(item => pr_str(item, false)).join(' '));
  return new MalNil();
};

const str = (...args) => {
  return new MalString(args.map((item) => pr_str(item, false)).join(''));
};

const pr_str_fn = (...args) => {
  return new MalString(args.map((item) => pr_str(item, true)).join(' '));
};

const not = (arg) => {
  return !(arg && !(arg instanceof MalNil));
};

const binOperator = (predicate) => (...args) => {
  for (let i = 1; i < args.length; i++) {
    const RHS = args[i - 1].value;
    const LHS = args[i].value;

    if (!predicate(RHS, LHS)) {
      return false;
    }
  }

  return true;
};

const read_str_fn = (str) => {
  return read_str(str.value);
};

const equals = (a, b) => isDeepStrictEqual(a, b);
const lessThan = (a, b) => a < b;
const greaterThan = (a, b) => a > b;
const lessThanEqual = (a, b) => a <= b;
const greaterThanEqual = (a, b) => a >= b;
const sum = (x, y) => new MalValue(x.value + y.value);
const mul = (x, y) => new MalValue(x.value * y.value);
const sub = (x, y) => new MalValue(x.value - y.value);
const div = (x, y) => new MalValue(x.value / y.value);


const env = new Env(null, [], []);

const ns = {
  '+': (...args) => args.reduce(sum),
  '-': (...args) => args.reduce(sub),
  '*': (...args) => args.reduce(mul),
  '/': (...args) => args.reduce(div),
  'list': createList,
  'list?': isList,
  'empty?': isEmpty,
  'count': count,
  'str': str,
  'prn': prn,
  'println': println,
  'pr-str': pr_str_fn,
  'not': not,
  '=': binOperator(equals),
  '<': binOperator(lessThan),
  '<=': binOperator(lessThanEqual),
  '>': binOperator(greaterThan),
  '>=': binOperator(greaterThanEqual),
  'read-string': read_str_fn,
  'slurp': filename => {
    return createMalString(fs.readFileSync(filename.value, 'utf-8'));
  },
  'atom': value => new MalAtom(value),
  'atom?': value => value instanceof MalAtom,
  'deref': atom => atom.deref(),
  'reset!': (atom, value) => atom.reset(value),
  'swap!': (atom, f, ...args) => atom.swap(f, args),
};

// env.set(new MalSymbol('+'), (...args) => args.reduce(sum));
// env.set(new MalSymbol('-'), (...args) => args.reduce(sub));
// env.set(new MalSymbol('*'), (...args) => args.reduce(mul));
// env.set(new MalSymbol('/'), (...args) => args.reduce(div));
// env.set(new MalSymbol('list'), createList);
// env.set(new MalSymbol('list?'), isList);
// env.set(new MalSymbol('empty?'), isEmpty);
// env.set(new MalSymbol('count'), count);
// env.set(new MalSymbol('str'), str);
// env.set(new MalSymbol('prn'), prn);
// env.set(new MalSymbol('println'), println);
// env.set(new MalSymbol('pr-str'), pr_str_fn);
// env.set(new MalSymbol('not'), not);
// env.set(new MalSymbol('='), binOperator(equals));
// env.set(new MalSymbol('<'), binOperator(lessThan));
// env.set(new MalSymbol('<='), binOperator(lessThanEqual));
// env.set(new MalSymbol('>'), binOperator(greaterThan));
// env.set(new MalSymbol('>='), binOperator(greaterThanEqual));
// env.set(new MalSymbol('read-string'), read_str_fn);
// env.set(new MalSymbol('slurp'), filename => {
//   return createMalString(fs.readFileSync(filename.value, 'utf-8'));
// });
// env.set(new MalSymbol('atom'), value => new MalAtom(value));
// env.set(new MalSymbol('atom?'), value => value instanceof MalAtom);
// env.set(new MalSymbol('deref'), atom => atom.deref());
// env.set(new MalSymbol('reset!'), (atom, value) => atom.reset(value));
// env.set(new MalSymbol('swap!'), (atom, f, ...args) => atom.swap(f, args));

const bindNS = () => {
  Object.entries(ns).forEach(([symbol, fn]) => {
    env.set(new MalSymbol(symbol), fn);
  })
};
bindNS();

module.exports = { env };