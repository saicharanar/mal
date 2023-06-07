const createMalString = (str) => {

  const value = str.replace(/\\(.)/g,
    (_, captured) => captured === 'n' ? '\n' : captured);
  return new MalString(value);
}


const pr_str = (malValue, readable = true) => {
  if (malValue instanceof Function) {
    return '#<function>'
  }

  if (malValue instanceof MalValue) {
    return malValue.pr_str(readable);
  }

  return malValue.toString();
};

class MalValue {
  constructor(value) {
    this.value = value;
  }

  pr_str() {
    return this.value.toString();
  }
};

class MalSequence extends MalValue {
  nth(n) {
    if (n >= this.value.length)
      throw "index out of range";
    return this.value[n];
  }

  first() {
    if (this.isEmpty()) return new MalNil();
    return this.value[0];
  }

  rest() {
    return new MalList(this.value.slice(1));
  }
}

class MalSymbol extends MalValue {
  constructor(value) {
    super(value);
  }
}

class MalList extends MalSequence {
  constructor(value) {
    super(value);
  }

  pr_str(print_readably) {
    return '(' + this.value.map(x => pr_str(x, print_readably)).join(' ') + ')';
  }

  isEmpty() {
    return this.value.length === 0;
  }

  count() {
    return this.value.length;
  }

  beginsWith(symbol) {
    return this.value.length > 0 && this.value[0].value === symbol;
  }
}

class MalVector extends MalSequence {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return '[' + this.value.map(x => pr_str(x)).join(' ') + ']';
  }

  isEmpty() {
    return this.value.length === 0;
  }

  count() {
    return this.value.length;
  }
}

class MalObject extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return '{' + this.value.map(x => x.pr_str()).join(' ') + '}';
  }
}

class MalNil extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return 'nil';
  }

  count() { return 0 }
  first() { return this }
}

class CommentException extends Error {
  constructor(errorMsg) {
    super(errorMsg);
  }
}
class MalAtom extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str(print_readably = false) {
    return "(atom " + pr_str(this.value, print_readably) + ")";
  }

  deref() {
    return this.value;
  }

  reset(value) {
    this.value = value
    return this.value;
  }

  swap(f, args) {
    this.value = f.apply(null, [this.value, ...args]);
    return this.value;
  }
}

class MalString extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str(readable) {
    if (readable) {
      return (
        '"' +
        this.value
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n') +
        '"'
      );
    }

    return this.value;
  }
}

class MalFunction extends MalValue {
  constructor(ast, binds, env, fn, isMacro = false) {
    super(ast);
    this.binds = binds;
    this.env = env;
    this.fn = fn;
    this.isMacro = isMacro;
  }

  pr_str() {
    return '#<function>';
  }

  apply(_, args) {
    return this.fn.apply(null, args);
  }
}

module.exports = {
  MalSymbol,
  MalList,
  MalValue,
  MalVector,
  MalObject,
  MalNil,
  MalString,
  MalFunction,
  MalAtom,
  createMalString,
  pr_str,
  CommentException
};