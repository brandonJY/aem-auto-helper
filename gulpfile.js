var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var fs = require('fs');
var path=require('path');
var concat = require('gulp-concat');
var replace = require('gulp-replace');

var globalConfig = require('./config/project-global.json');


gulp.task('component-creator', function(){
	var componentConfig = require('./config/component-config.json');
	var sampleBasePath='sample-data/component';
	
	if(componentConfig['overwriteExist']==true) console.log('overwrite Mode on');
	
	/*
	 * Generate app/component.html app/.content.xml
	 */
	var appOutputPath = path.join(globalConfig['srcBase'].toString(),
								  globalConfig['appPath'].toString(),
								  componentConfig['componentNodeName'].toString());
	console.log('appOutputPath='+appOutputPath);
	generateFromSample(sampleBasePath+'/app/*.xml',componentConfig,appOutputPath);
	
	var javaUseClassPath=componentConfig['bundlePackageName']+"."+componentConfig['componentNodeName'];
	var replaceList=componentConfig;
	replaceList['javaUseClass']=javaUseClassPath;
	generateFromSample(sampleBasePath + '/app/component.html', replaceList,
						appOutputPath, componentConfig['componentNodeName'] + '.html');
			

	/*
	 * Generate bundle/src/component.java
	 */
	var bundleOutputPath = path.join(globalConfig['srcBase'].toString(),
									 globalConfig['bundlePath'].toString(),
									 componentConfig['bundlePackageName'].toString().replace(/\./g, "/"));
	console.log('bundleOutputPath='+bundleOutputPath);
	generateFromSample(sampleBasePath + '/bundle/Component-java.txt',
						componentConfig, bundleOutputPath,
						componentConfig['componentNodeName'] + '.java');
		
});
gulp.task('watch', function() {
  var watcher=gulp.watch('gulpfile.js');
  watcher.on('change', function(event) {
     del('output-sample/*');
  });
});

gulp.task('default', ['component-creator'], function() {
   
});
function generateFromSample(samplePath,config,outputPath,renameFile){
	if(config['overwriteExist']!=true&&fs.existsSync(outputPath)){
		console.log(outputPath+' already existed. abort');
	}else{
			if(config['overwriteExist']==true&&fs.existsSync(outputPath)){
				//console.log(outputPath+' already existed. Overwriting');
				//del(outputPath+"/*");
			}
			var stream=gulp.src(samplePath,{ dot:true });
			replaceWithValueInConfig(stream,config);
			if(renameFile)
				stream.pipe(concat(renameFile))
				.pipe(gulp.dest(outputPath));
			else stream.pipe(gulp.dest(outputPath));
	}
	
}
function replaceWithValueInConfig(stream,config) {
	for (var p in config) {
	   //console.log(p);
		if(config[p].length>0)
			stream.pipe(replace('[['+p+']]', config[p]));
	}
}
function writeToFile (filename, string) {
	//writeToFile(componentName+".html", fileContent)
  var src = require('stream').Readable({ objectMode: true })
  src._read = function () {
    this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }))
    this.push(null)
  }
  return src
}
