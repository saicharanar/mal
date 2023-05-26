class MalValue {
  constructor(value) {
    this.value = value;
  }

  pr_str() { //pr_str
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
}

class MalVector extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return '[' + this.value.map(x => x.pr_str()).join(' ') + ']';
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

module.exports = { MalSymbol, MalList, MalValue, MalVector, MalObject, MalNil };