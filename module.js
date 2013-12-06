(function (window, undefined) {
'use strict';

if (typeof Array.prototype.indexOf === 'undefined') {
	Array.prototype.indexOf = function (o) {
		for (var i = 0, j = this.length; i < j; i++) {
			if (this[i] === o) return i;
		}
	}
	return -1;
}
// module state: 0 loading, 1 loaded, 2 waiting, 3 ready 4 runned
var Module = {
	use: use,
	mods: {}
};
function define (id, des, fn) {
	var mod = Module.mods[id];
	if (!mod) {
		mod = Module.mods[id] = {};
	} 
	
	mod['state'] = 1;
	
	if (arguments.length === 2) { // if dependency parameter is passed in, we won't scan the factory code
		mod['factory'] = des;
		mod['des'] = getDes(des.toString());
	} else {
		mod['factory'] = fn;
		mod['des'] = des;
	}
	
};

function getDes (fnStr) {
	var m, des = [], r = /require\((['"])([^\1]+?)\1\)/mg;
	while (m = r.exec(fnStr)) {
		des.push(m[2]);
	}
	return des;
}

function use (ids, fn) {
	if (typeof ids === 'string') {
		if (arguments.length === 1) {
			require(ids);
			return;
		}
		ids = [ids];
	}

	var id = 'main' + new Date().getTime();

	define(id, ids, function (require, exports, module) {
		var args = [];
		for (var i = 0, j = ids.length; i < j; i++) {
			args.push(require(ids));
		}
		fn && fn.apply(null, args);
	});
	
	loadMod(id, function () {
		require(id);
	});
	
}

function require (id) {
	var mod = Module.mods[id];
	if (typeof mod === 'undefined' || typeof mod['factory'] === 'undefined') { return undefined; }

	if (mod.state !== 4) {
		var exports = {}, module = {}, o;
		if (typeof mod.factory === 'function') {
			o = mod.factory.call(null, require, exports, module);
			mod.factory = module.exports || o || exports;
		} 
		mod.state = 4;
		
	} 
	return mod.factory;
}

function load (url, callback, charset) {
	var script = document.createElement('script'),
		head = document.head || 
			document.getElementsByTagName('head')[0] || 
			document.documentElement;

	script.async = true;

	if (charset) { script.charset = charset; }

	if (!/.js$/i.test(url)) {
		url += '.js';
	}

	script.src = url;

	script.onerror = script.onload = script.onreadystatechange = function () {

		if (!script.readyState || /loaded|complete/.test(script.readyState)) {
			// Handle memory leak in IE
			script.onerror = script.onload = script.onreadystatechange = null;
			// Remove the script
			if ( script.parentNode ) {
				script.parentNode.removeChild( script );
			}
			// Dereference the script
			script = null;

			callback();

		}
	};
	
	head.insertBefore(script, head.firstChild);
}

function loadMod (id, callback) {
	var mod = Module.mods[id];
	if (!mod) {
		mod = Module.mods[id] = { state: 0};
		load(id, function () {	
			resolve(id, callback);
		})
	} else if (mod['state'] === 1) {
		resolve(id, callback);
	} else {
		callback(id);
	}
}

function resolve (id, callback) {
	var mod = Module.mods[id];

	if (typeof mod === 'undefined') {
		Module.mods[id] = { state: 4 };
		callback(id);
		return;
	}

	var des = mod['des']; 

	if (!des || des.length === 0) { 
		mod['state'] = 3;
		callback(id);
	} else {
		mod['state'] = 2; des = des.slice(0);
		for (var i = 0, j = des.length; i < j; i++) {
			loadMod(mod['des'][i], function (desId) {
				des.splice(des.indexOf(desId), 1);
				if (des.length === 0) {
					callback(id);
				}
			});
		}
	} 
}


window['define'] = define;
window['Module'] = Module;

})(window);