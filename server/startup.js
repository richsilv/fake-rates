HISTORY_LENGTH = 3600000;

Meteor.startup(function() {

	TickEmitterData.remove({});
	
	Meteor.setInterval(function() {

		var timeNow = new Date().getTime(),
			limitTime = new Date(timeNow - HISTORY_LENGTH);

		TickData.remove({time: {$lte: limitTime}});

		TickEmitterData.find({}).forEach(function(emitter) {

			TickEmitterData.update(emitter, {$set: {firstPrice: limitTime}});
		
		});

	}, 3600000);

});