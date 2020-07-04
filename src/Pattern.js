var Step = require('./Step');

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Pattern(length) {
	this.color  = 0,
	this.steps  = [];
	this.frozen = false; // if true, the pattern can not be edited.

	for (var i = 0; i < length; i++) {
		var step = new Step(i);
		this.steps.push(step);
	}
}

module.exports = Pattern;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Pattern.prototype.relinkSteps = function () {
	var currentStep = null;

	for (var i = this.steps.length - 1; i >= 0; i--) {
		var step = this.steps[i];

		if (step.stopDelay) {
			var stopStep = new Step(step.index);

			stopStep.note = -1;
			stopStep.startDelay = step.stopDelay;
			stopStep.next = currentStep;

			step.next = stopStep;
		} else {
			step.next = currentStep;
		}

		if (step.isEmpty) continue;
		currentStep = step;
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Pattern.prototype.deserialize = function (data) {
	this.color = data.c || 0;
	var steps = data.s;

	var offset = 0;
	for (var i = 0; i < this.steps.length; i++) {
		offset = this.steps[i].deserialize(steps, offset);
	}

	this.relinkSteps();
};
