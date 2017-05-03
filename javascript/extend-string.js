(function (global, string) {
  "use strict";

  string.prototype.toObject = function () {
  
    try {
  
      var objStr = this.toString(),
          obj = window;
  
      objStr = objStr.split('#')[0].split('.');
  
      for (var i = 0; i < objStr.length; i++) obj = obj[objStr[i]];
  
      return obj;
    } catch (e) {return false;}
  };
  
  string.prototype.toKey = function () {
  
    return this.toString().split('#')[1] || undefined;
  };
  
  string.prototype.dashedCase = function () {
  
    return this.toString().replace(/(.[A-Z])/g, function (all, letters) {
  
    	return letters[0] + '-' + letters[1].toLowerCase();
  	});
  };
  
  string.prototype.unCamelCase = function (charcter, titlelize) {
  
    return this.toString().replace(/(.[A-Z])/g, function (all, letters) {
  
    	return letters[0] + (charcter || '-') + letters[1].toLowerCase().replace(/\w\S*/g, function (text) {
  
      	return titlelize? text.charAt(0).toUpperCase() + text.substr(1).toLowerCase(): text;
      });
  	});
  };
  
  string.prototype.camelCase = function () {
  
    return this.toString().replace(/([ _\-][A-Z])/gi, function (all, letters) {
  
    	return letters[1].toUpperCase();
  	});
  };
  
  string.prototype.unserialize = function () {
  
  	var str = decodeURI(this),
  	    pairs = str.split('&'),
  	    obj = {}, p, idx, ind;
  
  	for (var i = 0; i < pairs.length; i++) {
  
  		p = pairs[i].split('=');
  		idx = p[0];
  
  		if (idx.indexOf("[]") == (idx.length - 2)) {
  
  			ind = idx.substring(0, idx.length - 2)
  
  			if (obj[ind] === undefined) obj[ind] = [];
  
  			obj[ind].push(p[1]);
  		} else {
  
  			obj[idx] = p[1];
  		}
  	}
  
  	return obj;
  };
  
  string.prototype.isBoolean = function () {
  
    try {
  
      switch (this.trim().toLowerCase()) {
  
        case "true":
        case "yes":
        case "y":
        case true:
          return true;
      }
    } catch (e) {}
  
    return false;
  };
  
  string.prototype.toBoolean = function () {
  
    try {
  
      switch (this.trim().toLowerCase()) {
  
        case "true":
        case "yes":
        case "y":
        case true:
          return true;
  
        case "false":
        case "no":
        case "n":
        case false:
        case null:
        case undefined:
        case NaN:
          return false;
      }
    } catch (e) {}
  
    return false;
  };
  
  string.prototype.isNumber = function () {
  
    try {
  
      var str = this.trim().replace(/^0+(?=\d)/, '').replace(/\.?0+$/,""),
          int = parseInt(str),
          float = parseFloat(str);
  
      if (int + '' === str) return true;
      if (float + '' === str) return true;
    } catch (e) {}
  
    return false;
  };
  
  string.prototype.toNumber = function () {
  
    try {
  
      var str = this.trim().replace(/^0+(?=\d)/, '').replace(/(\.[0-9]*?)0+$/, "$1").replace(/\.$/, ""),
          int = parseInt(str),
          float = parseFloat(str);
  
      if (int + '' == str) return int;
      if (float + '' == str) return float;
    } catch (e) {}
  
    return 0;
  };
  
  string.prototype.isType = function () {
  
    if (this.isBoolean()) return "boolean";
    if (this.isNumber()) return "number";
  
    return "string";
  };
})(window, String);