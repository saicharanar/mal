const pr_str = (malValue) => {
  if (Array.isArray(malValue)) {
    return '(' + malValue.map(pr_str).join(' ') + ')';
  }

  return malValue.toString();
};

module.exports = { pr_str };