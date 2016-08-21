var hybrid = require('../..');
var r;

function Reverser(opts) {
  this.rev = opts.reverse || false;
}

Reverser.prototype.reverse = function(str) {
  if (!this.rev) return str;
  return str.split('').reverse().join('');
}

module.exports = hybrid({
  srcOption: 'src',
  destOption: 'dest',
  transform: function(file, enc, cb, opts) {
    if (typeof r === 'undefined') r = new Reverser(opts);
    file.contents = new Buffer(r.reverse(file.contents.toString()));
    cb(null, file);
  },
  onFinish: function(opts, cb) {
    if (typeof opts.onFinish === 'function') opts.onFinish();
    cb();
  },
  callback: true
});
