define(['lib/backbone', 'lib/handlebars', 'model/hombit', 'view/configview'], function (Backbone, Handlebars, Hombit, ConfigView) {
	return Backbone.View.extend({

		template: Handlebars.compile($('#mainview-template').html()),

		initialize: function() {
			this.hombit = new Hombit();
			this.hombit.bind('change', this.change, this);
			this.hombit.fetch();
		},

		change: function() {
			console.log('change');
			if (this.rendered)
				this.render();
		},

		render: function() {
			console.log('render');
  			this.$el.html(this.template(this));
  			if (this.hombit.get('id')) {
				this.configview = new ConfigView({ hombit: this.hombit });
	  			this.$('#config-view').append(this.configview.render().el);
                document.title = 'Bautabit - ' + this.id() + ' ' + this.type();
  			}
  			this.rendered = true;

  			$(document).ajaxError(function(event, request, settings) {
  				$('#ajax-error-alert').html('<b>Error:</b> ' + (request.responseText || 'Failed to communicate with device')).show().delay(5000).fadeOut();
  			});
  			return this;
  		},

  		id: function() { return this.hombit && this.hombit.id; },
  		type: function() { return this.hombit && this.hombit.get('type'); },
	});
});
