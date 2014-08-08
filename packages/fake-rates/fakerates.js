var events = Npm.require('events');

FakeRates = function(currencyPair, options) {

	var _this = this,
		altPair = currencyPair.slice(3) + currencyPair.slice(0,3),
		currentTimeout,
		seedPrice;

	if (seedPrices[currencyPair]) {
		seedPrice = seedPrices[currencyPair];
	}
	else if (seedPrices[altPair]) {
		seedPrice = 1 / seedPrices[altPair];
	}
	else {
		return new Meteor.Error(500, "Cannot find currency pair", {currencyPair: currencyPair});
	}

	options = options || {};
	this._id = Random.id();
	this.currencyPair = currencyPair;
	this.price = options.seedPrice || seedPrice;
	this.spread = options.spread || seedPrice / 1000;
	this.delay = options.delay || 1;
	this.stdDev = options.stdDev || 1;
	this.emitter = new events.EventEmitter();

	function stdNorm() {

		return ((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()) - 3) / 3;
	
	}

	function poisson(expectedValue){
	 
	    return - Math.log( Math.random() ) * expectedValue;

	}

	function nextEmission() {
	
		var price = _this.price * (1 + stdNorm() * _this.stdDev / 100);
		var bid = price - _this.spread / 2;
		var offer = price + _this.spread / 2;

 		price = Math.floor(price * 1000000) / 1000000;
		bid =  Math.floor(bid * 1000000) / 1000000;
		offer = Math.floor(offer * 1000000) / 1000000;
		
		var event = {
			'ticker' : _this.currencyPair,
			'bid':bid,
			'mid':price,
			'offer':offer,
			'time':new Date(),
			'emitter':_this._id
		}

		_this.price = price;

		_this.emitter.emit('price', event);		

		var nextDelay = poisson(_this.delay * 1000);

		currentTimeout = Meteor.setTimeout(nextEmission, nextDelay);

	}

	this.stop = function() {

		if (currentTimeout) {
			Meteor.clearTimeout(currentTimeout);
			currentTimeout = null;
			return 1;
		}
		else
			return 0;

	};

	var nextDelay = poisson(_this.delay);

	currentTimeout = Meteor.setTimeout(nextEmission, nextDelay);

};