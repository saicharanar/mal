class MalValue {
  constructor(value) {
    this.value = value;
  }

  pr_str() {
    return this.value.toString();
  }
};

class MalSymbol extends MalValue {
  constructor(value) {
    super(value);
  }
}

class MalList extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return '(' + this.value.map(x => x.pr_str()).join(' ') + ')';
  }

  isEmpty() {
    return this.value.length === 0;
  }

  count() {
    return this.value.length;
  }
}

class MalVector extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return '[' + this.value.map(x => x.pr_str()).join(' ') + ']';
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
}

class MalString extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return '"' + this.value + '"';
  }
}

class MalFunction extends MalValue {
  constructor(ast, binds, env) {
    super(ast);
    this.binds = binds;
    this.env = env;
  }

  pr_str() {
    return '#<function>';
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
  MalFunction
};