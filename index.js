module.exports = function (sails) {
  const install = require('./lib/install');
  const setup = require('./lib/setup');
  const exec = require('./lib/exec');
  const init = require('./lib/init');

  return {
    install,
    setup,
    exec,
    init,
  };
};
