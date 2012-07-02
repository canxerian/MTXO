var Views = {
	/**
	 * Board Item View
	 */
	BoardItemView: Backbone.View.extend({
		tagName: "li",
		
		initialize: function() {
			this.model.bind("change", this.update, this);
			this.model.bind("reset", this.render, this);
		},
		
		events: {
			"click": "move"
		},
		
		update: function() {
			this.$el.html(this.model.get("player"));
		},
		
		render: function() {
		
		},
		
		move: function() {
			// If this is not set, then it is the first go. First come first serve :)
			// Or if last move was the other player
			if(!now.lastMove || now.lastMove != now.player.side) {
				if(this.model.get("player") != "x" || this.model.get("player") != "o") {
					this.model.set({player: now.player.side});
					now.makeMove(this.model.collection.toJSON());
				}
				return false;
			}
			else
				alert("Please wait your turn");
		}
	}),
	
	/**
	 * Board Collection View
	 */
	BoardView: Backbone.View.extend({
		// listen to model changes
		// update GUI
		initialize: function() {
			if (this.collection) {
			    this.collection.bind("reset", this.render, this);
			}
			
			console.log("Board view collection:", this.collection)
		},
		
		render: function() {
			this.$el.empty();
		
			var self = this;
			this.collection.each(function(item, index) {
				var item = new Views.BoardItemView({model: item});
				self.$el.append(item.el);
			});
		}
	}),
	
	PlayerView: Backbone.View.extend({
		initialize: function() {
			if(this.model) {
				this.render();
				this.model.bind("change", this.update, this);
			} else {
				throw new Error("Can't instantiate a PlayerView without a Player model");
			}
		},
		
		render: function() {
			// Render in to this.$el the player's name		
			this.$el.find('h4').after("<h4>" + this.model.get("name") + "</h4>")
		},
		
		update: function() {
			// Update with the score
		}
	})
}