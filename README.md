# Eval Module

Create a new module dynamically, at runtime, from source.

```
var dynamicModule= require("eval-module")("module.exports= {a: 'ok'}")
console.log(dynamicModule.a) //=> ok
```

Try it! `./.example/aok` or `./.test/aok.js`!

# Implementation

The implementation is the only possible thing I could think up, which is using temporary files/directories. EvalModule tracks all creations and cleans up those sources at the process exit event.
