module.exports = function () {
	const type = {
		name: 'ewelink',
		service: 'ewelink'
	};

	return gladys.notification.install(type);
};
