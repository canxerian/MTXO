// Collections
var grid = new Collections.Grid();
var players = new Collections.Players();
var spectators = new Backbone.Collection();

// Views
var board = new Views.BoardView({el: $("#xo-board"), collection: grid});

// New grid
grid.reset([
	{player: 0}, {player: 1}, {player: 2},
	{player: 3}, {player: 4}, {player: 5},
	{player: 6}, {player: 7}, {player: 8},
]);


now.name = prompt("What's your name?", "");

now.ready(function() {
	players.fetch();
	// Server side should emit group size. If more than two, enter spectator mode
	now.joinGame();
});


// Players collection 'add' listener
players.bind("add", function() {
	if(this.length == 1) {
		// Player 1 takes blue
		new Views.PlayerView({model: this.at(0), el: $('#blue-corner')});
		
		// Display waiting..
		$('#flash').html("Waiting for opponent..");
	}
	else if(players.length == 2) {
		// Player 2 takes red
		new Views.PlayerView({model: this.at(1), el: $('#red-corner')});	
		
		// Display ready!
		$('#flash').html("Game ready!");
	}
}, players);


now.onJoinGame = function(you) {
	
	if(players.length == 2)	
		throw new Error("No more free slots!");	
	
	else
		players.push(new Models.Player({name: you.name, side: you.side}));
}

now.onOpponentJoin = function(player) {
	console.log("onOpponentJoin", player)
	players.push({name: player.name, side: player.side});
}

now.onMove = function(gridData) {
	for(var i = 0; i < gridData.length; i++){
		grid.at(i).set({player: gridData[i].player});
	}
}

now.onWon = function() {
	$('#game-modal').find('h2').html('Congratulations!')
	$('#game-modal').find('p').html('You won!')
	$('#game-modal').reveal();
}

now.onLost = function() {
	$('#game-modal').find('h2').html('Unlucky')
	$('#game-modal').find('p').html('Better luck next time!')
	$('#game-modal').reveal();
}

now.onPlayerLeave = function(name) {
	console.log(name + " has left the game");
}

now.onSpectatorLeave = function(name) {
	spectators.push({name: name});
}