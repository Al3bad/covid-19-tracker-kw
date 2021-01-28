const Reset = "\x1b[0m";
const Dim = "\x1b[2m";
const FgYellow = "\x1b[33m";

const logger = {};

logger.pathname = (pathname) => {
  console.log(`\n${Dim}[ ${FgYellow}${pathname}${Reset}${Dim} ]${Reset}\n`);
};

logger.task = (task) => {
  console.log(`\n${Dim}${task}${Reset}\n`);
};

logger.seperator = () => {
  console.log(`\n${Dim}=============================${Reset}\n`);
};

module.exports = logger;
