define(['lib/backbone', 'lib/handlebars', 'model/config'], function (Backbone, Handlebars, HombitConfig) {

	PinConfigView = Backbone.View.extend({
		template: Handlebars.compile($('#pinconfigview-template').html()),

		events: {
			'change .mode-select': 'changeMode',
			'change .name-input': 'changeName',
			'click .set-io-btn': 'setIoPin',
			'click .clear-io-btn': 'clearIoPin',
            'change .blink-input': 'changeBlink',
		},

		initialize: function(options) {
			this.pin = options.pin;
			this.hombit = options.hombit;
			this.config = this.model.get(this.pin);
		},

		render: function() {
			console.log('render config');
			this.$el.html(this.template(this));
			this.$el.addClass('pin-config');
			this.$el.attr('data-pin', this.pin);
			this.$('.mode-select').val(this.mode());
			this.$('.name-input').css('font-weight', this.name() ? 'bold' : 'normal');
			this.renderValue();
			this.rendered = true;
			return this;
		},

		renderValue: function() {
			if (this.output()) {
				this.$('.pin-value').show();
				this.$('.btn-warning, .btn-inverse').removeClass('btn-warning').removeClass('btn-inverse');
				if (typeof this.value != 'undefined') {
					this.$el.attr('data-pin-value',this.value);
					if (this.value)
						this.$('.set-io-btn').addClass('btn-warning');
					else
						this.$('.clear-io-btn').addClass('btn-inverse');
				} else
					this.$el.removeAttr('data-pin-value');
			} else
				this.$('.pin-value').hide();
		},

		// Handlers

		changeMode: function() {
			var mode = this.$('.mode-select').val();
			console.log('change mode pin ' + this.pin + ' ' + mode);
			this.config.mode = mode;
            this.save();
			this.render();
			this.$('.mode-select').focus();
		},

		changeName: function() {
			var name = this.$('.name-input').val();
			console.log('change name pin ' + this.pin + ' ' + name);
			this.config.name = name;
            this.save();
			this.$('.name-input').css('font-weight', name ? 'bold' : 'normal');
		},

		setIoPin: function() {
			console.log('set pin');
			var self = this;
			if (this.config.name) {
				this.hombit.setNamedIoPin(this.config.name).success(function () {
					self.value = true;
					self.renderValue();
				});
			} else {
				this.hombit.setIoPin(this.pin).success(function () {
					self.value = true;
					self.renderValue();
				});
			}
			return false;
		},

		clearIoPin: function() {
			console.log('clear pin');
			var self = this;
			if (this.config.name) {
				this.hombit.clearNamedIoPin(this.config.name).success(function () {
					self.value = false;
					self.renderValue();
				});
			} else {
				this.hombit.clearIoPin(this.pin).success(function () {
					self.value = false;
					self.renderValue();
				});
			}
			return false;
		},

        changeBlink: function(event) {
            if (!this.config.commands) this.config.commands = [];
            var blink = this.config.commands && _(this.config.commands).findWhere({name: 'blink'});
            if (!blink) {
                blink = {name: 'blink'};
                this.config.commands.push(blink);
            }
            blink.interval = parseFloat(this.$('.blink-on-input').val());
            if (isNaN(blink.interval))
                this.config.commands.splice(this.config.commands.indexOf(blink), 1);
            else {
                blink.intervalOff = parseFloat(this.$('.blink-off-input').val());
                if (isNaN(blink.intervalOff))
                    delete blink.intervalOff;
            }
            console.log('change blink', blink.interval, blink.intervalOff);
            this.save();
        },

        save: function() {
            var data = {};
            data[this.pin] = this.config;
            this.model.set(data, {silent: true});
            this.model.save();
        },

		// Getters

		pinNo: function() { return this.pin; },
		mode: function() { return this.config.mode; },
		name: function() { return this.config.name; },
		output: function() { return this.mode() == 'out'; },
        blinkOnInterval: function() {
            var blink = this.config.commands && _(this.config.commands).findWhere({name: 'blink'});
            return blink && blink.interval;
        },
        blinkOffInterval: function() {
            var blink = this.config.commands && _(this.config.commands).findWhere({name: 'blink'});
            return blink && blink.intervalOff;
        },
	});

	return Backbone.View.extend({
		pollInterval: 500,
		template: Handlebars.compile($('#configview-template').html()),

		events: {
			'click .polling-select': 'changePolling',
            'change .show-unnamed-checkbox': 'changeShowUnnamed',
		},

		initialize: function(options) {
			console.log('config view init');
			this.hombit = options.hombit;
			this.model = new HombitConfig();
			this.model.bind('change', this.change, this);
			this.model.fetch();

			if (localStorage.polling)
				this.startPolling();
		},

		change: function() {
			if (this.rendered)
				this.render();
		},

		render: function() {
  			this.$el.html(this.template(this));

            if (this.showUnnamed) this.$('.show-unnamed-checkbox').attr('checked','');
  			this.$('.polling-select').val(this.pollId ? 'enabled' : null);

  			this.pinviews = {};
  			for (var pin in this.model.attributes) {
                if (!this.showUnnamed && !this.model.get(pin).name) continue;
  				var view = new PinConfigView({model: this.model, pin: pin, hombit: this.hombit});
  				this.$('#pin-config-views').append(view.render().el);
  				this.pinviews[pin] = view;
  			}
  			this.rendered = true;
  			return this;
  		},

  		startPolling: function() {
  			console.log('start polling');
  			if (this.pollId)
  				window.clearInterval(this.pollId);
			var self = this;
			this.pollId = window.setInterval(function() {
				self.poll();
			}, this.pollInterval);
			if (this.pollingFailCount) {
				delete this.pollingFailCount;
				$('#persistent-error-alert').hide();
			}
  		},

  		stopPolling: function() {
  			console.log('stop polling');
  			if (this.pollId)
  				window.clearInterval(this.pollId);
			delete this.pollId;
			for (var pin in this.pinviews) {
				delete this.pinviews[pin].value;
				this.pinviews[pin].renderValue();
			}
  		},

  		poll: function() {
  			var self = this;
  			this.$('.poll-status').html('*');
  			this.hombit.getIoPin().success(function (io) {
	  			self.$('.poll-status').html('.');
  				for (var pin in io) {
  					var value = io[pin];
                    if (!self.pinviews[pin]) continue;
  					self.pinviews[pin].value = value;
  					self.pinviews[pin].renderValue();
  				}
  			}).error(function() {
  				console.log('poll fail ' + self.pollingFailCount);
  				if (!self.pollingFailCount)
  					self.pollingFailCount = 1;
  				else if (self.pollingFailCount < 4)
  					self.pollingFailCount++;
  				else {
	  				self.stopPolling();
	  				self.render();
  					$('#persistent-error-alert').html('<b>Polling disabled</b> due to repeated errors').fadeIn();
  				}
  			});
  		},

  		changePolling: function() {
  			console.log('change polling',this.$('#polling').val());
  			this.$('.poll-status').html('');
  			if (this.$('.polling-select').val()) {
  				this.startPolling();
  				localStorage.polling = 'yep';
  			} else {
  				this.stopPolling();
  				delete localStorage.polling;
  			}
  		},

  		changeShowUnnamed: function() {
            console.log('change show unnamed');
            this.showUnnamed = this.$('.show-unnamed-checkbox').is(':checked');
            this.render();
  			return false;
  		},

	});
});
