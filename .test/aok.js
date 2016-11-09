#!/usr/bin/env node
"use strict"

var
  aok= require( "../.example/aok"),
  tape= require( "tape")

tape( "aok is ok", function(t){
	t.plan( 1)
	var module= aok()
	module.then(function( module){
		t.equals( module.a, "ok", "aok")
		t.end()
	})
})
