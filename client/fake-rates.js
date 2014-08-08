Meteor.startup(function() {

  Meteor.subscribe('emitterdata');
  Meteor.subscribe('allticks', {sort: {time: -1}, limit: 50});

});

Template.main.helpers({

  emitters: function () {

    return TickEmitterData.find();

  },

  startStreamError: function() {

    return Session.get('startStreamError');

  },

  ticks: function() {

    return TickData.find({}, {sort: {time: -1}, limit: 50});

  }

});

Template.main.events({

  'click .stopButton': function(event) {
    
    Meteor.call('app/stop_stream', this._id);

  },

  'click .deleteButton': function(event) {
    
    Meteor.call('app/delete_stream', this._id);

  },

  'click #startSteam': function(event) {

    var ticker = $('#ticker').val(),
        options = {
          stDev: $('#stDev').val(),
          delay: $('#delay').val(),
          spread: $('#spread').val(),
          seedPrice: $('#seedPrice').val(),
        };

    Meteor.call('app/start_stream', ticker, options, function(err, res) {

      if (err) {
        console.log(err);
        Session.set('startStreamError', err.reason);
      }

    });

  },

  'click #deleteData': function(event) {

    Meteor.call('app/delete_ticks', {});

  }

});