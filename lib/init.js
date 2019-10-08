const eWeLink = require('ewelink-api');

module.exports = function init() {
  return gladys.param.getValues(['EWELINK_EMAIL', 'EWELINK_PASSWORD'])
    .spread((email, password) => {
      if (!email || email === '' || !password || password === '') {
        sails.log.error(`eWeLink - Error: credentials not set`);
        return Promise.reject(new Error('eWeLink credentials not set'));
      }

      gladys.device.getByService({ service: 'ewelink' })
        .then((devices) => devices.map((device) => {
          const arrayIdentifier = device.identifier.split('_');
          const deviceId = arrayIdentifier[0];
          let channel = 1;
          if (arrayIdentifier.length > 1) {
            channel = arrayIdentifier[1];
          }

          const conn = new eWeLink({ region: 'eu', email, password });
          return conn.getDevicePowerState(deviceId, channel)
            .then((response) => {
              if (response.error) {
                sails.log.error(`eWeLink - Error: ${response}`);
                return Promise.reject();
              }

              const value = response.state === 'on' ? 1 : 0;

              return gladys.deviceType.getByDevice({ id: device.id })
                .then((deviceTypes) => {
                  return changeState(deviceTypes[0], value);
                });
            });
        }));
    });
}

function changeState(deviceType, value) {
  return new Promise((resolve, reject) => {
    const newState = { devicetype: deviceType.id, value };

    return gladys.deviceState.create(newState)
      .then((state) => {
        // sails.log.debug(`DEBUG - State ${deviceType.identifier} created`);
        return resolve();
      })
      .catch((err) => {
        sails.log.error(`eWeLink - Error, state ${deviceType.identifier} not created!`);
        return reject(err);
      });
  });
}
