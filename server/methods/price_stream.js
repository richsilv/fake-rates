TickEmitters = [];

/*****************************************************************************/
/* StartStream Methods */
/*****************************************************************************/

Meteor.methods({
 /*
  * Example:
  *  '/app/start_stream/update/email': function (email) {
  *    Users.update({_id: this.userId}, {$set: {'profile.email': email}});
  *  }
  *
  */

 	'app/start_stream': function(ticker, options) {

  		var options = options || {},
  			lastTick = TickData.findOne({ticker: ticker}, {sort: {time: -1}}),
    		emitterOptions = {
    			seedPrice: options.seedPrice || (lastTick ? lastTick.mid : null),
    			spread: null,
    			delay: options.delay,
    			stdDev: options.stDev
    		},
    		rateObject = new FakeRates(ticker, emitterOptions);

      if (!rateObject.emitter) throw new Meteor.Error(500, 'Stream Configuration Error');

    	rateObject.emitter.on('price', function(p) {
    		TickData.insert(p);
    	});

    	TickEmitters.push(rateObject);
      TickEmitterData.insert({
        _id: rateObject._id,
        ticker: rateObject.currencyPair,
        spread: rateObject.spread,
        delay: rateObject.delay,
        stdDev: rateObject.stdDev,
        firstPrice: new Date()
      });

    	return rateObject._id;

  	},

  	'app/stop_stream': function(id) {

  		var count = 0;

  		_.where(TickEmitters, {_id: id}).forEach(function(emitter) { count += emitter.stop(); } );

  		return count;

  	},

    'app/delete_stream': function(id) {

      _.where(TickEmitters, {_id: id}).forEach(function(emitter) { emitter.stop(); } );
      TickEmitterData.remove({_id: id});
      TickData.remove({emitter: id});

    },

  	'app/delete_ticks': function(filter) {

  		return TickData.remove(filter);

  	}

});
