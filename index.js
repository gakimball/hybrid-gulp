var extend = require('util')._extend;
var through = require('through2');
var vfs = require('vinyl-fs');

var DEFAULTS = {
  srcOption: 'src',
  destOption: 'dest',
  transform: function(file, enc, cb) {
    cb(null, file);
  }
}

/**
 * Create a hybrid plugin that can work standalone or within a Gulp stream.
 * @param {object} config - Configuration settings.
 * @returns {function} Plugin function.
 */
module.exports = function(config) {
  config = extend(DEFAULTS, config || {});

  return function(opts, cb) {
    // Initial setup
    opts = opts || {};
    var stream;

    // If a src option is provided, create a stream out of the files
    if (opts[config.srcOption]) {
      stream = vfs
        .src(opts[config.srcOption])
        .pipe(transform());

      // If a dest option is provided, pipe the stream to disk
      if (opts[config.destOption]) {
        stream
          .pipe(vfs.dest(opts[config.destOption]))
          .on('finish', function() {
            if (typeof cb === 'function') cb();
          });
      }
    }
    // Otherwise, it's already a stream, so just return the transform
    else {
      return transform();
    }

    function transform() {
      return through.obj(function(file, enc, cb) {
        return config.transform(file, enc, cb, opts);
      })
    }
  }
}
