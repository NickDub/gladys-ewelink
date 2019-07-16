const eWeLink = require('ewelink-api');

module.exports = function exec(params) {
  return gladys.param.getValues(['EWELINK_EMAIL', 'EWELINK_PASSWORD'])
    .spread((email, password) => {
      if (!email || email === '' || !password || password === '') {
        sails.log.error(`eWeLink - Error credentials not set`);
        return Promise.reject();
      }

      if (params.deviceType.type === 'binary') {
        const arrayIdentifier = params.deviceType.identifier.split('_');
        const deviceId = arrayIdentifier[0];
        let channel = 1;
        if (arrayIdentifier.length > 1) {
          channel = arrayIdentifier[1];
        }
        const value = params.state.value;
        const state = value === 1 ? 'on' : 'off';

        const conn = new eWeLink({ email, password });
        return conn.setDevicePowerState(deviceId, state, channel)
          .then((response) => {
            if (response.error) {
              sails.log.error(`eWeLink - Error: ${response.error}`);
              return Promise.reject();
            }

            sails.log.info(`eWeLink - Device ${deviceId} state change`);
            return Promise.resolve(value);
          });
      }

      sails.log.info(`eWeLink - DeviceType type invalid or unknown: ${params.deviceType.type}`);
      return Promise.reject();
    });
};
