var Song = require('./Song');

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Album() {
	this.version     = 0;
	this.trackCount  = 8;
	this.instruments = {}; // instruments by synth id  TODO: convert to array
	this.songs       = []; // array of Song instances
	this.samples     = []; // array of sound uri
	this.path        = ''; // path of the file on disc
}

module.exports = Album;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Album.prototype.deserialize = function (data) {
	var version = data.v || 0;
	var songs   = data.s || [];

	this.version     = version;
	this.trackCount  = data.t;
	this.songs       = [];
	this.instruments = data.i;
	this.samples     = data.a;

	for (var i = 0; i < songs.length; i++) {
		var song = new Song(this, i);
		song.deserialize(songs[i]);
		this.songs.push(song);
	}
};
