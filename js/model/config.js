define(['lib/backbone','lib/underscore'], function (Backbone, _) {
	return Backbone.Model.extend({
		url: '/conf/io'
	});
});
