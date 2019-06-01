var _ = require('lodash');
var exec = require('child_process').exec;
var crypto = require('crypto');
var Q = require('q');

var speaker = (function() {
    /* DEFAULT CONFIG */
    var CONFIG = {
        AUDIO_DEVICE: null,
        LANGUAGE: 'en-US'
    };
    var lastText = '';
    return {
        init: function (props) {
            if(props) {
                _.assign(CONFIG, props);
            }
        },
        speak: function(text) {
            var deferred = Q.defer();

            var md5 = crypto.createHash('md5');
            var fileName = '/tmp/' + md5.update(text).digest('hex') + '.wav';

            if(CONFIG.AUDIO_DEVICE) {
                var cmd = 'pico2wave -l ' + CONFIG.LANGUAGE + ' -w ' + fileName + ' " ' + text + '" && aplay -D ' + CONFIG.AUDIO_DEVICE + ' ' + fileName;
            } else {
                var cmd = 'pico2wave -l ' + CONFIG.LANGUAGE + ' -w ' + fileName + ' " ' + text + '" && aplay ' + fileName;
            }
            exec(cmd, function(error) {
                // command output is in stdout
                if(error) {
                    console.log('error while executing command ', cmd);
                }
                lastText = text;
                deferred.resolve();
            });
            return deferred.promise;
        },
        exportText: function(text,filepath) {
            var deferred = Q.defer();
            var fileName = filepath;

            var cmd = 'pico2wave -l ' + CONFIG.LANGUAGE + ' -w ' + fileName + ' " ' + text + '"';
            exec(cmd, function(error) {
                // command output is in stdout
                if(error) {
                    console.log('error while executing command ', cmd);
                }
                lastText = text;
                deferred.resolve();
            });
            return deferred.promise;
        },
        exportFile: function(fileToExport,filepath) {
            var deferred = Q.defer();
            var fileName = filepath;

            var cmd = 'pico2wave -l ' + CONFIG.LANGUAGE + ' -w ' + fileName + ' -i ' + fileToExport;
            exec(cmd, function(error) {
                // command output is in stdout
                if(error) {
                    console.log('error while executing command ', cmd);
                }
                deferred.resolve();
            });
            return deferred.promise;
        },
        repeat: function() {
            this.speak(lastText);
        },
        shutUp: function() {
            var deferred = Q.defer();
            var cmd = 'killall aplay';
            exec(cmd, function(error, stdout, stderr) {
                // command output is in stdout
                if(error) {
                    console.log('error while executing command ', cmd);
                }
                deferred.resolve();
            });
            return deferred.promise;
        }
    };
})();

module.exports = speaker;
