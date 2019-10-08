const eWeLink = require('ewelink-api');

module.exports = function setup() {
  return gladys.param.getValues(['EWELINK_EMAIL', 'EWELINK_PASSWORD'])
    .spread((email, password) => {
      if (!email || email === '' || !password || password === '') {
        sails.log.error(`eWeLink - Error: credentials not set`);
        return Promise.reject(new Error('eWeLink credentials not set'));
      }

      const conn = new eWeLink({ region: 'eu', email, password });
      // sails.log.debug(`eWeLink - Debug: connection - ${JSON.stringify(connection)}`);

      return conn.getDevices()
        .then((devices) => {
          if (devices.error) {
            sails.log.error(`eWeLink - Error: ${devices.msg}`);
            return Promise.reject(new Error(`eWeLink ${devices.msg}`));
          }
          return devices.map((device) => {
            const newTypes = [
              {
                name: 'Power',
                type: 'binary',
                category: '',
                identifier: 'power',
                sensor: false,
                min: 0,
                max: 1
              }
            ];

            return conn.getDeviceChannelCount(device.deviceid)
              .then((switchCount) => {
                // sails.log.debug(`eWeLink - Debug - switchCount.switchesAmount: ${switchCount.switchesAmount}`);
                if (switchCount.error) {
                  sails.log.error(`eWeLink - Error: switchCount - ${switchCount.msg}`);
                  return Promise.reject(new Error(`eWeLink ${switchCount.msg}`));
                }

                const promises = [];
                for (let ch = 1; ch <= switchCount.switchesAmount; ch++) {
                  const newDevice = {
                    device: {
                      name: `${device.brandName} ${device.productModel}`,
                      identifier: `${device.deviceid}_${ch}`,
                      protocol: 'wifi',
                      service: 'ewelink'
                    },
                    types: newTypes
                  };

                  promises.push(gladys.device.create(newDevice));
                }

                return Promise.all(promises)
                  .then(() => sails.log.info(`eWeLink - Device (ID: ${device.deviceid}) created!`))
                  .catch((err) => sails.log.error(`eWeLink - Error, device (ID: ${device.deviceid}) not created: ${err}`));
              })
              .catch((error) => {
                sails.log.error(`eWeLink - Error: ${error.msg}`);
                return Promise.reject(new Error(`eWeLink ${error.msg}`));
              });
          });
        });
    });
};
