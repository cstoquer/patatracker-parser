var Pattern = require('./Pattern');
var Track   = require('./Track');

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Song(album, index) {
	this.album         = album;
	this.index         = index;
	this.name          = 'untitled';
	this.author        = '';
	this.infos         = '';
	this.bpm           = 130;  // tempo in beats per minutes
	this.patternLength = 32;   // how many steps per pattern
	this.speed         = 4;    // how many steps in one beat
	this.groove        = [];   // groove/swing pattern
	this.loop          = 0;    // which pattern to loop when reaching the end
	this.length        = 0;    // length of the song in pattern count
	this.tracks        = [];
	this.effects       = [];
	this.emptyPattern  = null;

	var trackCount = album.trackCount;

	for (var i = 0; i < trackCount; i++) {
		var track = new Track(this, i);
		this.tracks.push(track);
	}
}

module.exports = Song;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Song.prototype.deserialize = function (data) {
	this.name          = data.n || '';
	this.author        = data.a || '';
	this.infos         = data.i || '';
	this.bpm           = data.b;
	this.patternLength = data.l;
	this.speed         = data.s;
	this.groove        = data.g;
	this.loop          = data.o || 0;

	this.emptyPattern = new Pattern(this.patternLength);
	this.emptyPattern.frozen = true;

	var tracks = data.t;
	this.length = 0;
	for (var i = 0; i < tracks.length; i++) {
		var track = this.tracks[i];
		track.deserialize(tracks[i]);
		this.length = Math.max(this.length, track.sequence.length);
	}

	var effects = data.e || [];
	this.effects = [];
	for (var i = 0; i < 4; i++) {
		var effect = effects[i];
		if (!effect) {
			this.effects.push(null);
		} else {
			this.effects.push({
				id:     effect.i || 0,
				params: effect.p || {}
			});
		}
	}
};
