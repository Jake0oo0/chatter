define(["app", "backbone", "jquery", "moment"], function(Chatter, Backbone, $, moment) {
	"use strict";
	var uuid = require("node-uuid");
	var Channel = Backbone.Model.extend({
		idAttribute: "uuid",
		modelName: "Channel",
		defaults: {
			name: "",
			topic: "",
			current: false,
			server: 0,
			names: {},
			channels: []
		},

		initialize: function() {
			if (!this.uuid) {
				this.set("uuid", uuid.v4());
			}
			if (this.get('name').startsWith('#')) {
				this.pm = false;
			} else {
				this.pm = true;
				this.topic = this.get('name') + ' (Private Message)'
			}
		},

		getMessages: function() {
			return $("#content div.channel-wrap[data-channel=\"" + this.id + "\"] .messages");
		},

		addMessage: function(message) {
			var msgs = $(this.getMessages());
			var date = moment().format("MM/DD/YYYY hh:mm");
			$(msgs).append("<div class=\"message\"><span class=\"timestamp\">" + date + '</span> <span class="separator">=></span> <span class="text">' + message + '</span></div>');
			$(msgs).scrollTop(($(msgs).height() * 2));
		},
		
		focus: function() {
			$("#content > div").hide();
			var wrap = $("#content div.channel-wrap[data-channel=\"" + this.id + "\"]");
			Chatter.Active.channel = this;
			wrap.show();
			setTimeout(function() {
				wrap.find(".message-input").focus();
			}, 1);
			Chatter.vent.trigger('focus:channel', this);
		},
		
		hide: function() {
			var wrap = $("#content div.channel-wrap[data-channel=\"" + this.id + "\"]");
			wrap.hide();
		}
	});	
	return Channel;
});