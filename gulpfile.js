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
	if(componentConfig['clientLibName'].length<=0)
		componentConfig['clientLibName']= globalConfig['projectName']+'.'+componentConfig['componentNodeName'];
	
	var javaUseClass=componentConfig['componentNodeName'].substr(0,1).toUpperCase()+componentConfig['componentNodeName'].substr(1);
	var listFile={
					'appXml':
							{
					          	'sampleSrcPath':sampleBasePath+'/app/*.xml',
					        	'outputPath':appOutputPath
							 },
					'html':
							{
						      	'sampleSrcPath':sampleBasePath + '/app/component.html',
						      	'config':{'javaUseClass':componentConfig['bundlePackageName']+'.'+javaUseClass},
						      	'outputPath':appOutputPath,
						    	'renameFile':componentConfig['componentNodeName'] + '.html'
							},
					'createClientLib':
							{
					          	'sampleSrcPath':sampleBasePath+'/etc/clientlib/*',
					        	'outputPath':path.join(globalConfig['srcBase'],
														  globalConfig['etcPath'],
														  componentConfig['componentNodeName']
														 )
							 },
					'createJavaUseClass':
							{
								'sampleSrcPath':sampleBasePath + '/bundle/Component-java.txt',
						    	'outputPath':path.join(globalConfig['srcBase'],
									 					globalConfig['bundlePath'],
									 					componentConfig['bundlePackageName'].replace(/\./g, "/")
									 				  ),
				 				'config' : { 'javaClassName' : javaUseClass},
						    	'renameFile':javaUseClass+ '.java'
							},
					'createJunit':
					{
						'sampleSrcPath':sampleBasePath + '/bundle/Component-junit.txt',
						'config' : {
										'javaClassName' : javaUseClass+ 'Test',
										'targetTestClassPath': componentConfig['bundlePackageName']+'.'+javaUseClass,
										'targetClassName':javaUseClass,
										'classVar':componentConfig['componentNodeName'].substr(0,1).toLocaleLowerCase()+
												   componentConfig['componentNodeName'].substr(1)
									},
						'outputPath':path.join(globalConfig['srcBase'],
							 					globalConfig['bundleTestPath'],
							 					componentConfig['bundlePackageName'].replace(/\./g, "/")
							 				  ),
				    	'renameFile':javaUseClass+ 'Test.java'
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
				
				if(config['targetPath'][p]['outputPath'].length>0)
					oneSet['outputPath']=config['targetPath'][p]['outputPath'];
				
				console.log(p + '=' + oneSet['outputPath']);
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
