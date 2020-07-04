var Pattern = require('./Pattern');

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Track(song, index) {
	this.index       = index;
	this.song        = song;  // reference to parent songData instance
	this.synthId     = 0;     // synth id
	this.patterns    = [];    // array of pattern
	this.sequence    = [];    // array of int, as index to patterns. -1 means empty
}

module.exports = Track;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Track.prototype.getPatternAtIndex = function (index) {
	var length = this.song.length;

	if (index >= length) {
		var loop = this.song.loop;
		index = ((index - loop) % (length - loop)) + loop;
	}

	if (index > this.sequence.length) return this.song.emptyPattern;

	var patternIndex = this.sequence[index];
	if (patternIndex === -1) return this.song.emptyPattern;
	return this.patterns[patternIndex];
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Track.prototype.getInstruments = function () {
	return this.song.album.instruments[this.synthId];
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Track.prototype.deserialize = function (data) {
	this.synthId  = data.y || 0;
	this.sequence = data.s;
	this.patterns = [];

	var patterns = data.p;
	var patternLength = this.song.patternLength;

	for (var i = 0; i < patterns.length; i++) {
		var pattern = new Pattern(patternLength);
		pattern.deserialize(patterns[i]);
		this.patterns.push(pattern);
	}
};
