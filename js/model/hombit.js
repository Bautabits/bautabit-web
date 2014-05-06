define(['lib/backbone','lib/underscore', 'model/config'], function (Backbone, _) {
return Backbone.Model.extend({

   url: '/info',

   initialize: function() {
     console.log('hombit model init');
   },

   setIoPin: function(pin) {
     return $.ajax({url: '/io/pin/' + pin, type: 'PUT'});
   },

   clearIoPin: function(pin) {
     return $.ajax({url: '/io/pin/' + pin, type: 'DELETE'});
   },

   getIoPin: function(pin) {
     if (pin)
      return $.get('/io/pin/' + pin);
    else
      return $.get('/io/pin');
   },

   setNamedIoPin: function(name) {
    return $.ajax({url: '/io/name/' + name, type: 'PUT'});
   },

   clearNamedIoPin: function(name) {
    return $.ajax({url: '/io/name/' + name, type: 'DELETE'});
   },

 });
});
