const { Env } = require('./env.js');
const { isDeepStrictEqual } = require('util');
const { MalSymbol, MalList, MalValue, MalVector, MalObject, MalNil } = require('./types.js');
const { pr_str } = require('./printer.js');

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
  console.log(...args.map(item => pr_str(item)));
  return new MalNil();
};

const not = (arg) => {
  return !(arg && !(arg instanceof MalNil));
};

const binOperator = (predicate) => (...args) => {
  for (let i = 1; i < args.length; i++) {
    console.log(args[i]);
    const RHS = args[i - 1].value;
    const LHS = args[i].value;

    if (!predicate(RHS, LHS)) {
      return false;
    }
  }

  return true;
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


const env = new Env();
env.set(new MalSymbol('+'), (...args) => args.reduce(sum));
env.set(new MalSymbol('-'), (...args) => args.reduce(sub));
env.set(new MalSymbol('*'), (...args) => args.reduce(mul));
env.set(new MalSymbol('/'), (...args) => args.reduce(div));
env.set(new MalSymbol('list'), createList);
env.set(new MalSymbol('list?'), isList);
env.set(new MalSymbol('empty?'), isEmpty);
env.set(new MalSymbol('count'), count);
env.set(new MalSymbol('prn'), prn);
env.set(new MalSymbol('println'), prn);
env.set(new MalSymbol('pr_str'), pr_str);
env.set(new MalSymbol('not'), not);
env.set(new MalSymbol('='), binOperator(equals));
env.set(new MalSymbol('<'), binOperator(lessThan));
env.set(new MalSymbol('<='), binOperator(lessThanEqual));
env.set(new MalSymbol('>'), binOperator(greaterThan));
env.set(new MalSymbol('>='), binOperator(greaterThanEqual));

module.exports = { env };