/**
 * node-arecord
 * Javascript ALSA arecord wrapper for Node.js
 *
 * @author
 * @originalAuthors Patrik Melander (lotAballs) / Maciej Sopyło @ KILLAHFORGE.
 *
 * MIT License
 */

var	spawn = require('child_process').spawn,
   events = require('events'),
     util = require('util');

module.exports = function Sound(options) {
  events.EventEmitter.call(this);
  options = options || {};
  this.debug = options.debug || false;
  this.destination_folder = options.destination_folder || 'tmp';
  this.filename = options.filename;
  this.alsa_format = options.alsa_format || 'dat';
  this.alsa_device = options.alsa_device || 'plughw:1,0';
  this.alsa_addn_args = options.alsa_addn_args || [];
  this.alsa_channels = options.alsa_channels || '1';
  this.alsa_rate = options.alsa_rate || '8000';
};

util.inherits(module.exports, events.EventEmitter);

module.exports.prototype.record = function () {
  this.stopped = false;
  this.process = spawn('arecord', ['-D', this.alsa_device, '-f', this.alsa_format, '-c', this.alsa_channels, '-r', this.alsa_rate]
    .concat(this.alsa_addn_args).concat(this.filename), {cwd: this.destination_folder});
  var self = this;
  this.process.on('exit', function (code, sig) {
    if (code !== null && sig === null) {
      self.emit('complete');
    }
  });

  if (this.debug) {
    this.process.stdout.on('data', function (data) {
      console.log('Data: ' + data);
    });
    this.process.stderr.on('data', function (data) {
      console.log('Error: ' + data);
    });
    this.process.on('close', function (code) {
      console.log('arecord closed: ' + code);
    });
  }

};
module.exports.prototype.stop = function () {
  this.stopped = true;
  this.process.kill('SIGTERM');
  this.emit('stop');
};
module.exports.prototype.pause = function () {
  if (this.stopped) return;
  this.process.kill('SIGSTOP');
  this.emit('pause');
};
module.exports.prototype.resume = function () {
  if (this.stopped) return this.record();
  this.process.kill('SIGCONT');
  this.emit('resume');
};
