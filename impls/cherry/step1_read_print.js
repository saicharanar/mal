const readline = require('readline');
const { read_str } = require('./reader.js');
const { pr_str } = require('./printer.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


const READ = (str) => read_str(str);
const EVAL = (str) => str;
const PRINT = (malValue) => pr_str(malValue);
const rep = (str) => PRINT(EVAL(READ(str)));

const repl = () => {
  rl.question('user> ', line => {
    console.log(rep(line));
    repl();
  })
};

repl();
