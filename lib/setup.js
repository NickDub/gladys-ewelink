const eWeLink = require('ewelink-api');
const eWeLinkHelper = require('ewelink-api/lib/ewelink-helper');

module.exports = function setup() {
  return gladys.param.getValues(['EWELINK_EMAIL', 'EWELINK_PASSWORD'])
    .spread((email, password) => {
      if (!email || email === '' || !password || password === '') {
        sails.log.error(`eWeLink - Error: credentials not set`);
        return Promise.reject(new Error('eWeLink credentials not set'));;
      }

      const conn = new eWeLink({ email, password });
      return conn.getDevices()
        .then((devices) => devices.map((device) => {
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

          const promises = [];
          const nbChannel = eWeLinkHelper.getDeviceTotalChannels(device.uiid);
          for (let channel = 1; channel <= nbChannel; channel++) {
            const newDevice = {
              device: {
                name: `${device.brandName} ${device.productModel}`,
                identifier: `${device.deviceid}_${channel}`,
                protocol: 'wifi',
                service: 'eWeLink'
              },
              types: newTypes
            };

            promises.push(gladys.device.create(newDevice));
          }

          return Promise.all(promises)
            .then(() => sails.log.info(`eWeLink - Device (ID: ${device.deviceid}) created!`))
            .catch((err) => sails.log.error(`eWeLink - Error, device (ID: ${device.deviceid}) not created: ${err}`));
        })
        );
    });
};
