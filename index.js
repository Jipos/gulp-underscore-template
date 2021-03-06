'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var _ = require('underscore');
var PluginError = gutil.PluginError;

var PLUGIN_NAME = 'gulp-underscore-compile';

module.exports = function (options) {
    options = options || {};

    function compiler (file) {
        var name = typeof options.name === 'function' && options.name(file) || file.relative;
        var html = file.contents.toString();
        var template = _.template(html).source;
        var exportName = options.exportName || exports;
        var extension = options.extension || 'html';

        return exportName + "['" + name.replace(new RegExp('\.' + extension + '?$'), '').replace(/\\/g, '/') + "']=" + template + ';';
    }

    return through.obj(function (file, enc, callback) {

        if (file.isNull()) {
            this.push(file);
            return callback();
        }

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return callback();
        }

        var filePath = file.path;

        try {
            var compiled = compiler(file);

            file.contents = new Buffer(compiled);
            file.path = gutil.replaceExtension(file.path, '.js');
        } catch (err) {
            this.emit('error', new PluginError(PLUGIN_NAME, err, {fileName: filePath}));
            return callback();
        }

        this.push(file);
        callback();
    });
};
