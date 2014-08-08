fake-rates
==========

How to install
--------------
```
npm install fake-rates
```

How to use
----------
```
rates = require('fake-rates');

rates.on('USDEUR', function(update) {
  console.log('bid:', update.bid);
});

// bid: 0.766617
// bid: 0.766504
// bid: 0.766491
// ...
```

`rates` is a plain node.js [event emitter](http://nodejs.org/api/events.html#events_class_events_eventemitter) and can be used as such (subscribing, unsubscribing etc).

```
rates.on(currency, listener)
```
`currency` can be any of the standard currency pairs (`'USDJPY'`, `'USDEUR'` etc), plus `'all'` to get updates on all pairs.

`listener` is called on update with an update object. It has the properties `update.currencyPair`, `update.bid` and `update.offer`.
