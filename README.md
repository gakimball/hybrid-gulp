# Hybrid Gulp

A node module that creates hybrid plugins that can function standalone or within a Gulp stream.

## Installation

```bash
npm install hybrid-gulp --save
```

## How it Works

Hybrid Gulp creates plugins that follow this format:

To be used standalone, the plugin is called with `src` and `dest` options:

```js
// Plugin generated with hybrid-gulp
var plugin = require('plugin');

plugin({
  src: 'input/**/*',
  dest: 'output'
}, function() {
  // Callback that runs when all files have been processed
});
```

To be used inside Gulp, the plugin is called *without* `src` or `dest` options:

```js
var plugin = require('plugin');

gulp.src('input/**/*')
  .pipe(plugin())
  .pipe(dest('output'));
```

Internally, your plugin defines a *transform* function which works the exact same in both situations. The transform gets an input file, and returns a modified output file.

## Usage

Hybrid Gulp creates a plugin that accepts one parameter of configuration settings. Two of these settings will be the source and destination settings, named `src` and `dest` by default.

The transform function is a [through2](https://npmjs.com/package/through2) object stream.

```js
var hybrid = require('hybrid-gulp');
var MyLibrary = require('./lib/mylibrary');

module.exports = hybrid({
  transform: function(file, enc, cb, opts) {
    file.contents = new Buffer(MyLibrary.doSomething(file));
    cb(null, file);
  },
  onFinish: function(opts, cb) {
    MyLibrary.cleanupStuff(opts);
    cb();
  }
})
```

### srcOption

- **Type:** String
- **Default:** `'src'`

Configuration setting your plugin uses to take in source files.

### destOption

- **Type:** String
- **Default:** `'dest'`

Configuration setting your plugin uses to set an output folder.

### transform

- **Type:** Function

Function to manipulate input files. It's a through2 object stream that takes these parameters:

- `file` (Object): [Vinyl](https://npmjs.com/package/vinyl) object that corresponds to the current file being transformed. You can get the contents with `file.contents.toString()`.
- `enc` (String): Encoding of the file.
- `cb` (Function): Function to run when processing is done. Call it like `cb(err, file)`, where `err` is an error (or `null` if there was no error), and `file` is a modified Vinyl file.
- `opts` (Object): Options passed to your plugin function.

### onFinish

- **Type:** Function
- **Default:** `null`

Function to run when the plugin finishes processing all files. It takes these parameters:

- `opts` (Object): Options passed to your plugin function.
- `cb` (Function): Function to run when the function is done. Doesn't require any parameters.
