var ENCODING = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&'()*+,-~/:;<=>?@[]^_`{|}. !";
var INVERSE = {};
for (var i = 0; i < ENCODING.length; i++) INVERSE[ENCODING[i]] = i;

exports.ENCODING = ENCODING;
exports.INVERSE  = INVERSE;
exports.COMMAND_COUNT = 32;
