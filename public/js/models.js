var Models = {
	GridItem: Backbone.Model.extend({
	// Everyone receives this (players + spectators)
		defaults: {
			player: '',	// X or O¤
		}
	}),
	
	Player: Backbone.Model.extend({
		initialize: function() {
			if(!this.get("name") || !this.get("side")) {
				throw new Error("Can't instantiate a Player model without a name or side attribute");
			}
		}
	})
}

var Collections = {
	Grid: Backbone.Collection.extend({
		model: Models.GridItem
	}),
	
	Players: Backbone.Collection.extend({
		model: Models.Player,
		
		sync: function(method, model, options) {
			if(method == "read") {
				var self = this;
				// Grab the players collection
				now.getPlayers(function(players) {
					for(var i = 0; i < players.length; i++)
						self.push({name: players[i].name, side: players[i].side});
				});
			}
		}
	})
}
