module.exports = function (sails) {
  const install = require('./lib/install.js');
  const setup = require('./lib/setup.js');
  const exec = require('./lib/exec.js');

  return {
    install,
    setup,
    exec,
  };
};
