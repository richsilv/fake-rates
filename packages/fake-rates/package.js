Package.describe({
	summary: "Generates fake FX rates for real currency pairs."
});

Package.on_use(function (api) {
	api.use(["random"], "server");
	api.add_files('prices.js', 'server');	
	api.add_files('fakerates.js', 'server');

  	api.export('FakeRates', 'server');
});