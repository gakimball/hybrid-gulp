var extend = require('util')._extend;
var through = require('through2');
var vfs = require('vinyl-fs');

/**
 * Defaults for plugin definitions.
 * @constant
 * @prop {String} srcOption - Option the user passes to the plugin to define source files.
 * @prop {String} destOption - Option the user passes to the plugin to define destination directory.
 * @prop {Function} transform - Stream function run to transform files.
 * @prop {Function} onFinish - Optional callback to run when all files have been transformed.
 */
var DEFAULTS = {
  srcOption: 'src',
  destOption: 'dest',
  transform: function(file, enc, cb) {
    cb(null, file);
  },
  onFinish: null
}

/**
 * Create a hybrid plugin that can work standalone or within a Gulp stream.
 * @param {Object} config - Configuration settings.
 * @returns {Function} Plugin function.
 */
module.exports = function(config) {
  config = extend(DEFAULTS, config || {});

  /**
   * Plugin created by hybrid-gulp.
   * @param {Object} opts - Options passed by the developer to the plugin.
   * @param {Function} cb - Callback to run when the plugin is finished working. If the plugin is being used in a stream, this function is not called.
   * @returns {}
   */
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
    // Otherwise, it's already a stream, so just return the transform function
    else {
      return transform();
    }

    /**
     * Function to transform files passed to the plugin. If the plugin is being called in a stream, this function is returned as-is. If the plugin is being called standalone, an ad-hoc stream is created and the input files are piped to this function.
     * If a plugin defines an `onFinish` callback (through `opts.onFinish`), it will be run when all files have been processed.
     * @returns {stream.Transform} Transform stream function that modifies files.
     */
    function transform() {
      return through.obj(function(file, enc, cb) {
        return config.transform(file, enc, cb, opts);
      }, function(cb) {
        if (typeof config.onFinish === 'function') config.onFinish(opts, cb);
        else cb();
      });
    }
  }
}
