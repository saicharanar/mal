const { MalValue } = require("./types");

const pr_str = (malValue, readable = true) => {
  if (malValue instanceof Function) {
    return '#<function>'
  }

  if (malValue instanceof MalValue) {
    return malValue.pr_str(readable);
  }

  return malValue.toString();
};

module.exports = { pr_str };