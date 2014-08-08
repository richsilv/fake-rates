/*****************************************************************************/
/* Pricedata Publish Functions
/*****************************************************************************/

Meteor.publish('pricedata', function (candlesColl, lastTradeColl, ticker, interval, filter) {

	var lastTradeId = Random.id();

	_.extend(filter || {}, {ticker: ticker});

	function sign(number) {
		return number ? number < 0 ? -1 : 1 : 0;
	}

	function Candle(timeStamp, openingPrice) {

		this.high = openingPrice,
		this.low = openingPrice,
		this.open = openingPrice,
		this.close = openingPrice,
		this.timeStamp = timeStamp,
		this.interval = interval,
		this.ticks = 0,
		this._id = Random.id()

	}

	Candle.prototype.update = function(price) {

		this.high = this.high ? ( this.high < price ? price : this.high ) : price;
		this.low = this.low ? ( this.low > price ? price : this.low ) : price;
		this.open = this.open || price;
		this.close = price;
		this.ticks += 1;

	}	

	var _this = this,
		currentCandle = new Candle(),
		currentTime = null,
		lastPrice = null,
		initialized = false;

	var observer = TickData.find(filter, {sort: {time: 1}}).observeChanges({
		added: function(id, fields) {

			// If this is the first candle in the series
			if (!currentCandle.timeStamp) {

				currentCandle.timeStamp = fields.time;
				currentCandle.update(fields.mid);
				lastPrice = fields.mid;
				currentTime = fields.time;

				_this.added(candlesColl, currentCandle._id, currentCandle);
				_this.added(lastTradeColl, lastTradeId, {ticker: ticker, price: fields.mid, timeStamp: fields.time, direction: 0});

			}

			// If the next tick should start a new candle
			if (fields.time.getTime() > currentCandle.timeStamp.getTime() + interval) {

				// Make, populate and send new candles
				while (fields.time.getTime() > currentCandle.timeStamp.getTime() + interval) {

					currentCandle = new Candle(new Date(currentCandle.timeStamp.getTime() + interval), lastPrice);

					_this.added(candlesColl, currentCandle._id, currentCandle);

				}

				currentCandle.update(fields.mid);

				_this.changed(candlesColl, currentCandle._id, currentCandle);
				_this.changed(lastTradeColl, lastTradeId, {price: fields.mid, timeStamp: fields.time, direction: sign(fields.mid - lastPrice)});

				lastPrice = fields.mid;

			}

			// Otherwise, adjust the current candle
			else {

				currentCandle.update(fields.mid);

				_this.changed(candlesColl, currentCandle._id, currentCandle);
				_this.changed(lastTradeColl, lastTradeId, {price: fields.mid, timeStamp: fields.time, direction: sign(fields.mid - lastPrice)});

				lastPrice = fields.mid;

			}
		
		},
		changed: function(id, fields) {
			// Nothing to do here
		},
		removed: function(id) {
			// Nothing to do here
		}
	});

	initialized = true;
  	_this.ready();

  	_this.onStop(function() {
  		observer.stop();
  	});

});

Meteor.publish('emitterdata', function() {

	return TickEmitterData.find();

});

Meteor.publish('allticks', function(options) {

	return TickData.find({time: {$gte: new Date()}}, options);

});

TickData.find().observeChanges({

	'added': function(id, fields) {

		var thisEmitter = TickEmitterData.findOne({_id: fields.emitter});
		thisEmitter && TickEmitterData.update(thisEmitter, {$set: {lastPriceTime: fields.time}});

	}

});