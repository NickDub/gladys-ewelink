module.exports = function () {
	const type = {
		name: 'eWeLink',
		service: 'eWeLink'
	};

	return gladys.notification.install(type);
};
