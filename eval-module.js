"use strict"

var
  crypto= require( "crypto"),
  fs= require( "fs"),
  memoizee= require( "memoizee"),
  path= require( "path"),
  promisify= require( "es6-promisify"),
  tmp= require( "tmp")

var
  rmdir= promisify( fs.rmdir),
  tmpFile= promisify( tmp.file),
  tmpDir= promisify( tmp.dir),
  unlink= promisify( fs.unlink),
  writeFile= promisify( fs.writeFile)

var
  secret= "eval-module",
  dirOptions= {
	mode: 750,
  },
  writeOptions= {
	mode: 0o640
  }

var knownDirs= []
var knownFiles= []

var evalModule= memoizee(function( source, name, dir){
	if( !name){
		name= hashes( source)
	}
	return paths( name, dir).then( function( path){
		return writeFile( path, source, writeOptions).then(function(){
			return require(path)
		})
	})
})
var paths= memoizee(function( name, dir){
	if( dir){
		return dirs( dir).then( function( dirName){
			return dirName + path.sep + name
		})
	}else{
		var file= tmpFile( name)
		knownFiles.push( file)
		return file
	}
})
var hashes= memoizee( function( source){
	return crypto
	  .createHmac( "sha256", secret)
	  .update( source)
	  .digest( "hex")
})
var dirs= memoizee(function( dir){
	var
	  options= Object.assign({ prefix: dir + "_"}, dirOptions)
	  tmp= tmpDir( options)
	knownDirs.push( tmp)
	return tmp
})

function directory( dir){
	return {
		evalModule: function( code, name){
			evalModule( code, name, dir)
		}
	}
}

/** install lifecycle events */
function run(){
	process.on( "exit", deleteTmp)
}

/** lifecycle process exit event */
function deleteTmp(){
	var files= knownFiles.map(function(file){
		return unlink(file)
	})
	var dirs= knownDirs.map(function(dir){
		return rmdir(dir)
	})
	return Promise.all(files.concat(dirs))
}

module.exports= evalModule
module.exports.evalModule= evalModule
module.exports.directory= directory

module.exports.run= run
module.exports.deleteTmp= deleteTmp
module.exports.writeOptions= writeOptions
module.exports.dirOptions= dirOptions
