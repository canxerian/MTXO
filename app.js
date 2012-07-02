var express = require("express"),
	nowjs = require("now"),
	app = express.createServer(),
	everyone = nowjs.initialize(app);

// Setup ejs views as default, with .html as the extension
app.set('views', __dirname + '/views');
app.register('.html', require('ejs'));
app.set('view engine', 'html');

// Static file server
app.use(express.static(__dirname + '/public'));

app.listen(3000);

var game = {};
game.players = [];

game.getOpponent = function(myname) {
	for(var i=0; i<this.players.length; i++) {
		if(this.players[i].name != myname) {
			console.log(this.players[i]);
			return this.players[i];
		}
	}
}


// Functions defined on the 'everyone' object are exposed to clients via websockets
nowjs.getGroup('everyone').now.joinGame = function() {
	var	side;
	
	// Instantiate game objects
	everyone.now.game = everyone.now.game || {};
		
	// Name is set client-side
	if(game.players.length == 0) side = 'x';
	else if(game.players.length == 1) side = 'o';
	
	if(game.players.length < 2) {		
		
		// Create a player object, store name and side
		var player = {name: this.now.name, side: side, now: this.now};
		game.players.push(player);
		
		// Make accessible in the browser (var syncing)
		this.now.player = player;
		
		console.log("%s just joined the game :)", this.now.player.name);
		console.log(game.players);
		
		// Join game event emission
		if(typeof this.now.onJoinGame == "function")
			this.now.onJoinGame(player);
		
		console.log("no players", game.players.length)
		
		// Inform players that player 2 has joined
		if(game.players.length == 2)
			game.players[0].now.onOpponentJoin(player);
	
	} else {
		// Spectate game
		if(typeof this.now.onSpectateGame == "function")
			this.now.onSpectateGame();
	}
}

everyone.now.makeMove = function(grid) {
	// change the active player
	everyone.now.lastMove = this.now.player.side;
	console.log("Make move", grid, everyone.now.lastMove, this.now.player.name)
	
	// Game winning logic here
	if(isWinningMove(grid)) {
		this.now.onWon();
	
		var opponent = game.getOpponent(this.now.player.name)
		opponent.now.onLost();
	}
	
	// Syncing
	if(typeof everyone.now.onMove == "function")
		everyone.now.onMove(grid);
}

nowjs.getGroup('everyone').now.getPlayers = function(cb) {
	console.log("Get players", game.players);
	if(typeof cb === "function") {
		cb(game.players);
	}
}

nowjs.on('disconnect', function() {
	console.log("%s just left the game :(", this.now.player.name);
	
	// Remove player from players array
	for(var i = 0; i < game.players.length; i++) {
		if(game.players[i].name == this.now.name) {
			game.players.splice(i);
			this.now.game
		}
	}
	
	console.log(game.players)
	
	if(typeof this.now.onPlayerLeave == "function")
		this.now.onPlayerLeave(this.now.name);
		
	if(typeof this.now.onSpectatorLeave == "function")
		this.now.onSpectatorLeave(this.now.name);
});

app.get('/', function(req, res, next) {
	res.render('index');
});

function isWinningMove(grid) {
	return (
		// line across
		compare(grid[0].player, grid[1].player, grid[2].player) ||
		compare(grid[3].player, grid[4].player, grid[5].player) ||  
		compare(grid[6].player, grid[7].player, grid[8].player) ||
		
		// line down
		compare(grid[0].player, grid[3].player, grid[6].player) || 
		compare(grid[1].player, grid[4].player, grid[7].player) ||  
		compare(grid[2].player, grid[5].player, grid[8].player) ||
	
		// diags
		compare(grid[0].player, grid[4].player, grid[8].player) || 
		compare(grid[6].player, grid[4].player, grid[2].player)
	);
}

function compare(s1, s2, s3) {
	return (s1 == s2 && s2 == s3);
}