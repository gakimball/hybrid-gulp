var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');
var reverser = require('./fixtures/module');
var reverserCallback = require('./fixtures/module-callback');
var rimraf = require('rimraf');
var sinon = require('sinon');
var vfs = require('vinyl-fs');

var INPUT = './test/fixtures/input.txt';
var OUTPUT = './test/fixtures/_build';

describe('Hybrid Gulp', function() {
  afterEach(function(done) {
    rimraf(OUTPUT, done);
  });

  it('works as a standalone plugin if src and dest options are given', function(done) {
    reverser({ src: INPUT, dest: OUTPUT, reverse: true }).then(function() {
      checkFile(done);
    });
  });

  it('works as a stream-based plugin if src and dest options are omitted', function(done) {
    vfs.src(INPUT)
      .pipe(reverser({ reverse: true }))
      .pipe(vfs.dest(OUTPUT))
      .on('finish', function() {
        checkFile(done);
      });
  });

  it('allows for a function to be run when all files are finished processing', function(done) {
    var onFinish = sinon.spy();

    reverser({ src: INPUT, dest: OUTPUT, reverse: true, onFinish: onFinish }).then(function() {
      expect(onFinish.calledOnce).to.be.true;
      done();
    });
  });

  it('allows for a plugin to use callbacks instead of promises', function(done) {
    reverserCallback({ src: INPUT, dest: OUTPUT, reverse: true }, function() {
      checkFile(done);
    });
  });
});

function checkFile(done) {
  fs.readFile(path.join(OUTPUT, 'input.txt'), function(err, data) {
    if (err) throw err;
    expect(data.toString()).to.contain('esrever');
    done();
  });
}
