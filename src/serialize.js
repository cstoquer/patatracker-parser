var Step     = require('./Step');
var Pattern  = require('./Pattern');
var Track    = require('./Track');
var Song     = require('./Song');
var Album    = require('./Album');
var encoding = require('./encoding');

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var ENCODING      = encoding.ENCODING;
var COMMAND_COUNT = encoding.COMMAND_COUNT;

// input in the range [0..8649], output as 2 characters
function encode2(value) {
	var be = ~~(value / ENCODING.length);
	var le = value % ENCODING.length;
	return ENCODING[be] + ENCODING[le];
}

function encodeFx(fx, value) {
	return encode2(fx + value * COMMAND_COUNT);
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Step.prototype.serialize = function () {
	var type = ~~(this.note !== null)
		+ (~~(this.inst !== null) << 1)
		+ (~~(this.vol  !== null) << 2)
		+ (~~(this.fx1  !== null) << 3)
		+ (~~(this.fx2  !== null) << 4);

	var note = '';

	if (this.note !== null) {
		if (this.note === -1) {
			type += 32; // 1 << 5
		} else {
			note = encode2(this.note);
		}
	}

	var data = ENCODING[type] + note;

	if (this.inst !== null) data += ENCODING[this.inst];
	if (this.vol  !== null) data += ENCODING[this.vol];
	if (this.fx1  !== null) data += encodeFx(this.fx1, this.fv1);
	if (this.fx2  !== null) data += encodeFx(this.fx2, this.fv2);

	return data;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Pattern.prototype.serialize = function () {
	var steps = '';

	for (var i = 0; i < this.steps.length; i++) {
		steps += this.steps[i].serialize();
	}

	var data = { s: steps };

	if (this.color) data.c = this.color;

	return data;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Track.prototype.serialize = function () {
	var patterns = [];

	for (var i = 0; i < this.patterns.length; i++) {
		patterns.push(this.patterns[i].serialize());
	}

	var data = {
		y: this.synthId,
		p: patterns,
		s: this.sequence.slice(),
	};

	return data;
};


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Song.prototype.serialize = function () {
	var tracks = [];

	for (var i = 0; i < this.tracks.length; i++) {
		tracks.push(this.tracks[i].serialize());
	}

	var effects = [];

	for (var i = 0; i < 4; i++) {
		var effect = this.effects[i];
		if (!effect) {
			effects.push(0);
		} else {
			effects.push({
				i: effect.id,
				p: effect.params // TODO: can it be optimized?
			});
		}
	}

	return {
		n: this.name,
		a: this.author,
		i: this.infos,
		b: this.bpm,
		l: this.patternLength,
		s: this.speed,
		g: this.groove,
		o: this.loop,
		e: effects,
		t: tracks
	};
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Album.prototype.serialize = function () {
	var songs  = [];

	for (var i = 0; i < this.songs.length; i++) {
		songs.push(this.songs[i].serialize());
	}

	return {
		_type: 'Patatracker album',
		t: this.trackCount,
		v: this.version,
		a: this.samples,
		i: this.instruments,
		s: songs
	};
};
