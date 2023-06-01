const { MalValue } = require("./types");

const pr_str = (malValue) => {
  if (malValue instanceof Function) {
    return '#<function>'
  }

  if (malValue instanceof MalValue) {
    return malValue.pr_str();
  }

  return malValue.toString();
};

module.exports = { pr_str };