"use strict"

var
  crypto= require( "crypto"),
  fs= require( "fs"),
  memoizee= require( "memoizee"),
  path= require( "path"),
  promisify= require( "es6-promisify"),
  tmp= require( "tmp")

var
  tmpFile= promisify( tmp.file),
  tmpDir= promisify( tmp.dir),
  writeFile= promisify( fs.writeFie)

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
		return writeFile( path, writeOptions, source).then(function(){
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
	process.on( "exit", onExit)
}

/** lifecycle process exit event */
function onExit(){
	
}

module.exports= evalModule
module.exports.evalModule= evalModule
module.exports.directory= directory

module.exports.run= run
module.exports.onExit= onExit
module.exports.writeOptions= writeOptions
module.exports.dirOptions= dirOptions
