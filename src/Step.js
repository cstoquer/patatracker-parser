var commands      = require('./commands');
var encoding      = require('./encoding');
var ENCODING      = encoding.ENCODING;
var INVERSE       = encoding.INVERSE;
var COMMAND_COUNT = encoding.COMMAND_COUNT;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function decode2(be, le) {
	return INVERSE[be] * ENCODING.length + INVERSE[le];
}

function decodeFx(be, le, step, id) {
	var value = decode2(be, le);
	step['fx' + id] = value % COMMAND_COUNT;
	step['fv' + id] = ~~(value / COMMAND_COUNT);
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Command(id, value, x, y) {
	this.id    = id;
	this.value = value;
	this.x     = x; // high byte of command value
	this.y     = y; // low byte of command value
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Step(index) {
	this.index   = index; // integer - step index in the pattern
	this.isEmpty = true;
	this.next    = null;  // reference to the next step

	this.note = null; // integer - MIDI note number, or -1 for note end
	this.inst = null; // integer - instrument index
	this.vol  = null; // integer - note volume (0 - 15)
	this.fx1  = null; // integer - fx command id
	this.fx2  = null; // integer - fx command id
	this.fv1  = 0;    // integer - fx command raw value
	this.fv2  = 0;    // integer - fx command raw value

	this.fxPrev = [];
	this.fxPost = [];

	this.startDelay = 0; // a fraction that needs to be multiplied by step duration
	this.stopDelay  = 0; // a fraction that needs to be multiplied by step duration
}

module.exports = Step;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Step.prototype._pushCommand = function (id, value) {

	if (id === commands.NOTE_DELAY) {
		this.startDelay = value / 256;
		return;
	}

	if (id === commands.MUTE_DELAY) {
		this.stopDelay = value / 256;
		return;
	}

	var x = value >> 4;
	var y = value & 15;

	var command = new Command(id, value, x, y);

	if (id === commands.SLIDE) {
		this.fxPrev.push(command);
	} else {
		this.fxPost.push(command);
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Step.prototype.updateData = function () {
	this.isEmpty = !(
		this.note !== null ||
		this.inst !== null ||
		this.vol  !== null ||
		this.fx1  !== null ||
		this.fx2  !== null
	);

	this.fxPrev = [];
	this.fxPost = [];
	this.startDelay = 0;
	this.stopDelay  = 0;

	// nota: fx1 override fx2
	if (this.fx2 !== null) this._pushCommand(this.fx2, this.fv2);
	if (this.fx1 !== null) this._pushCommand(this.fx1, this.fv1);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Step.prototype.deserialize = function (data, offset) {
	this.note = null;
	this.inst = null;
	this.vol  = null;
	this.fx1  = null;
	this.fx2  = null;

	var type = INVERSE[data[offset++]];

	var haveNote = type & 1;
	var haveInst = (type >> 1) & 1;
	var haveVol  = (type >> 2) & 1;
	var haveFx1  = (type >> 3) & 1;
	var haveFx2  = (type >> 4) & 1;

	if (haveNote) {
		var isStop = (type >> 5) & 1;
		if (isStop) {
			this.note = -1;
		} else {
			this.note = decode2(data[offset++], data[offset++]);
		}
	}

	if (haveInst) this.inst = INVERSE[data[offset++]];
	if (haveVol)  this.vol  = INVERSE[data[offset++]];
	if (haveFx1)  decodeFx(data[offset++], data[offset++], this, 1);
	if (haveFx2)  decodeFx(data[offset++], data[offset++], this, 2);

	this.updateData();

	return offset;
};
