modulejs
========

It's a small library to support nodejs style coding in browser javascript environment

*It's compatible with commonjs module spec, see http://wiki.commonjs.org/wiki/Modules/1.1*

```
	define(id, [des], factory);
	Module.use(ids, callback);
	
	//Example
	define('./b', function (require, exports, module) {
		module.exports = { name: 'Tony' }
	});
	define('./a', function (require, exports, module) {
		var b = require('./b');
		return { say: function () {
			console.log(b.name);
			} 
		}
	});
	
	Module.use('./a', function (a) {
		a.say(); // Tony
	});
```

*What about CMD&AMD... Writing this just for fun lol...Surely Seajs and RequireJS are much more powerful*