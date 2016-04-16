var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var fs = require('fs');
var path=require('path');
var replace = require('gulp-replace');

var globalConfig = require('./config/project-global.json');


gulp.task('component-creator', function(){
	var componentConfig = require('./config/component-config.json');
	var outputPath = path.join(globalConfig['srcBase'].toString(),globalConfig['appPath'].toString(),componentConfig['componentNodeName'].toString());
	
	if (false) { //fs.exists(outputPath)
		console.log(outputPath+" already existed. abort");
	}else{
	        var stream=gulp.src('sample-data/component/*',{ dot:true });
		configReplace(stream,componentConfig);	
		//writeToFile(componentName+".html", fileContent)
		stream.pipe(gulp.dest(outputPath));
	}
});
gulp.task('watch', function() {
  var watcher=gulp.watch('gulpfile.js');
  watcher.on('change', function(event) {
     del('output-sample/*');
  });
});

gulp.task('default', ['component-creator','watch'], function() {
   
});

function configReplace(stream,config) {
	for (var p in config) {
	   console.log(p);
	   stream.pipe(replace('[['+p+']]', config[p]));
	}


 return stream;
};
function writeToFile (filename, string) {
  var src = require('stream').Readable({ objectMode: true })
  src._read = function () {
    this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }))
    this.push(null)
  }
  return src
}
