window.resizeTo(Math.round(screen.width * .8), Math.round(screen.height * .8));

window.DataProcessing = window.DP = {
  excel: {
    files: []
  }
};

window.scriptTimer = function (id, clear) {

  var now = performance.now();

  clear = clear || false;
  id = id || "main";

  if (typeof window.scriptTimer === "undefined") {

    window.scriptTimer = {};
  }

  if (typeof window.scriptTimer[id] !== "undefined") {

    var then = window.scriptTimer[id];

    if (clear) {
      
      window.scriptTimer[id] = now;
    }

    return now - then;
  }

  window.scriptTimer[id] = now;
}

String.prototype.toObject = function () {

  try {

    var obj_str = this.toString(),
        obj = window;

    obj_str = obj_str.split('#')[0].split('.');

    for (var i = 0; i < obj_str.length; i++) obj = obj[obj_str[i]];

    return obj;
  } catch (e) {return false;}
};

String.prototype.toKey = function () {

  return this.toString().split('#')[1] || undefined;
};

String.prototype.dashedCase = function () {

  return this.toString().replace(/(.[A-Z])/g, function (all, letters) {

  	return letters[0] + '-' + letters[1].toLowerCase();
	});
};

String.prototype.unCamelCase = function (charcter, titlelize) {

  return this.toString().replace(/(.[A-Z])/g, function (all, letters) {

  	return letters[0] + (charcter || '-') + letters[1].toLowerCase().replace(/\w\S*/g, function (text) {

    	return titlelize? text.charAt(0).toUpperCase() + text.substr(1).toLowerCase(): text;
    });
	});
};

String.prototype.camelCase = function () {

  return this.toString().replace(/([ _\-][A-Z])/gi, function (all, letters) {

  	return letters[1].toUpperCase();
	});
};

String.prototype.unserialize = function () {

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

String.prototype.isBoolean = function () {

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

String.prototype.toBoolean = function () {

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

String.prototype.isNumber = function () {

  try {

    var str = this.trim().replace(/^0+(?=\d)/, '').replace(/\.?0+$/,""),
        int = parseInt(str),
        float = parseFloat(str);

    if (int + '' === str) return true;
    if (float + '' === str) return true;
  } catch (e) {}

  return false;
};

String.prototype.toNumber = function () {

  try {

    var str = this.trim().replace(/^0+(?=\d)/, '').replace(/\.?0+$/,""),
        int = parseInt(str),
        float = parseFloat(str);

    if (int + '' == str) return int;
    if (float + '' == str) return float;
  } catch (e) {}

  return 0;
};

String.prototype.isType = function () {

  if (this.isBoolean()) return "boolean";
  if (this.isNumber()) return "number";

  return "string";
};

// ToDo: make own page in app, allow uploading of files.
var cell_references_regex = /(['][^']+['][!]([$A-Z]+[$0-9]+|[$A-Z]+:[$A-Z]+)|([$A-Z]+[$0-9]+|[$A-Z]+:[$A-Z]+))/g,
    object_references_regex = /(\[[a-zA-Z0-9 #&\?]+\]\[[a-zA-Z0-9 #&\?]+\])/g;

function handleLoad (e) {

  var href = decodeURIComponent(e.target.href.replace('.txt', '')).split('/'),
      file = href[href.length -1];

  DP.excel.files.push(file);
  data = d3.tsvParse(e.path[0].import.querySelector('body').textContent);

  DP.excel[file] = data;
  data = {};

  DP.excel[file].columns.forEach(function (val, index) {

    data[columnToLetter(index + 1)] = val;
  });

  DP.excel[file].column_to_letter = data;

  if (DP.excel.files.length > 3) startDataCrunch();
}

function columnToLetter (column) {

  var temp, letter = '';

  while (column > 0) {

    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }

  return letter;
}

function startDataCrunch () {

  DP.excel['Account&WirelessSummary'].column_to_letter.AE = DP.excel['Account&WirelessSummary'].column_to_letter.A;
  DP.excel['Account&WirelessSummary'].column_to_letter.AF = DP.excel['Account&WirelessSummary'].column_to_letter.B;

  delete DP.excel['Account&WirelessSummary'].column_to_letter.A;
  delete DP.excel['Account&WirelessSummary'].column_to_letter.B;

  DP.excel.files.forEach(eachFile);

  output()
}

_.right = function (str, len) {

  len = len || str.length;

  return str.slice(-len)
}

_.left = function (str, len) {

  len = len || str.length;

  return str.slice(0, len)
}

_.pluck = function (obj, func) {

  return _.first(_.values(_.pick(_.first(obj), func)));
}

_.and = function () {

  return Array.from(arguments).every(function (item) {

    return !_.isEmpty(item);
  });
}
_.or = function () {

  return _.filter(arguments, function (item) {

    return !_.isEmpty(item);
  });
};

function eachFile (file) {

//console.error("file: " + file);
  for (var property in DP.excel[file][0]) {

    if (DP.excel[file][0].hasOwnProperty(property) && DP.excel[file][0][property] && DP.excel[file][0][property][0] === '=') {

//console.debug("property: " + property);
      DP.excel[file][0][property] = replaceProperties(file, DP.excel[file], property);

      var property_str = DP.excel[file][0][property];

      DP.excel[file][0][property] = excelFormulaUtilities.formatFormula(DP.excel[file][0][property]).replace(/"\{/g, '{').replace(/\}"/g, '}').replace(/\}\s*(\/|\+|\-)\s*\{/g, '},"$1",{').replace(/\}\s*(=|\<>|\-)\s*([^"]*)"/g, ',"$1": "$2"}');

      try {
        
        try {

          DP.excel[file][0][property] = JSON.parse(DP.excel[file][0][property]);
        } catch (e) {

          DP.excel[file][0][property] = JSON.parse('[' + DP.excel[file][0][property] + ']');
        }
      } catch (e) {
        
        DP.excel[file][0][property] = property_str.replace('=', '');
      }
//console.log(DP.excel[file][0][property]);
    }
  }
}

function output () {

//console.log(DP.excel);
console.log(JSON.stringify(DP.excel).replace(/\\"/g, "'"));
}

function replaceProperties (file, obj, property) {

  return obj[0][property].replace(cell_references_regex, function (cell_reference) {
          
    var cell_reference_array = cell_reference.replace(/['$]/g, '').split('!'),
        columns = cell_reference_array.pop().replace(/[^A-Z:]/g, '').split(':'),
        column_one = columns.shift(),
        column_two = columns.shift() || false,
        sheet = cell_reference_array.pop() || file,
        column_one_output = columnOutpuStr(column_one, sheet),
        output_str = (column_two && column_two !== column_one)? column_one_output + ':' + columnOutpuStr(column_two, sheet): column_one_output; 

    return output_str;
  });
}

function columnOutpuStr (column, sheet) {

  return "@'" + sheet + "." + (DP.excel[sheet].column_to_letter[column] || column) + "'";
}
