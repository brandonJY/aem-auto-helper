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
	
	var appOutputPath = path.join(globalConfig['srcBase'],
								  globalConfig['appPath'],
								  componentConfig['componentNodeName']
								  );
	var listFile={
					'appXml':
							{
					          	'sampleSrcPath':sampleBasePath+'/app/*.xml',
					        	'outputPath':appOutputPath
							 },
					'html':
							{
						      	'sampleSrcPath':sampleBasePath + '/app/component.html',
						    	'outputPath':appOutputPath,
						    	'config':{'javaUseClass':componentConfig['bundlePackageName']+'.'+componentConfig['componentNodeName']},
						    	'renameFile':componentConfig['componentNodeName'] + '.html'
							},
					'createJavaUseClass':
							{
								'sampleSrcPath':sampleBasePath + '/bundle/Component-java.txt',
						    	'outputPath':path.join(globalConfig['srcBase'].toString(),
									 					globalConfig['bundlePath'].toString(),
									 					componentConfig['bundlePackageName'].toString().replace(/\./g, "/")
									 				  ),
						    	'renameFile':componentConfig['componentNodeName'] + '.java'
							},
					'createJunit':
					{
						'sampleSrcPath':sampleBasePath + '/bundle/Component-junit.txt',
				    	'outputPath':path.join(globalConfig['srcBase'].toString(),
							 					globalConfig['bundleTestPath'].toString(),
							 					componentConfig['bundlePackageName'].toString().replace(/\./g, "/")
							 				  ),
		 				'config':{'javaClassName':componentConfig['componentNodeName'] + 'Test'},
				    	'renameFile':componentConfig['componentNodeName'] + 'Test.java'
					}
							
				};
	
	for (var p in listFile) {
		if(componentConfig[p]!==undefined&&componentConfig[p]==false) {}
		else{
				var oneSet=listFile[p];
				
				var config=componentConfig;
				if(oneSet['config']) {
					for(var c in oneSet['config'])
						config[c]=oneSet['config'][c];
				}
				oneSet['config']=config;	
				
				console.log(p + '=' + oneSet['sampleSrcPath']);
				generateFromSample(oneSet['sampleSrcPath'], oneSet['config'],
									oneSet['outputPath'], oneSet['renameFile']
								  );
			}
	}
	
});
gulp.task('watch', function() {
  var watcher=gulp.watch('component-config.json',['component-creator']);
  /*
  watcher.on('change', function(event) {
  });
  */
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
			if(renameFile!==undefined&&renameFile.length>0)
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
