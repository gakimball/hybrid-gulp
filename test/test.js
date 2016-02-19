var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');
var reverser = require('./fixtures/module');
var rimraf = require('rimraf');
var vfs = require('vinyl-fs');

var INPUT = './test/fixtures/input.txt';
var OUTPUT = './test/fixtures/_build';

describe('Hybrid Gulp', function() {
  afterEach(function(done) {
    rimraf(OUTPUT, done);
  });

  it('works as a file-based plugin if src and dest options are given', function(done) {
    reverser({ src: INPUT, dest: OUTPUT, reverse: true }, function() {
      checkFile(done);
    });
  });

  it('works as a stream-based plugin if src and dest options are omitted', function(done) {
    vfs.src(INPUT)
      .pipe(reverser({ reverse: true }))
      .pipe(vfs.dest(OUTPUT))
      .on('finish', function() {
        checkFile(done);
      })
  });
});

function checkFile(done) {
  fs.readFile(path.join(OUTPUT, 'input.txt'), function(err, data) {
    if (err) throw err;
    expect(data.toString()).to.contain('esrever');
    done();
  });
}
